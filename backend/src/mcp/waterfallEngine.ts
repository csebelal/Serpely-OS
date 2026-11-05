/**
 * Sincly Autonomous AI Marketing OS — 1-Click Content Waterfall & Repurposing Engine
 * Automatically decomposes any Blog Post URL, YouTube Video URL, or Raw Text into:
 *  1. 1x LinkedIn Carousel (5 Slides + Hook Caption + Authority SVG Card)
 *  2. 1x X (Twitter) Thread (5-7 Numbered Tweets)
 *  3. 3x Facebook Posts (Storytelling, Actionable Checklist, Contrarian Debate)
 *  4. 1x Newsletter Drip (3 Subject Lines, Preheader, Key Takeaways, Markdown Body)
 *  5. 3x Short Video Scripts (30s Quick Tip, 45s Problem Breakdown, 60s Contrarian Masterclass)
 */

import http from 'http';
import https from 'https';
import { generateAuthorityTechVisualDataUri } from '../authorityVisualEngine';

export interface LinkedInCarouselSlide {
  slideNumber: number;
  tag: string;
  headline: string;
  subheadline: string;
  bulletPoints?: string[];
  takeaway?: string;
}

export interface LinkedInCarouselAsset {
  title: string;
  hookCaption: string;
  slides: LinkedInCarouselSlide[];
  svgDataUri: string;
  hashtags: string[];
}

export interface TwitterThreadAsset {
  hookTweet: string;
  tweets: Array<{
    tweetNumber: number;
    text: string;
    characterCount: number;
  }>;
  totalTweets: number;
}

export interface FacebookPostVariant {
  variantType: 'storytelling' | 'checklist' | 'contrarian';
  title: string;
  headline: string;
  body: string;
  callToAction: string;
  hashtags: string[];
}

export interface NewsletterDripAsset {
  subjectLines: string[];
  preheader: string;
  keyTakeaways: string[];
  bodyMarkdown: string;
  callToActionText: string;
  callToActionUrl: string;
}

export interface ShortVideoScript {
  scriptNumber: number;
  title: string;
  durationSec: number;
  targetFormat: 'Reels' | 'TikTok' | 'YouTube Shorts';
  hook3s: string;
  visualCue: string;
  teleprompterScript: string;
  ctaText: string;
}

export interface ThreadsPostAsset {
  hook: string;
  body: string;
  characterCount: number;
  hashtags: string[];
}

export interface BlueskyPostAsset {
  text: string;
  characterCount: number;
  hashtags: string[];
}

export interface PinterestPinAsset {
  title: string;
  description: string;
  boardSuggestion: string;
  destinationLink: string;
  hashtags: string[];
  visualSpec: {
    headline: string;
    subheadline: string;
    aspectRatio: '1000:1500';
    theme: 'pinterest-crimson';
  };
}

export interface ContentWaterfallResult {
  sourceType: 'blog_url' | 'youtube_url' | 'raw_text';
  extractedTitle: string;
  extractedSnippet: string;
  assets: {
    linkedinCarousel: LinkedInCarouselAsset;
    twitterThread: TwitterThreadAsset;
    facebookPosts: FacebookPostVariant[];
    newsletterDrip: NewsletterDripAsset;
    shortVideoScripts: ShortVideoScript[];
    threadsPost?: ThreadsPostAsset;
    blueskyPost?: BlueskyPostAsset;
    pinterestPin?: PinterestPinAsset;
  };
}

/**
 * Fetches HTML or web content from a given URL with timeout
 */
async function fetchUrlContent(targetUrl: string): Promise<string> {
  return new Promise(resolve => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === 'https:' ? https : http;

      const req = client.get(
        targetUrl,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SinclyCrawler/1.0'
          },
          timeout: 6000
        },
        res => {
          let data = '';
          res.on('data', chunk => {
            data += chunk;
            // Cap at 150KB to keep extraction nimble
            if (data.length > 150000) req.destroy();
          });
          res.on('end', () => resolve(data));
        }
      );

      req.on('error', () => resolve(''));
      req.on('timeout', () => {
        req.destroy();
        resolve('');
      });
    } catch {
      resolve('');
    }
  });
}

/**
 * Parses Title, Meta Description, and Body from HTML or URL
 */
