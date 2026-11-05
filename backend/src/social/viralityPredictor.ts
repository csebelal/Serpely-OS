/**
 * Sincly Autonomous AI Marketing OS — Predictive Virality & Smart Timing Engine
 * Modeled after FeedHive's AI post conditioning & viral prediction algorithms.
 * Calculates pre-publishing virality score (1-100), hook strength, readability,
 * and optimal audience engagement minute per platform.
 */

import { SocialPagePlatform } from '../types';

export interface ViralityBreakdown {
  hookScore: number;
  readabilityScore: number;
  engagementScore: number;
  hashtagScore: number;
}

export interface SmartTimingRecommendation {
  dayOfWeek: string;
  recommendedTime: string;
  peakWindowLabel: string;
  audienceInsight: string;
}

export interface ViralityPredictionResult {
  overallScore: number;
  viralityTier: 'high_viral' | 'strong' | 'moderate' | 'needs_boost';
  tierLabel: string;
  tierBadgeColor: string;
  breakdown: ViralityBreakdown;
  smartTiming: SmartTimingRecommendation;
  suggestions: string[];
  polishedContent?: string;
}

// Peak Engagement Windows per Platform (Global algorithmic heuristics)
const PLATFORM_SMART_TIMING: Record<SocialPagePlatform, SmartTimingRecommendation> = {
  LinkedIn: {
    dayOfWeek: 'Tuesday',
    recommendedTime: '8:45 AM',
    peakWindowLabel: 'Peak B2B Decision-Maker Morning Window',
    audienceInsight:
      'C-suite and VP-level executives check LinkedIn feeds between 8:15 AM - 9:30 AM before their first daily meetings.'
  },
  Facebook: {
    dayOfWeek: 'Thursday',
    recommendedTime: '7:30 PM',
    peakWindowLabel: 'Evening Leisure & Community Discussions',
    audienceInsight:
      'Community engagement, link clicks, and post comments spike on Thursday evenings as work-week pressure winds down.'
  },
  Instagram: {
    dayOfWeek: 'Thursday',
    recommendedTime: '6:15 PM',
    peakWindowLabel: 'Commute & Visual Discovery Peak',
    audienceInsight:
      'Visual carousel swipes, saves, and story shares peak during evening transit and post-work relaxation.'
  },
  X: {
    dayOfWeek: 'Wednesday',
    recommendedTime: '12:15 PM',
    peakWindowLabel: 'Lunchtime Retweet & Thought Leadership Peak',
    audienceInsight:
      'High conversational velocity: Tech and business founders scroll micro-threads and news during midday breaks.'
  },
  YouTube: {
    dayOfWeek: 'Friday',
    recommendedTime: '3:00 PM',
    peakWindowLabel: 'Weekend Watchlist Primer',
    audienceInsight:
      'Publishing 2-3 hours before Friday evening gives YouTube algorithms time to index and push your content into weekend home feeds.'
  },
  Threads: {
    dayOfWeek: 'Wednesday',
    recommendedTime: '11:30 AM',
    peakWindowLabel: 'Midday Conversational Threads Peak',
    audienceInsight:
      'Meta Threads algorithm rewards early replies and conversational questions between 11:00 AM - 1:00 PM and evening leisure at 7:00 PM.'
  },
  Bluesky: {
    dayOfWeek: 'Monday',
    recommendedTime: '2:15 PM',
    peakWindowLabel: 'Decentralized Tech & Open Web Discourse Window',
    audienceInsight:
      'Bluesky chronological and custom algorithmic feeds see highest repost and quote activity on weekday afternoons for open web, tech, and builder insights.'
  },
  TikTok: {
    dayOfWeek: 'Thursday',
    recommendedTime: '8:00 PM',
    peakWindowLabel: 'Evening Viral Sound & Discovery Wave',
    audienceInsight:
      'Short-form video completion rates and sound-driven discovery peak between 7:30 PM - 10:00 PM on Thursday and Friday evenings.'
  },
  Pinterest: {
    dayOfWeek: 'Saturday',
    recommendedTime: '9:00 PM',
    peakWindowLabel: 'Weekend Visual Search & Board Planning Window',
    audienceInsight:
      'Pinterest pinners search and save actionable infographics, workflows, and visual guides heavily on weekend evenings (8:00 PM - 11:00 PM).'
  }
};

/**
 * Computes Hook Strength (0-100) based on opening 140 characters
 */
