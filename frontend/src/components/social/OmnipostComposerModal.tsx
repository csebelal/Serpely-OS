import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Share2,
  Check,
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
  Youtube,
  Send,
  Clock,
  ShieldCheck,
  Layers,
  Image as ImageIcon,
  Palette,
  Hash,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ExternalLink
} from 'lucide-react';
import {
  ConnectedSocialPage,
  PageSocialPost,
  SocialPagePlatform,
  BrandProfile,
  SocialVisualCardConfig,
  VisualCardTheme,
  VisualCardLayout,
  ViewId
} from '../../types';
import {
  generateBrandedSocialSvgDataUri,
  mockKeywordResearchBriefs
} from '../../data/mock-data';
import { ViralityPredictorMeter } from './ViralityPredictorMeter';

import { ThreadsIcon, BlueskyIcon, TikTokIcon, PinterestIcon } from './SocialPlatformIcons';

interface OmnipostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedPages: ConnectedSocialPage[];
  brandProfile?: BrandProfile;
  onPublishBatch: (posts: PageSocialPost[], mode: 'publish_now' | 'queue' | 'approval') => void;
  onNavigate?: (view: ViewId) => void;
}

const PLATFORMS: SocialPagePlatform[] = [
  'LinkedIn',
  'Facebook',
  'Instagram',
  'X',
  'YouTube',
  'Threads',
  'Bluesky',
  'TikTok',
  'Pinterest'
];

const CHAR_LIMITS: Record<SocialPagePlatform, number> = {
  LinkedIn: 3000,
  Facebook: 5000,
  Instagram: 2200,
  X: 280,
  YouTube: 5000,
  Threads: 500,
  Bluesky: 300,
  TikTok: 2200,
  Pinterest: 500
};