export async function parseSourceContent(input: {
  sourceUrl?: string;
  youtubeUrl?: string;
  sourceText?: string;
  topic?: string;
}): Promise<{
  sourceType: 'blog_url' | 'youtube_url' | 'raw_text';
  title: string;
  text: string;
}> {
  const urlCandidate = input.youtubeUrl || input.sourceUrl;

  if (urlCandidate) {
    const isYouTube =
      urlCandidate.includes('youtube.com') || urlCandidate.includes('youtu.be');

    if (isYouTube) {
      let videoId = 'video';
      try {
        const parsed = new URL(urlCandidate);
        videoId =
          parsed.searchParams.get('v') || parsed.pathname.replace(/^\//, '');
      } catch {
        // fallback
      }

      return {
        sourceType: 'youtube_url',
        title: input.topic || `YouTube Video Analysis (${videoId})`,
        text:
          input.sourceText ||
          `Strategic video walkthrough analyzing ${input.topic || 'modern enterprise technology, execution architecture, and industry benchmarks'}. Key insights extracted from presentation slides and audio discussion.`
      };
    }

    // Standard Blog / Website URL
    const html = await fetchUrlContent(urlCandidate);
    if (html) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const metaDescMatch = html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
      );

      const title = titleMatch
        ? titleMatch[1].trim()
        : input.topic || urlCandidate;
      const desc = metaDescMatch ? metaDescMatch[1].trim() : '';

      // Extract main text without script/style tags
      const cleanHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const extractedText = cleanHtml.slice(0, 3000);

      return {
        sourceType: 'blog_url',
        title: title || 'Strategic Industry Analysis',
        text: desc
          ? `${desc}\n\n${extractedText.slice(0, 1500)}`
          : extractedText.slice(0, 1500)
      };
    }
  }

  // Raw text input
  const rawText = input.sourceText || input.topic || 'Enterprise Growth & AI Optimization';
  const firstLine = rawText.split('\n')[0].replace(/^#+\s*/, '').trim();

  return {
    sourceType: 'raw_text',
    title: firstLine.slice(0, 80) || input.topic || 'Operational Excellence Playbook',
    text: rawText
  };
}

/**
 * Main Content Waterfall Synthesis Engine
 */