function computeHookStrength(text: string): { score: number; tips: string[] } {
  const tips: string[] = [];
  const opening = text.slice(0, 140).toLowerCase();

  let score = 50;

  // 1. Curiosity Gaps & Power Verbs
  const powerHooks = [
    'why',
    'how to',
    'the secret',
    'stop',
    'mistake',
    'truth',
    'nobody',
    'unpopular',
    'blueprint',
    'never',
    'eliminate',
    'guarantee',
    'costly',
    'here is why'
  ];
  const matchedHooks = powerHooks.filter(h => opening.includes(h));
  if (matchedHooks.length > 0) {
    score += Math.min(25, matchedHooks.length * 12);
  } else {
    tips.push('Open with a stronger hook verb (e.g. "Why", "The cost of", "Stop making") in the first sentence.');
  }

  // 2. Metrics, Percentages, and Numbers
  const hasNumbers = /\d+%|\d+\.\d+x|\$\d+|\d+\s*(steps|ways|rules|reasons|mistakes)/i.test(opening);
  if (hasNumbers) {
    score += 15;
  } else {
    tips.push('Add specific numbers or metrics (e.g., "3.4x", "99.9%", "3 rules") to boost initial authority.');
  }

  // 3. Contrarian Hook
  const hasContrarian = /unpopular opinion|hot take|most (people|leaders|teams) (think|believe|get)|dead wrong/i.test(
    opening
  );
  if (hasContrarian) {
    score += 15;
  }

  return {
    score: Math.min(99, Math.max(20, score)),
    tips
  };
}

/**
 * Computes Readability & Skimmability (0-100)
 */
function computeReadability(text: string): { score: number; tips: string[] } {
  const tips: string[] = [];
  let score = 60;

  const lines = text.split('\n');
  const emptyLines = lines.filter(l => !l.trim()).length;
  const hasBullets = /^[-*•✦1-9]\s+/m.test(text);
  const words = text.trim().split(/\s+/).filter(Boolean);

  // Rewards healthy spacing (1 empty line per 2-3 lines of text)
  if (emptyLines >= 2) {
    score += 15;
  } else if (text.length > 200 && emptyLines === 0) {
    score -= 25;
    tips.push('Break continuous paragraphs with double line breaks to prevent "wall-of-text" dropoff.');
  }

  // Rewards structured bullets
  if (hasBullets) {
    score += 15;
  } else if (words.length > 60) {
    tips.push('Add bullet points (• or 1, 2, 3) to summarize key takeaways for fast mobile scrollers.');
  }

  // Emoji balance (2-6 is sweet spot)
  const emojiMatches = text.match(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/gu) || [];
  if (emojiMatches.length >= 2 && emojiMatches.length <= 6) {
    score += 10;
  } else if (emojiMatches.length > 15) {
    score -= 10;
    tips.push('Reduce emoji density: too many emojis look spammy and lower enterprise credibility.');
  }

  return {
    score: Math.min(98, Math.max(30, score)),
    tips
  };
}

/**
 * Computes Audience Engagement & CTA Catalysts (0-100)
 */
function computeEngagement(text: string): { score: number; tips: string[] } {
  const tips: string[] = [];
  let score = 55;

  const hasQuestion = /\?/m.test(text);
  if (hasQuestion) {
    score += 18;
  } else {
    tips.push('End with a direct, thought-provoking question to invite audience comments.');
  }

  const ctaPatterns = [
    'comment below',
    'save this',
    'bookmark',
    'share your',
    'agree or disagree',
    'send us a message',
    'link in bio',
    'dm us',
    'follow for'
  ];
  const matchedCtas = ctaPatterns.filter(c => text.toLowerCase().includes(c));
  if (matchedCtas.length > 0) {
    score += 20;
  } else {
    tips.push('Include a clear call-to-action (e.g. "Save for your quarterly planning 📌" or "Comment below").');
  }

  return {
    score: Math.min(99, Math.max(25, score)),
    tips
  };
}

/**
 * Computes Hashtag Optimization Score (0-100)
 */