export const OmnipostComposerModal: React.FC<OmnipostComposerModalProps> = ({
  isOpen,
  onClose,
  connectedPages,
  brandProfile,
  onPublishBatch,
  onNavigate
}) => {
  if (!isOpen) return null;

  const brandName = brandProfile?.name || 'Tech Sheba';
  const tagline = brandProfile?.tagline || 'IT Infrastructure & Security Solutions';
  const cleanBrand = brandName.replace(/\s+/g, '');

  // Derived suggested topics
  const topics = React.useMemo(() => {
    if (brandProfile) {
      const docs = (brandProfile.knowledgeDocs || []).map(d => d.title);
      const usps = brandProfile.coreUSPs || [];
      const combined = [...docs, ...usps].filter(Boolean);
      if (combined.length > 0) return combined.slice(0, 5);
    }
    return [
      'IT Infrastructure & Support Checklist',
      'CCTV Surveillance & Access Control Security',
      'Enterprise Starlink & High-Speed Networking',
      'Automated Cloud Backup & Downtime Prevention'
    ];
  }, [brandProfile]);

  // Selected target platforms
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<SocialPagePlatform, boolean>>({
    LinkedIn: true,
    Facebook: true,
    Instagram: true,
    X: true,
    YouTube: false,
    Threads: true,
    Bluesky: true,
    TikTok: false,
    Pinterest: true
  });

  // Active platform tab in editor
  const [activePlatformTab, setActivePlatformTab] = useState<SocialPagePlatform>('LinkedIn');

  // Master Prompt & Tone
  const [masterTopic, setMasterTopic] = useState<string>(topics[0]);
  const [masterTone, setMasterTone] = useState<'authoritative' | 'conversational' | 'hook-driven' | 'educational'>('authoritative');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [dispatchMode, setDispatchMode] = useState<'publish_now' | 'queue' | 'approval'>('publish_now');

  // Next available queue slot calculation
  const nextQueueSlot = 'Today, 2:30 PM (Peak regional window)';

  // Per-platform customized captions
  const [platformCaptions, setPlatformCaptions] = useState<Record<SocialPagePlatform, string>>({
    LinkedIn: `Ensuring Business Continuity & IT Reliability with ${brandName}\n\nIn modern operations, unexpected downtime directly impacts revenue. Here is how we help organizations stay resilient:\n\n1. Proactive Infrastructure Monitoring: Preventing network bottlenecks before they affect operations.\n2. Enterprise Security & CCTV: Multi-layered surveillance and access management.\n3. Reliable Data Backup Systems: Instant recovery protocols with zero data loss.\n\nHow is your organization preparing its infrastructure this year?`,
    Facebook: `🚀 Upgrade your company's IT infrastructure and security with ${brandName}!\n\nLooking for seamless connectivity, 24/7 CCTV surveillance, and zero-downtime automated backups? We provide end-to-end IT support tailored for your business.\n\nSend us a message or comment below for a free technical consultation!`,
    Instagram: `✨ 3 Essentials to Protect Your Enterprise Infrastructure 💻🔒\n\n1️⃣ High-Speed Enterprise Networking\n2️⃣ 24/7 CCTV & Physical Access Security\n3️⃣ Redundant Cloud Backup & Instant Recovery\n\nElevate your team's productivity with guaranteed uptime from ${brandName}.\n\n📩 DM us or tap the link in bio to schedule an on-site audit!`,
    X: `Downtime costs more than IT infrastructure upgrades. Protect your team with proactive 24/7 network support, CCTV security & zero-loss cloud backup from ${brandName}. #EnterpriseIT #TechSheba`,
    YouTube: `How to Architect Resilient IT Infrastructure for Modern Businesses | ${brandName} Walkthrough\n\nIn this video, we break down high-speed networking, 24/7 CCTV security, and automated cloud backups.\n\n📌 Timestamps:\n0:00 - Enterprise IT Challenges\n1:20 - Network Architecture\n3:45 - 24/7 Surveillance Setup\n6:10 - Backup & Recovery\n\nContact us for consultation: info@techsheba.com`,
    Threads: `How often does your IT team run simulated backup recovery tests?\n\nMost teams discover their backups fail during a real crisis. Proactive infrastructure audits with ${brandName} prevent 99% of unexpected downtime.\n\nWhat is your company's primary continuity safeguard this quarter? Drop your thoughts below 👇`,
    Bluesky: `Resilient infrastructure isn't optional in 2026. Proactive 24/7 monitoring, enterprise access control & zero-loss backups with ${brandName}. Building reliable systems from the ground up.\n\n#tech #infrastructure #atproto`,
    TikTok: `3 common IT security blunders costing businesses thousands 🚩\n\n1. Default router credentials\n2. Unsegmented office WiFi\n3. Zero tested backups\n\nFollow ${brandName} for more tech hacks! #techhacks #cybersecurity #sysadmin`,
    Pinterest: `📌 Infographic Checklist: Enterprise IT Infrastructure Architecture\n\nSave this high-impact visual pin for your IT audit playbook:\n✓ Multi-Layered CCTV Surveillance & Biometrics\n✓ Gigabit Redundant Starlink & Fiber Network\n✓ Automated Zero-Data-Loss Cloud Failover\n\nFull deployment blueprints at ${cleanBrand}.net 🚀 #ITChecklist #EnterpriseSecurity`
  });

  // Per-platform hashtags
  const [platformHashtags, setPlatformHashtags] = useState<Record<SocialPagePlatform, string>>({
    LinkedIn: `#${cleanBrand} #EnterpriseIT #Infrastructure #BusinessContinuity #ITSupport`,
    Facebook: `#${cleanBrand} #ITSupport #CCTV #NetworkSolutions #BusinessContinuity`,
    Instagram: `#${cleanBrand} #TechSecurity #ITInfrastructure #BusinessGrowth #DhakaBusiness #CyberSecurity`,
    X: `#${cleanBrand} #ITSupport #Security`,
    YouTube: `#${cleanBrand} #ITInfrastructure #CCTV #TechSolutions`,
    Threads: `#TechDiscussion #ITInfrastructure #BusinessContinuity`,
    Bluesky: `#atproto #openweb #tech #infrastructure`,
    TikTok: `#techhacks #cybersecurity #sysadmin #techsheba`,
    Pinterest: `#TechTips #EnterpriseIT #Infographic #ITInfrastructure #CyberSecurity`
  });

  // Visual card configurations
  const [visualConfigs, setVisualConfigs] = useState<Record<SocialPagePlatform, SocialVisualCardConfig>>({
    LinkedIn: {
      headline: brandName,
      subheadline: 'Enterprise IT Modernization & Uptime Framework',
      metricValue: '99.9%',
      metricLabel: 'Guaranteed Uptime',
      keywordTag: 'Enterprise Infrastructure',
      theme: 'linkedin-executive',
      footerBrand: brandName,
      layout: 'stat-spotlight'
    },
    Facebook: {
      headline: brandName,
      subheadline: 'CCTV Security & Starlink Networking Setup',
      metricValue: '24/7',
      metricLabel: 'Support & Monitoring',
      keywordTag: 'IT Support Checklist',
      theme: 'facebook-cobalt',
      footerBrand: brandName,
      layout: 'executive-quote'
    },
    Instagram: {
      headline: brandName,
      subheadline: 'Automated Cloud Backup & Downtime Prevention',
      metricValue: '0%',
      metricLabel: 'Data Loss SLA',
      keywordTag: 'Cloud Resilience',
      theme: 'instagram-gradient',
      footerBrand: brandName,
      layout: 'stat-spotlight'
    },
    X: {
      headline: brandName,
      subheadline: 'Proactive Network Monitoring & Zero Downtime',
      metricValue: '10x',
      metricLabel: 'Faster Recovery',
      keywordTag: 'IT Reliability',
      theme: 'x-dark',
      footerBrand: brandName,
      layout: 'checklist-roadmap'
    },
    YouTube: {
      headline: brandName,
      subheadline: 'Complete Technical Infrastructure Guide 2026',
      metricValue: 'HD',
      metricLabel: 'Video Masterclass',
      keywordTag: 'IT Playbook',
      theme: 'amber-authority',
      footerBrand: brandName,
      layout: 'stat-spotlight'
    },
    Threads: {
      headline: brandName,
      subheadline: 'Meta Threads Community Technical Discussion',
      metricValue: 'Live',
      metricLabel: 'Conversational Feed',
      keywordTag: 'Threads Connector',
      theme: 'threads-slate',
      footerBrand: brandName,
      layout: 'executive-quote'
    },
    Bluesky: {
      headline: brandName,
      subheadline: 'Decentralized AT Protocol Infrastructure Update',
      metricValue: 'Open',
      metricLabel: 'Federated Node',
      keywordTag: 'AT Protocol',
      theme: 'bluesky-azure',
      footerBrand: brandName,
      layout: 'checklist-roadmap'
    },
    TikTok: {
      headline: brandName,
      subheadline: 'Viral IT Security & Networking Hacks',
      metricValue: 'Top 1%',
      metricLabel: 'Viral Hook Score',
      keywordTag: 'Tech Clips',
      theme: 'tiktok-neon',
      footerBrand: brandName,
      layout: 'stat-spotlight'
    },
    Pinterest: {
      headline: brandName,
      subheadline: 'Enterprise Infrastructure Blueprint & Audit Checklist',
      metricValue: '100% Audit',
      metricLabel: 'Visual Infographic',
      keywordTag: 'PIN PLAYBOOK',
      theme: 'pinterest-crimson',
      footerBrand: brandName,
      layout: 'checklist-roadmap',
      aspectRatio: '1000:1500'
    }
  });

  const [aspectRatios, setAspectRatios] = useState<Record<SocialPagePlatform, '1200:627' | '1080:1080' | '1000:1500'>>({
    LinkedIn: '1200:627',
    Facebook: '1200:627',
    Instagram: '1080:1080',
    X: '1200:627',
    YouTube: '1200:627',
    Threads: '1080:1080',
    Bluesky: '1200:627',
    TikTok: '1080:1080',
    Pinterest: '1000:1500'
  });

  // Toggle platform selection
  const togglePlatform = (p: SocialPagePlatform) => {
    setSelectedPlatforms(prev => {
      const next = { ...prev, [p]: !prev[p] };
      // If toggled on and no active tab, select this
      if (!prev[p]) setActivePlatformTab(p);
      return next;
    });
  };

  // AI Generator - adapts prompt into all 5 platforms simultaneously
  const handleGenerateAllWithAI = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/social/research-and-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: masterTopic,
          platform: 'LinkedIn'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const generated = data.content || '';
        
        // Adapt base content into platform-specific structures
        setPlatformCaptions({
          LinkedIn: generated,
          Facebook: `🚀 ${masterTopic} - By ${brandName}\n\n${generated.slice(0, 320)}...\n\nLooking to upgrade your company's systems? Send us a message or comment below to get a customized audit!`,
          Instagram: `✨ ${masterTopic.toUpperCase()} ✨\n\n${generated.slice(0, 260)}...\n\n👉 Save this post for your IT roadmap!\n📲 Link in bio to book an on-site consultation.`,
          X: `${masterTopic}: Proactive infrastructure management prevents costly operational downtime for modern businesses. Built by ${brandName}. #${cleanBrand} #ITSupport`,
          YouTube: `${masterTopic} - Complete Enterprise Architecture Guide | ${brandName}\n\n${generated.slice(0, 300)}\n\nTimestamps & Consultation: info@techsheba.com`,
          Threads: `Quick question on ${masterTopic}:\n\n${generated.slice(0, 280)}\n\nWhat is your team's biggest operational hurdle here? Drop your thoughts below 👇`,
          Bluesky: `${masterTopic} — ${generated.slice(0, 220)}\n\nBuilt with open resilience. #tech #${cleanBrand}`,
          TikTok: `3 critical takeaways about ${masterTopic} 🚩\n\n${generated.slice(0, 200)}\n\nFollow for more enterprise tech tips! #techhacks #${cleanBrand}`,
          Pinterest: `📌 Visual Guide: ${masterTopic}\n\n${generated.slice(0, 300)}\n\nSave this infographic pin to your board and visit ${cleanBrand}.net for the full deployment checklist!`
        });
      }
    } catch {
      // Fallback local variations
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Dispatch to batch
  const handleDispatch = () => {
    const selectedList = PLATFORMS.filter(p => selectedPlatforms[p]);
    if (selectedList.length === 0) {
      alert('Please select at least one social media platform to broadcast.');
      return;
    }

    const batchPosts: PageSocialPost[] = selectedList.map(platform => {
      const page = connectedPages.find(p => p.platform === platform) || {
        id: `page-${platform.toLowerCase()}-auto`,
        platform,
        pageName: `${brandName} ${platform}`,
        pageHandle: `@${cleanBrand.toLowerCase()}`,
        externalPageId: `ext-${platform.toLowerCase()}`,
        followersCount: 1200,
        oauthConnected: true,
        scopes: [],
        lastSyncedAt: 'Auto-Batch',
        category: 'Official Account'
      };

      const cfg = visualConfigs[platform];
      const visualUrl = generateBrandedSocialSvgDataUri(cfg);

      return {
        id: `post-omni-${platform.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        platform,
        pageId: page.id,
        pageName: page.pageName,
        pageHandle: page.pageHandle,
        keyword: masterTopic,
        researchBrief: mockKeywordResearchBriefs[0],
        content: platformCaptions[platform],
        hashtags: platformHashtags[platform].split(' ').filter(h => h.startsWith('#')),
        visualConfig: cfg,
        visualUrl,
        status: dispatchMode === 'publish_now' ? 'published' : 'pending_approval',
        createdAt: 'Just now',
        publishedAt: dispatchMode === 'publish_now' ? 'Just now' : undefined,
        analytics: {
          impressions: 0,
          reach: 0,
          clicks: 0,
          ctr: 0,
          reactions: 0,
          commentsCount: 0,
          shares: 0,
          engagementRate: 0
        }
      };
    });

    onPublishBatch(batchPosts, dispatchMode);

    if (dispatchMode === 'queue') {
      batchPosts.forEach(post => {
        fetch('/api/social/scheduling/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: post.platform,
            content: post.content,
            scheduledTimestamp: Date.now() + 2 * 3600 * 1000,
            scheduledTimeFormatted: nextQueueSlot,
            pageId: post.pageId,
            pageName: post.pageName,
            pageHandle: post.pageHandle,
            visualUrl: post.visualUrl,
            tags: post.hashtags
          })
        }).catch(() => {});
      });
    }

    onClose();
  };

  // Current active platform caption and character statistics
  const currentCaption = platformCaptions[activePlatformTab] || '';
  const currentLimit = CHAR_LIMITS[activePlatformTab] || 3000;
  const currentLen = currentCaption.length;
  const isOverLimit = currentLen > currentLimit;

  // Active preview SVG visual card
  const activeSvgUri = React.useMemo(() => {
    return generateBrandedSocialSvgDataUri(visualConfigs[activePlatformTab]);
  }, [visualConfigs, activePlatformTab]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-5xl rounded-3xl border border-neutral-800 bg-neutral-950 p-5 sm:p-7 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-500 text-neutral-950 font-black shadow-lg shadow-emerald-500/20">
                <Share2 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Unified Omnipost Composer</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Cross-Platform Mode
                </span>
              </h2>
            </div>
            <p className="text-xs text-neutral-400">
              Draft one high-impact message and automatically adapt copy, visual cards, and hashtags for all 5 social networks.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onNavigate && (
              <button
                onClick={() => {
                  onClose();
                  onNavigate('integrations');
                }}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-800 flex items-center gap-1.5 transition-colors"
                title="Manage Connected Channels"
              >
                <span>Channels</span>
                <ExternalLink className="h-3 w-3 text-emerald-400" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 1. Multi-Channel Selector Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-neutral-300">
              Target Broadcast Channels ({Object.values(selectedPlatforms).filter(Boolean).length}/{PLATFORMS.length} selected)
            </span>
            <button
              type="button"
              onClick={() => {
                const allSelected = Object.values(selectedPlatforms).every(Boolean);
                const nextVal = !allSelected;
                const nextMap = {} as Record<SocialPagePlatform, boolean>;
                PLATFORMS.forEach(p => {
                  nextMap[p] = nextVal;
                });
                setSelectedPlatforms(nextMap);
              }}
              className="text-[11px] text-emerald-400 hover:underline font-semibold"
            >
              {Object.values(selectedPlatforms).every(Boolean) ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {PLATFORMS.map(platform => {
              const isSelected = selectedPlatforms[platform];
              const connectedPage = connectedPages.find(p => p.platform === platform);
              const isConn = Boolean(connectedPage?.oauthConnected);

              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={`p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-2 ${
                    isSelected
                      ? platform === 'LinkedIn'
                        ? 'bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/10'
                        : platform === 'Facebook'
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                        : platform === 'Instagram'
                        ? 'bg-rose-500/15 border-rose-500 text-white shadow-md shadow-rose-500/10'
                        : platform === 'X'
                        ? 'bg-neutral-800 border-neutral-600 text-white shadow-md'
                        : platform === 'Threads'
                        ? 'bg-neutral-800 border-neutral-500 text-white shadow-md'
                        : platform === 'Bluesky'
                        ? 'bg-sky-600/20 border-sky-400 text-white shadow-md shadow-sky-500/15'
                        : platform === 'TikTok'
                        ? 'bg-rose-600/20 border-rose-400 text-white shadow-md shadow-rose-500/15'
                        : platform === 'Pinterest'
                        ? 'bg-rose-700/20 border-rose-500 text-white shadow-md shadow-rose-600/15'
                        : 'bg-rose-600/15 border-rose-500 text-white shadow-md'
                      : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {platform === 'LinkedIn' && <Linkedin className="h-3.5 w-3.5 text-sky-400" />}
                      {platform === 'Facebook' && <Facebook className="h-3.5 w-3.5 text-blue-400" />}
                      {platform === 'Instagram' && <Instagram className="h-3.5 w-3.5 text-rose-400" />}
                      {platform === 'X' && <Twitter className="h-3.5 w-3.5 text-neutral-200" />}
                      {platform === 'YouTube' && <Youtube className="h-3.5 w-3.5 text-rose-500" />}
                      {platform === 'Threads' && <ThreadsIcon className="h-3.5 w-3.5 text-white" />}
                      {platform === 'Bluesky' && <BlueskyIcon className="h-3.5 w-3.5 text-sky-400" />}
                      {platform === 'TikTok' && <TikTokIcon className="h-3.5 w-3.5 text-rose-400" />}
                      {platform === 'Pinterest' && <PinterestIcon className="h-3.5 w-3.5 text-rose-500" />}
                      <span className="font-bold text-[11px] truncate">{platform}</span>
                    </div>
                    <div
                      className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected ? 'bg-emerald-500 border-emerald-400 text-neutral-950' : 'border-neutral-700'
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="truncate text-neutral-400">
                      {connectedPage?.pageName ? connectedPage.pageName.slice(0, 10) : `${platform}`}
                    </span>
                    <span className={isConn ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                      {isConn ? 'Active' : 'Offline'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Master Topic & AI Auto-Adapt Bar */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Master Topic & Knowledge Hub Grounding</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400">Tone:</span>
              <select
                value={masterTone}
                onChange={e => setMasterTone(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
              >
                <option value="authoritative">Authoritative & Technical</option>
                <option value="conversational">Conversational & Direct</option>
                <option value="hook-driven">Viral & Hook-Driven</option>
                <option value="educational">Educational 3-Point Guide</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={masterTopic}
              onChange={e => setMasterTopic(e.target.value)}
              placeholder="e.g. Enterprise IT Infrastructure & Downtime Prevention Checklist"
              className="flex-1 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleGenerateAllWithAI}
              disabled={isGenerating || !masterTopic.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-40 shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate 5 Variations with AI'}</span>
            </button>
          </div>

          {/* Quick topic suggestion pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-neutral-500 font-mono">Suggested:</span>
            {topics.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMasterTopic(t)}
                className="px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white text-[11px] border border-neutral-800/80 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Platform Specific Tab Editor & Live Side-by-Side Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column: Platform Caption & Hashtags Editor */}
          <div className="space-y-4">
            {/* Platform Sub-Tabs */}
            <div className="flex items-center gap-1.5 border-b border-neutral-800 pb-2 overflow-x-auto">
              {PLATFORMS.filter(p => selectedPlatforms[p]).map(p => {
                const isActive = activePlatformTab === p;
                const len = (platformCaptions[p] || '').length;
                const max = CHAR_LIMITS[p];
                const over = len > max;

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActivePlatformTab(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-neutral-800 text-white border border-neutral-700'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <span>{p}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        over ? 'bg-red-500/20 text-red-400 font-bold' : 'bg-neutral-900 text-neutral-400'
                      }`}
                    >
                      {len}/{max}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Platform Caption Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-300">
                  {activePlatformTab} Tailored Caption
                </span>
                <span className={`text-[11px] font-mono ${isOverLimit ? 'text-red-400 font-bold' : 'text-neutral-400'}`}>
                  {currentLen} / {currentLimit} characters
                </span>
              </div>

              <textarea
                rows={7}
                value={platformCaptions[activePlatformTab]}
                onChange={e =>
                  setPlatformCaptions(prev => ({ ...prev, [activePlatformTab]: e.target.value }))
                }
                className={`w-full p-3 rounded-2xl bg-neutral-900 border text-white text-xs placeholder-neutral-500 focus:outline-none transition-colors ${
                  isOverLimit ? 'border-red-500 focus:border-red-400' : 'border-neutral-800 focus:border-sky-500'
                }`}
                placeholder={`Draft platform-ready post copy for ${activePlatformTab}...`}
              />

              {isOverLimit && (
                <div className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>
                    Warning: Post exceeds {activePlatformTab}'s limit by {currentLen - currentLimit} characters!
                  </span>
                </div>
              )}
            </div>

            {/* Platform Hashtags Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
                <Hash className="h-3.5 w-3.5 text-neutral-500" />
                <span>{activePlatformTab} Hashtags</span>
              </label>
              <input
                type="text"
                value={platformHashtags[activePlatformTab]}
                onChange={e =>
                  setPlatformHashtags(prev => ({ ...prev, [activePlatformTab]: e.target.value }))
                }
                className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs font-mono placeholder-neutral-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* FeedHive-Style Live Predictive Virality Meter & Smart Best-Time Pill */}
            <ViralityPredictorMeter
              platform={activePlatformTab}
              content={platformCaptions[activePlatformTab]}
              hashtags={platformHashtags[activePlatformTab].split(' ').filter(h => h.startsWith('#'))}
              onApplyPolishedContent={polished => {
                setPlatformCaptions(prev => ({
                  ...prev,
                  [activePlatformTab]: polished
                }));
              }}
            />

            {/* Visual Card Quick Controls for this platform */}
            <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-sky-400" />
                  <span>Visual Card Config ({activePlatformTab})</span>
                </span>
                {/* Aspect Ratio Toggle */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[10px] font-mono">
                  {(['1200:627', '1080:1080'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatios(prev => ({ ...prev, [activePlatformTab]: r }))}
                      className={`px-2 py-0.5 rounded ${
                        aspectRatios[activePlatformTab] === r
                          ? 'bg-neutral-800 text-white font-bold'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {r === '1200:627' ? '16:9 Landscape' : '1:1 Square'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-neutral-500 block mb-0.5">Card Headline</label>
                  <input
                    type="text"
                    value={visualConfigs[activePlatformTab].headline}
                    onChange={e =>
                      setVisualConfigs(prev => ({
                        ...prev,
                        [activePlatformTab]: { ...prev[activePlatformTab], headline: e.target.value }
                      }))
                    }
                    className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-500 block mb-0.5">Stat Metric</label>
                  <input
                    type="text"
                    value={visualConfigs[activePlatformTab].metricValue}
                    onChange={e =>
                      setVisualConfigs(prev => ({
                        ...prev,
                        [activePlatformTab]: { ...prev[activePlatformTab], metricValue: e.target.value }
                      }))
                    }
                    className="w-full p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Feed Simulation Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Live Feed Preview · {activePlatformTab}</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                {aspectRatios[activePlatformTab]}
              </span>
            </div>

            {/* Platform Preview Mock */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 space-y-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    activePlatformTab === 'LinkedIn'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      : activePlatformTab === 'Facebook'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                      : activePlatformTab === 'Instagram'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : activePlatformTab === 'X'
                      ? 'bg-neutral-800 text-white border border-neutral-700'
                      : 'bg-rose-600/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {activePlatformTab === 'LinkedIn'
                    ? 'in'
                    : activePlatformTab === 'Facebook'
                    ? 'FB'
                    : activePlatformTab === 'Instagram'
                    ? 'IG'
                    : activePlatformTab === 'X'
                    ? '𝕏'
                    : 'YT'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{brandName}</span>
                    <span className="text-[10px] font-mono text-neutral-500">· Official</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    Just now · {activePlatformTab} Network
                  </div>
                </div>
              </div>

              {/* Text content preview */}
              <div className="text-xs text-neutral-200 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto pr-1">
                {platformCaptions[activePlatformTab]}
              </div>

              {/* Hashtags preview */}
              {platformHashtags[activePlatformTab] && (
                <div className="text-[11px] font-mono text-sky-400">
                  {platformHashtags[activePlatformTab]}
                </div>
              )}

              {/* Visual Card image preview */}
              <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 flex items-center justify-center">
                <img
                  src={activeSvgUri}
                  alt="Visual Card"
                  className="w-full object-cover max-h-56"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Smart Queue & Dispatch Actions Bar */}
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
          {/* Dispatch Mode Selector */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-neutral-300">Action:</span>
            {[
              { id: 'publish_now', label: 'Publish Now', icon: Send },
              { id: 'queue', label: 'Add to Smart Queue', icon: Clock },
              { id: 'approval', label: 'Submit to Approval Gate', icon: ShieldCheck }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setDispatchMode(m.id as any)}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-semibold transition-all ${
                  dispatchMode === m.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <m.icon className="h-3.5 w-3.5" />
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDispatch}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              {dispatchMode === 'publish_now' ? (
                <>
                  <Send className="h-4 w-4" />
                  <span>
                    Publish to {Object.values(selectedPlatforms).filter(Boolean).length} Channels Now
                  </span>
                </>
              ) : dispatchMode === 'queue' ? (
                <>
                  <Clock className="h-4 w-4" />
                  <span>
                    Queue to {Object.values(selectedPlatforms).filter(Boolean).length} Channels ({nextQueueSlot})
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Stage in Approval Gate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