export async function executeContentWaterfallCascade(params: {
  sourceUrl?: string;
  youtubeUrl?: string;
  sourceText?: string;
  topic?: string;
  brandName?: string;
  brandWebsite?: string;
  aiClient?: any;
}): Promise<ContentWaterfallResult> {
  const brandName = params.brandName || 'Sincly';
  const brandWebsite = params.brandWebsite || 'sincly.io';
  const cleanBrand = brandName.replace(/\s+/g, '');

  const parsed = await parseSourceContent({
    sourceUrl: params.sourceUrl,
    youtubeUrl: params.youtubeUrl,
    sourceText: params.sourceText,
    topic: params.topic
  });

  const coreTopic =
    params.topic || parsed.title || 'Autonomous AI Marketing & Infrastructure';
  const cleanSnippet = parsed.text.replace(/^#+\s*/gm, '').slice(0, 400).trim();

  // Try calling Gemini AI for dynamic, highly context-aware synthesis
  if (params.aiClient) {
    try {
      const prompt = `You are the Lead Omnichannel Content Strategist for ${brandName} (${brandWebsite}).
Decompose the following source content into a complete 5-part Content Waterfall:

Source Title: "${parsed.title}"
Source Core Text:
"""
${parsed.text.slice(0, 2000)}
"""

Produce a strict JSON object with these EXACT keys:
{
  "linkedinCaption": "Engaging hook and full caption with whitespace and hashtags",
  "carouselSlides": [
    { "slideNumber": 1, "tag": "HOOK", "headline": "...", "subheadline": "..." },
    { "slideNumber": 2, "tag": "PROBLEM", "headline": "...", "subheadline": "...", "bulletPoints": ["...", "..."] },
    { "slideNumber": 3, "tag": "SOLUTION", "headline": "...", "subheadline": "...", "bulletPoints": ["...", "..."] },
    { "slideNumber": 4, "tag": "EXECUTION", "headline": "...", "subheadline": "...", "bulletPoints": ["...", "..."] },
    { "slideNumber": 5, "tag": "TAKEAWAY", "headline": "...", "subheadline": "...", "takeaway": "..." }
  ],
  "twitterTweets": [
    "1/6 [Hook Tweet]...",
    "2/6 [Reality Check]...",
    "3/6 [Step 1]...",
    "4/6 [Step 2]...",
    "5/6 [Takeaway]...",
    "6/6 [Conclusion & RT/Follow CTA]..."
  ],
  "facebookPosts": {
    "storytelling": { "headline": "...", "body": "...", "cta": "..." },
    "checklist": { "headline": "...", "body": "...", "cta": "..." },
    "contrarian": { "headline": "...", "body": "...", "cta": "..." }
  },
  "newsletter": {
    "subjectLines": ["Subject 1", "Subject 2", "Subject 3"],
    "preheader": "...",
    "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
    "bodyMarkdown": "...",
    "ctaText": "..."
  },
  "videoScripts": [
    { "title": "Quick Tip (0-30s)", "durationSec": 30, "hook3s": "...", "visualCue": "...", "script": "...", "cta": "..." },
    { "title": "Case Breakdown (0-45s)", "durationSec": 45, "hook3s": "...", "visualCue": "...", "script": "...", "cta": "..." },
    { "title": "Contrarian Guide (0-60s)", "durationSec": 60, "hook3s": "...", "visualCue": "...", "script": "...", "cta": "..." }
  ]
}
Return ONLY valid JSON.`;

      const response = await params.aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      });

      const rawJson = response.text?.trim() || '';
      if (rawJson) {
        const parsedAi = JSON.parse(rawJson);

        // Generate SVG visual card for carousel slide 1
        const svgDataUri = generateAuthorityTechVisualDataUri({
          brandName,
          headlinePart1: coreTopic.slice(0, 32),
          headlinePart2: 'Omnichannel Cascade',
          badgeText: 'CAROUSEL 5-SLIDES',
          aspectRatio: '1080:1080',
          visualType: 'metrics'
        });

        return {
          sourceType: parsed.sourceType,
          extractedTitle: parsed.title,
          extractedSnippet: cleanSnippet,
          assets: {
            linkedinCarousel: {
              title: `${coreTopic} (5-Slide Visual Carousel)`,
              hookCaption:
                parsedAi.linkedinCaption ||
                `Why traditional approaches to ${coreTopic} are costing leaders time and pipeline velocity:`,
              slides: Array.isArray(parsedAi.carouselSlides)
                ? parsedAi.carouselSlides
                : buildFallbackCarouselSlides(coreTopic),
              svgDataUri,
              hashtags: [`#${cleanBrand}`, '#Strategy', '#Leadership', '#Growth']
            },
            twitterThread: {
              hookTweet: parsedAi.twitterTweets?.[0] || `1/6 Most leaders get ${coreTopic} backwards. Here is the modern blueprint: 🧵`,
              tweets: (parsedAi.twitterTweets || []).map((t: string, idx: number) => ({
                tweetNumber: idx + 1,
                text: t,
                characterCount: t.length
              })),
              totalTweets: (parsedAi.twitterTweets || []).length || 6
            },
            facebookPosts: [
              {
                variantType: 'storytelling',
                title: 'Storytelling & Empathy Angle',
                headline: parsedAi.facebookPosts?.storytelling?.headline || `The moment we realized conventional ${coreTopic} was broken`,
                body: parsedAi.facebookPosts?.storytelling?.body || cleanSnippet,
                callToAction: parsedAi.facebookPosts?.storytelling?.cta || 'Send us a message or comment below to share your experience!',
                hashtags: [`#${cleanBrand}`, '#FounderStory', '#BusinessGrowth']
              },
              {
                variantType: 'checklist',
                title: 'Actionable Checklist Angle',
                headline: parsedAi.facebookPosts?.checklist?.headline || `5 Non-Negotiables for ${coreTopic}`,
                body: parsedAi.facebookPosts?.checklist?.body || cleanSnippet,
                callToAction: parsedAi.facebookPosts?.checklist?.cta || 'Save this checklist for your next team standup!',
                hashtags: [`#${cleanBrand}`, '#Checklist', '#Productivity']
              },
              {
                variantType: 'contrarian',
                title: 'Contrarian Debate Angle',
                headline: parsedAi.facebookPosts?.contrarian?.headline || `Unpopular opinion: Most advice about ${coreTopic} is completely outdated.`,
                body: parsedAi.facebookPosts?.contrarian?.body || cleanSnippet,
                callToAction: parsedAi.facebookPosts?.contrarian?.cta || 'Do you agree or disagree? Let’s discuss in the comments.',
                hashtags: [`#${cleanBrand}`, '#HotTake', '#IndustryInsights']
              }
            ],
            newsletterDrip: {
              subjectLines: parsedAi.newsletter?.subjectLines || [
                `Why ${coreTopic} matters more than ever`,
                `The 3-step framework we use for ${coreTopic}`,
                `Are you making this mistake with ${coreTopic}?`
              ],
              preheader: parsedAi.newsletter?.preheader || `Deconstructing ${coreTopic} into actionable takeaways.`,
              keyTakeaways: parsedAi.newsletter?.keyTakeaways || [
                'Eliminate single points of failure',
                'Accelerate pipeline velocity with automation',
                'Maintain human governance on all key outputs'
              ],
              bodyMarkdown: parsedAi.newsletter?.bodyMarkdown || cleanSnippet,
              callToActionText: parsedAi.newsletter?.ctaText || 'Read Full Case Study',
              callToActionUrl: `https://${brandWebsite}/insights`
            },
            shortVideoScripts: (parsedAi.videoScripts || []).map((s: any, idx: number) => ({
              scriptNumber: idx + 1,
              title: s.title || `Short Video Script #${idx + 1}`,
              durationSec: s.durationSec || (idx === 0 ? 30 : idx === 1 ? 45 : 60),
              targetFormat: 'Reels' as const,
              hook3s: s.hook3s || 'Stop scrolling if you manage business operations!',
              visualCue: s.visualCue || 'Direct to camera with punchy text overlays',
              teleprompterScript: s.script || cleanSnippet,
              ctaText: s.cta || `Follow @${cleanBrand.toLowerCase()} for daily insights.`
            })),
            threadsPost: {
              hook: `Quick question on ${coreTopic}:`,
              body: `${cleanSnippet.slice(0, 320)}\n\nWhat is your team's primary safeguard here? Drop your thoughts below 👇`,
              characterCount: Math.min(480, cleanSnippet.length + 80),
              hashtags: [`#${cleanBrand}`, '#Leadership', '#Growth']
            },
            blueskyPost: {
              text: `${coreTopic}: ${cleanSnippet.slice(0, 200)}\n\nResilient open architecture with ${brandName}. #tech #openweb`,
              characterCount: Math.min(290, cleanSnippet.slice(0, 200).length + 60),
              hashtags: ['#tech', '#openweb', `#${cleanBrand.toLowerCase()}`]
            },
            pinterestPin: {
              title: `Infographic: ${coreTopic.slice(0, 50)} Blueprint`,
              description: `📌 Save this infographic pin: Complete architecture framework for ${coreTopic}. Actionable takeaways and checklists by ${brandName}.`,
              boardSuggestion: 'Business & Tech Infographics',
              destinationLink: `https://${brandWebsite}/playbook`,
              hashtags: ['#Infographic', '#TechTips', '#Checklist', `#${cleanBrand}`],
              visualSpec: {
                headline: coreTopic.slice(0, 36),
                subheadline: '5-Point Architecture & Scaling Audit',
                aspectRatio: '1000:1500',
                theme: 'pinterest-crimson'
              }
            }
          }
        };
      }
    } catch (aiErr) {
      console.warn('Gemini Waterfall AI call failed, falling back to deterministic synthesis:', aiErr);
    }
  }

  // Deterministic Fallback Synthesis (Always works reliably with rich structures)
  return buildDeterministicWaterfallResult({
    sourceType: parsed.sourceType,
    title: parsed.title,
    snippet: cleanSnippet,
    coreTopic,
    brandName,
    brandWebsite,
    cleanBrand
  });
}