function computeHashtags(
  text: string,
  platform: SocialPagePlatform,
  explicitHashtags: string[] = []
): { score: number; tips: string[] } {
  const tips: string[] = [];
  const inlineHashtags = (text.match(/#[a-zA-Z0-9_]+/g) || []);
  const allHashtags = Array.from(new Set([...inlineHashtags, ...explicitHashtags]));
  const count = allHashtags.length;

  let score = 70;

  if (platform === 'LinkedIn') {
    if (count >= 3 && count <= 5) score = 96;
    else if (count === 0) {
      score = 45;
      tips.push('Add 3-5 focused hashtags for LinkedIn search indexation.');
    } else if (count > 7) {
      score = 65;
      tips.push('Avoid hashtag stuffing: LinkedIn algorithm penalizes posts with >6 hashtags.');
    }
  } else if (platform === 'X') {
    if (count >= 1 && count <= 2) score = 95;
    else if (count > 3) {
      score = 55;
      tips.push('Keep X hashtags to 1-2 max; tweets with 3+ hashtags get 17% fewer retweets.');
    }
  } else if (platform === 'Instagram') {
    if (count >= 5 && count <= 12) score = 95;
    else if (count < 3) {
      score = 60;
      tips.push('Instagram posts reach 3x more discover accounts with 5-10 niche hashtags.');
    }
  } else if (platform === 'Threads') {
    if (count >= 1 && count <= 2) score = 95;
    else if (count > 3) {
      score = 65;
      tips.push('Threads algorithm prioritizes conversational plain text; keep hashtags to 1-2 focused tags.');
    }
  } else if (platform === 'TikTok') {
    if (count >= 3 && count <= 5) score = 95;
    else if (count < 2) {
      score = 60;
      tips.push('TikTok FYP distribution benefits from 3-5 trending niche tags (e.g. #TechTips #ITSecurity).');
    }
  } else if (platform === 'Pinterest') {
    if (count >= 2 && count <= 4) score = 96;
    else if (count > 5) {
      score = 65;
      tips.push('Pinterest SEO is keyword-driven; 2-4 category hashtags work best with high-intent board titles.');
    }
  } else if (platform === 'Bluesky') {
    if (count >= 1 && count <= 2) score = 95;
    else if (count > 3) {
      score = 70;
      tips.push('Bluesky custom feeds are topic-indexed; 1-2 community tags maximize federated discoverability.');
    }
  }

  return {
    score: Math.min(98, Math.max(30, score)),
    tips
  };
}

/**
 * Generates an Auto-Polished High-Virality Version of the Content
 */
function generatePolishedContent(content: string, platform: SocialPagePlatform): string {
  const lines = content.trim().split('\n').filter(Boolean);
  if (lines.length === 0) return content;

  let hook = lines[0];
  // Polish hook if plain
  if (!hook.includes('?') && !hook.includes(':') && !hook.includes('🚀')) {
    hook = `🚀 ${hook}`;
  }

  // Format middle content with clear bullet formatting
  const middle = lines.slice(1, -1);
  const formattedMiddle = middle
    .map(line => {
      const trimmed = line.trim();
      if (/^\d+\./.test(trimmed) || trimmed.startsWith('•') || trimmed.startsWith('-')) {
        return trimmed;
      }
      return `${trimmed}\n`;
    })
    .join('\n');

  // Ensure strong CTA
  let cta = lines[lines.length - 1];
  if (!cta.includes('?') && !cta.toLowerCase().includes('comment') && !cta.toLowerCase().includes('save')) {
    cta = `${cta}\n\n💬 What has been your team's experience with this? Drop your thoughts below!`;
  }

  return `${hook}\n\n${formattedMiddle || ''}\n\n${cta}`.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Primary Virality & Smart Timing Evaluator
 */
export function predictPostVirality(params: {
  platform: SocialPagePlatform;
  content: string;
  hashtags?: string[];
}): ViralityPredictionResult {
  const { platform, content = '', hashtags = [] } = params;

  if (!content.trim()) {
    return {
      overallScore: 35,
      viralityTier: 'needs_boost',
      tierLabel: 'Draft Empty',
      tierBadgeColor: 'text-neutral-400 bg-neutral-800 border-neutral-700',
      breakdown: {
        hookScore: 20,
        readabilityScore: 30,
        engagementScore: 25,
        hashtagScore: 40
      },
      smartTiming: PLATFORM_SMART_TIMING[platform] || PLATFORM_SMART_TIMING.LinkedIn,
      suggestions: ['Write or generate your post caption to see real-time virality predictions.']
    };
  }

  const hook = computeHookStrength(content);
  const readability = computeReadability(content);
  const engagement = computeEngagement(content);
  const hashtagEval = computeHashtags(content, platform, hashtags);

  // Platform-weighted overall score
  let weighted =
    hook.score * 0.35 +
    readability.score * 0.25 +
    engagement.score * 0.25 +
    hashtagEval.score * 0.15;

  const overallScore = Math.round(Math.min(99, Math.max(15, weighted)));

  let viralityTier: ViralityPredictionResult['viralityTier'] = 'needs_boost';
  let tierLabel = 'Needs Optimization';
  let tierBadgeColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';

  if (overallScore >= 88) {
    viralityTier = 'high_viral';
    tierLabel = '🔥 High Viral Probability (Top 5% Reach)';
    tierBadgeColor = 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40';
  } else if (overallScore >= 74) {
    viralityTier = 'strong';
    tierLabel = '🚀 Strong Performer (High Engagement)';
    tierBadgeColor = 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40';
  } else if (overallScore >= 60) {
    viralityTier = 'moderate';
    tierLabel = '⚡ Moderate Reach (Solid Baseline)';
    tierBadgeColor = 'text-blue-300 bg-blue-500/20 border-blue-500/40';
  }

  const allSuggestions = [
    ...hook.tips,
    ...readability.tips,
    ...engagement.tips,
    ...hashtagEval.tips
  ].slice(0, 3);

  return {
    overallScore,
    viralityTier,
    tierLabel,
    tierBadgeColor,
    breakdown: {
      hookScore: hook.score,
      readabilityScore: readability.score,
      engagementScore: engagement.score,
      hashtagScore: hashtagEval.score
    },
    smartTiming: PLATFORM_SMART_TIMING[platform] || PLATFORM_SMART_TIMING.LinkedIn,
    suggestions:
      allSuggestions.length > 0
        ? allSuggestions
        : ['Post is well structured with solid hook and clear call-to-action!'],
    polishedContent: generatePolishedContent(content, platform)
  };
}