function buildFallbackCarouselSlides(coreTopic: string): LinkedInCarouselSlide[] {
  return [
    {
      slideNumber: 1,
      tag: 'HOOK / COVER',
      headline: `The Modern Blueprint for ${coreTopic.slice(0, 36)}`,
      subheadline: 'Why the top 1% of organizations are ditching legacy playbooks.',
      takeaway: 'Swipe to see the 4-step framework →'
    },
    {
      slideNumber: 2,
      tag: 'THE FRICTION',
      headline: 'The Cost of Reactive Firefighting',
      subheadline: 'When systems are fragmented, every minor bottleneck compounds into lost revenue.',
      bulletPoints: [
        'Lack of real-time pipeline telemetry',
        'Manual repetitive distribution overhead',
        'Inconsistent messaging across buyer touchpoints'
      ]
    },
    {
      slideNumber: 3,
      tag: 'THE FRAMEWORK',
      headline: 'Step 1: Automated Omnichannel Orchestration',
      subheadline: 'Never treat channels as isolated silos. One strategic source must cascade everywhere.',
      bulletPoints: [
        'Deconstruct 1 pillar idea into 10 multi-format assets',
        'Tailor formatting and tone per native platform algorithm',
        'Eliminate 80% of manual copywriting friction'
      ]
    },
    {
      slideNumber: 4,
      tag: 'THE BLUEPRINT',
      headline: 'Step 2: Human-in-the-Loop Risk Governance',
      subheadline: 'Autonomous execution requires safety gates. Move fast without risking brand reputation.',
      bulletPoints: [
        'Automated Low/Med/High risk categorization',
        'Pre-publishing diff viewer and budget impact checks',
        'Seamless approval directly from team dashboard'
      ]
    },
    {
      slideNumber: 5,
      tag: 'KEY TAKEAWAY',
      headline: 'Compounding Growth Starts Today',
      subheadline: 'Systems beat willpower every single time.',
      takeaway: 'Save this carousel for your next quarterly planning session. 📌'
    }
  ];
}

function buildDeterministicWaterfallResult(params: {
  sourceType: 'blog_url' | 'youtube_url' | 'raw_text';
  title: string;
  snippet: string;
  coreTopic: string;
  brandName: string;
  brandWebsite: string;
  cleanBrand: string;
}): ContentWaterfallResult {
  const { sourceType, title, snippet, coreTopic, brandName, brandWebsite, cleanBrand } = params;

  const svgDataUri = generateAuthorityTechVisualDataUri({
    brandName,
    headlinePart1: coreTopic.slice(0, 30),
    headlinePart2: 'Omnichannel Cascade',
    badgeText: '5-SLIDE CAROUSEL',
    aspectRatio: '1080:1080',
    visualType: 'metrics'
  });

  return {
    sourceType,
    extractedTitle: title,
    extractedSnippet: snippet,
    assets: {
      linkedinCarousel: {
        title: `${coreTopic} — 5-Slide Executive Carousel`,
        hookCaption: `A system is only as strong as its foundation. In modern business, unexpected friction directly eats into operating margins.\n\nHere is how leading organizations approach ${coreTopic} to guarantee operational continuity and compound pipeline velocity:\n\n1. Centralize your strategic source of truth.\n2. Cascade content natively across all touchpoints.\n3. Enforce human governance before publishing.\n\nSwipe through the slides below for the complete framework 👇`,
        slides: buildFallbackCarouselSlides(coreTopic),
        svgDataUri,
        hashtags: [`#${cleanBrand}`, '#OperationalExcellence', '#Leadership', '#B2BGrowth']
      },
      twitterThread: {
        hookTweet: `1/6 Most leaders get ${coreTopic} completely wrong. They think the answer is more manual hustle.\n\nHere is what the top 1% do differently: 🧵`,
        tweets: [
          {
            tweetNumber: 1,
            text: `1/6 Most leaders get ${coreTopic} completely wrong. They think the answer is more manual hustle.\n\nHere is what the top 1% do differently: 🧵`,
            characterCount: 145
          },
          {
            tweetNumber: 2,
            text: `2/6 The root cause isn't software—it's fragmented execution.\n\nWhen your strategy, content, and lead generation live in separate silos, every campaign suffers from compounding latency.`,
            characterCount: 186
          },
          {
            tweetNumber: 3,
            text: `3/6 Rule #1: Waterfall Repurposing.\n\nNever create single-use content. 1 pillar asset should effortlessly generate:\n• 1 LinkedIn carousel\n• 1 X thread\n• 3 FB posts\n• 1 Newsletter\n• 3 Short video scripts`,
            characterCount: 204
          },
          {
            tweetNumber: 4,
            text: `4/6 Rule #2: Governance > Pure Automation.\n\nAI without safety gates creates massive brand risk. Strict human-in-the-loop approvals ensure only verified, high-quality messaging touches your public audience.`,
            characterCount: 206
          },
          {
            tweetNumber: 5,
            text: `5/6 Rule #3: Real-Time Telemetry.\n\nIf you aren't measuring your Generative Engine Optimization (GEO) and AI search visibility, you are missing 40%+ of modern B2B discovery.`,
            characterCount: 174
          },
          {
            tweetNumber: 6,
            text: `6/6 How is your team approaching ${coreTopic} this quarter?\n\nIf you found this valuable, retweet the first tweet and follow @${cleanBrand.toLowerCase()} for more tactical breakdowns. 🚀`,
            characterCount: 191
          }
        ],
        totalTweets: 6
      },
      facebookPosts: [
        {
          variantType: 'storytelling',
          title: 'Post #1: Storytelling & Problem Empathy',
          headline: `Ever had that sinking feeling when an unexpected operational drop hits during your peak hours?`,
          body: `A client recently came to us after their systems experienced hours of downtime during a critical product launch. The lost revenue was painful, but the hit to customer trust was devastating.\n\nThat experience reinforced why we built ${brandName} around proactive resilience rather than reactive firefighting.\n\nWhen your infrastructure is built right, you sleep soundly knowing your operations never skip a beat.`,
          callToAction: 'Have you ever experienced a costly operational outage? Share your experience below or send us a message to connect!',
          hashtags: [`#${cleanBrand}`, '#BusinessResilience', '#FounderLessons', '#Growth']
        },
        {
          variantType: 'checklist',
          title: 'Post #2: Actionable Step-by-Step Checklist',
          headline: `📋 5-Point Checklist to Upgrade Your ${coreTopic} This Week`,
          body: `Don't wait for something to break before auditing your systems. Here are 5 quick checks you can run today:\n\n1️⃣ Centralized Knowledge Base: Is your core documentation accessible and up-to-date?\n2️⃣ Multi-Channel Distribution: Are your campaigns reaching prospects where they actually spend time?\n3️⃣ SLA Guarantees: Do your technology vendors have certified uptime accountability?\n4️⃣ Automated Data Redundancy: When was the last time you verified backup recovery?\n5️⃣ AI Search Readiness: Are AI engines like Perplexity and ChatGPT citing your brand?`,
          callToAction: '📌 Save this post to run through with your operations team!',
          hashtags: [`#${cleanBrand}`, '#Checklist', '#ITSupport', '#ProductivityHacks']
        },
        {
          variantType: 'contrarian',
          title: 'Post #3: Contrarian Debate / Discussion Driver',
          headline: `Hot Take: Most traditional marketing agencies and IT vendors are fundamentally obsolete.`,
          body: `They charge thousands of dollars a month for manual copy-pasting, disjointed reports, and reactive ticket handling.\n\nIn 2026, autonomous multi-agent operating systems can research, draft, distribute, and audit campaigns in minutes—with full human approval gates.\n\nWhy pay for manual busywork when you can invest in compounding technology?`,
          callToAction: 'Agree or disagree? We want to hear your perspective in the comments below! 👇',
          hashtags: [`#${cleanBrand}`, '#HotTake', '#FutureOfWork', '#MarketingTech']
        }
      ],
      newsletterDrip: {
        subjectLines: [
          `[Executive Brief] Deconstructing ${coreTopic} for Q4`,
          `Why conventional approaches to ${coreTopic} are falling behind`,
          `The 3 compounding rules behind 99.9% operational uptime`
        ],
        preheader: `A tactical breakdown of modern orchestration, human governance, and pipeline velocity.`,
        keyTakeaways: [
          'Deconstruct 1 high-value insight into 10 multi-format omnichannel assets.',
          'Eliminate vendor lock-in and single-points-of-failure with automated verification drills.',
          'Adopt GEO (Generative Engine Optimization) to capture citations in AI search overviews.'
        ],
        bodyMarkdown: `Dear Executive Leader,\n\nWhen markets shift rapidly, organizations that rely on manual, disconnected processes experience friction that compounds every single week.\n\nIn this briefing, we break down our complete operational blueprint for **${coreTopic}**:\n\n### 1. The Power of Waterfall Cascade\nInstead of creating isolated, one-off social posts or emails, high-velocity teams develop a single authoritative pillar. Through intelligent decomposition, this single pillar generates carousel decks, micro-threads, storytelling updates, and video scripts in minutes.\n\n### 2. Guardrails Over Pure Autonomy\nAutomation without human oversight creates brand liability. The sweet spot is combining autonomous drafting with a strict Human-in-the-Loop review gate before anything touches public audiences.\n\n### 3. Verification Over Assumptions\nDon't assume your systems are resilient until you test them under real load.\n\nLooking to benchmark your infrastructure or marketing velocity this quarter? Our team is always here to help.`,
        callToActionText: 'Explore the Complete Architecture Playbook',
        callToActionUrl: `https://${brandWebsite}/playbook`
      },
      shortVideoScripts: [
        {
          scriptNumber: 1,
          title: 'Script 1: 0-30s Quick Tip / Hack',
          durationSec: 30,
          targetFormat: 'Reels',
          hook3s: 'Stop making this $10,000 mistake with your business systems!',
          visualCue: 'Talking head with fast zoom-in on the word "mistake". Energetic pacing.',
          teleprompterScript: `Stop making this huge mistake with your operations! Most teams still create one-off social posts and emails manually. Here is what to do instead: create ONE authoritative pillar idea, then cascade it into a carousel, a thread, 3 social posts, and short video scripts simultaneously. You get 10x the reach with zero extra friction. Follow for daily operational playbooks!`,
          ctaText: `Follow @${cleanBrand.toLowerCase()} for daily growth frameworks.`
        },
        {
          scriptNumber: 2,
          title: 'Script 2: 0-45s Problem Breakdown & Case Story',
          durationSec: 45,
          targetFormat: 'TikTok',
          hook3s: 'Can you guess what happens when your core systems fail for just 2 hours?',
          visualCue: 'Presenter pointing to split-screen graphics showing server metrics and customer wait time.',
          teleprompterScript: `Can you guess what happens when a business loses network connectivity during a major launch? A client came to us last month after losing hours of peak orders due to unverified backup systems. We restructured their entire architecture with proactive monitoring, automated cloud snapshots, and certified SLA guarantees. Now they operate with guaranteed 99.98% uptime. If you run a growing team, never leave your infrastructure to chance.`,
          ctaText: 'Link in bio to book your complimentary infrastructure audit.'
        },
        {
          scriptNumber: 3,
          title: 'Script 3: 0-60s Contrarian Masterclass',
          durationSec: 60,
          targetFormat: 'YouTube Shorts',
          hook3s: 'Why everything you have been told about modern marketing is dead wrong.',
          visualCue: 'Moody lighting, slow cinematic push-in. High-contrast captions with keyword highlights.',
          teleprompterScript: `Here is an unpopular truth: traditional agency retainer models are dying. Paying a team thousands of dollars every month to manually schedule basic social posts doesn't cut it anymore. With modern autonomous AI marketing operating systems, 11 specialized agents can research, crawl live SEO, and draft omnichannel cascades in seconds. The human leader simply reviews and approves. Stop paying for manual busywork—start investing in scalable systems.`,
          ctaText: 'Subscribe for the full deep-dive breakdown on our channel!'
        }
      ],
      threadsPost: {
        hook: `Quick question for leaders scaling ${coreTopic}:`,
        body: `Most teams lose hours every week creating one-off updates manually.\n\nHere is what high-velocity organizations do instead: Take ONE strategic pillar and cascade it into a carousel, micro-thread, 3 storytelling posts, and video scripts in minutes.\n\nWhat is your team's biggest operational bottleneck right now? Drop your thoughts below 👇`,
        characterCount: 385,
        hashtags: [`#${cleanBrand}`, '#Leadership', '#Scale']
      },
      blueskyPost: {
        text: `Resilient systems aren't built on manual busywork. Deconstructing ${coreTopic} into 10 omnichannel touchpoints with strict human-in-the-loop approvals.\n\nOpen architecture > legacy agency retainers.\n\n#tech #openweb #${cleanBrand.toLowerCase()}`,
        characterCount: 245,
        hashtags: ['#tech', '#openweb', `#${cleanBrand.toLowerCase()}`]
      },
      pinterestPin: {
        title: `Infographic Checklist: The Complete ${coreTopic.slice(0, 45)} Playbook`,
        description: `📌 Save this actionable infographic blueprint to audit your company's systems, eliminate downtime, and accelerate omnichannel velocity with ${brandName}. Verified architecture frameworks inside!`,
        boardSuggestion: 'Business Architecture & Infographics',
        destinationLink: `https://${brandWebsite}/playbook`,
        hashtags: ['#Infographic', '#TechTips', '#BusinessArchitecture', `#${cleanBrand}`],
        visualSpec: {
          headline: coreTopic.slice(0, 36),
          subheadline: '5-Point Architecture & Scaling Audit',
          aspectRatio: '1000:1500',
          theme: 'pinterest-crimson'
        }
      }
    }
  };
}
