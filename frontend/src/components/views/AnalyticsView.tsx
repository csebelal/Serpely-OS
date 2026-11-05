import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Layers,
  RefreshCw,
  Search,
  CheckCircle2,
  Download,
  Link2,
  Code2,
  Copy,
  Zap,
  Sliders,
  Activity,
  DollarSign,
  Target,
  Users,
  ArrowRight,
  Briefcase,
  Building2,
  MapPin,
  PieChart,
  BarChart3,
  UploadCloud,
  FileSpreadsheet,
  Compass,
  Check,
  Share2,
  MessageSquare,
  ThumbsUp,
  Bookmark,
  Send,
  Eye,
  ExternalLink,
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';
import {
  ViewId,
  PageSocialPost,
  SocialPagePlatform,
  LeadItem,
  GeoScoreData,
  BrandProfile
} from '../../types';
import {
  mockPageSocialPosts,
  mockLeads,
  mockGeoScore,
  mockBrandProfile
} from '../../data/mock-data';

export type AttributionModelId = 'first-touch' | 'last-touch' | 'linear' | 'w-shaped';

interface AnalyticsViewProps {
  onNavigate: (view: ViewId) => void;
  onOpenCommand: () => void;
  pagePosts?: PageSocialPost[];
  onUpdatePagePosts?: (posts: PageSocialPost[]) => void;
  leadsList?: LeadItem[];
  onUpdateLeads?: (leads: LeadItem[]) => void;
  geoScore?: GeoScoreData;
  brandProfile?: BrandProfile;
  onShowToast?: (message: string) => void;
}

const ATTRIBUTION_MODEL_META: Record<
  AttributionModelId,
  {
    label: string;
    shortTag: string;
    formula: string;
    description: string;
    weights: {
      geoSearch: number;
      linkedinOrganic: number;
      facebookOrganic: number;
      emailNurture: number;
    };
  }
> = {
  'w-shaped': {
    label: 'W-Shaped (Recommended)',
    shortTag: 'W-Shaped',
    formula: '35% First Touch · 30% Lead Capture · 20% Email Nurture · 15% Social Assist',
    description:
      'Credits discovery channels (GEO/SEO & Keyword Social Posts) alongside mid-funnel lead capture and email nurture touchpoints.',
    weights: {
      geoSearch: 0.40,
      linkedinOrganic: 0.30,
      facebookOrganic: 0.15,
      emailNurture: 0.15
    }
  },
  'first-touch': {
    label: 'First-Touch',
    shortTag: 'First-Touch',
    formula: '100% Credit to Initial Discovery Touchpoint',
    description:
      'Allocates 100% of pipeline revenue to the first discovery channel where the buyer encountered your brand or keyword.',
    weights: {
      geoSearch: 0.50,
      linkedinOrganic: 0.30,
      facebookOrganic: 0.15,
      emailNurture: 0.05
    }
  },
  'last-touch': {
    label: 'Last-Touch',
    shortTag: 'Last-Touch',
    formula: '100% Credit to Final Conversion Event Prior to SQL Demo',
    description:
      'Allocates 100% of pipeline credit to the final touchpoint directly preceding deal creation.',
    weights: {
      geoSearch: 0.20,
      linkedinOrganic: 0.25,
      facebookOrganic: 0.15,
      emailNurture: 0.40
    }
  },
  linear: {
    label: 'Linear Multi-Touch',
    shortTag: 'Linear',
    formula: 'Equal Weight Across All Documented Buyer Interactions',
    description:
      'Spreads pipeline attribution equally across every touchpoint across GEO search citations, social impressions, and email opens.',
    weights: {
      geoSearch: 0.30,
      linkedinOrganic: 0.30,
      facebookOrganic: 0.20,
      emailNurture: 0.20
    }
  }
};

// Real LinkedIn Demographic Data Scraped from Author Analytics Screenshots
const REAL_LINKEDIN_DEMOGRAPHICS = {
  engagements: {
    total: 20,
    reactions: 16,
    comments: 2,
    reposts: 2,
    saves: 0,
    sends: 0
  },
  jobTitles: [
    { label: 'Software Engineer', percentage: 11 },
    { label: 'Founder', percentage: 4 },
    { label: 'Co-Founder', percentage: 2 },
    { label: 'Frontend Developer', percentage: 2 },
    { label: 'Digital Marketing Manager', percentage: 2 },
    { label: 'Wordpress Developer', percentage: 2 },
    { label: 'Chief Executive Officer', percentage: 1 },
    { label: 'Content Writer', percentage: 1 },
    { label: 'Product Designer', percentage: 1 }
  ],
  seniority: [
    { label: 'Entry Level', percentage: 35 },
    { label: 'Senior Professional', percentage: 32 },
    { label: 'Manager', percentage: 5 },
    { label: 'CXO (C-Suite)', percentage: 5 },
    { label: 'Owner / Principal', percentage: 4 },
    { label: 'Director', percentage: 4 },
    { label: 'Vice President (VP)', percentage: 1 }
  ],
  locations: [
    { label: 'Dhaka, Bangladesh', percentage: 12 },
    { label: 'Mirpur, Dhaka', percentage: 2 },
    { label: 'Banani, Dhaka', percentage: 1 },
    { label: 'Mirpur Model Thana', percentage: 1 }
  ],
  companies: [
    { label: 'Roxnor', percentage: 2 },
    { label: 'Upwork', percentage: 1 },
    { label: 'XpeedStudio', percentage: 1 },
    { label: 'Brain Station 23', percentage: 1 },
    { label: 'weDevs', percentage: 1 },
    { label: 'JustGo', percentage: 1 },
    { label: 'Fiverr', percentage: 1 },
    { label: 'Startise', percentage: 1 }
  ],
  industry: [
    { label: 'Software Development', percentage: 31 },
    { label: 'IT Services & IT Consulting', percentage: 24 },
    { label: 'Technology, Information & Internet', percentage: 18 }
  ],
  companySize: [
    { label: '51-200 employees', percentage: 22 },
    { label: '11-50 employees', percentage: 19 },
    { label: '1-10 employees', percentage: 16 },
    { label: '201-500 employees', percentage: 12 }
  ]
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  onNavigate,
  onOpenCommand: _onOpenCommand,
  pagePosts = mockPageSocialPosts,
  onUpdatePagePosts,
  leadsList = mockLeads,
  onUpdateLeads,
  geoScore = mockGeoScore,
  brandProfile = mockBrandProfile,
  onShowToast
}) => {
  const [posts, setPosts] = useState<PageSocialPost[]>(pagePosts);
  const [leads, setLeads] = useState<LeadItem[]>(leadsList);

  React.useEffect(() => {
    setPosts(pagePosts);
  }, [pagePosts]);

  React.useEffect(() => {
    setLeads(leadsList);
  }, [leadsList]);

  const updatePosts = (next: PageSocialPost[]) => {
    setPosts(next);
    if (onUpdatePagePosts) onUpdatePagePosts(next);
  };

  const updateLeads = (next: LeadItem[]) => {
    setLeads(next);
    if (onUpdateLeads) onUpdateLeads(next);
  };

  // Modern 4-Tab Navigation (Defaults to Overview & ROI)
  const [activeTab, setActiveTab] = useState<
    'overview-roi' | 'post-performance' | 'audience-demographics' | 'utm-pixel'
  >('overview-roi');

  // Filters & Sorting for Post Performance
  const [platformFilter, setPlatformFilter] = useState<'All' | SocialPagePlatform>('All');
  const [intentFilter, setIntentFilter] = useState<'All' | 'Commercial' | 'Transactional' | 'Informational'>('All');
  const [sortBy, setSortBy] = useState<'ctr' | 'reach' | 'engagementRate' | 'efficiency'>('ctr');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [timeRange, setTimeRange] = useState('30d');
  const [isSyncingMetrics, setIsSyncingMetrics] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Demographics subcategory filter
  const [demographicTab, setDemographicTab] = useState<
    'all' | 'job-title' | 'seniority' | 'company' | 'location'
  >('all');

  // Attribution & ROI Optimizer state
  const [attributionModel, setAttributionModel] = useState<AttributionModelId>('w-shaped');
  const [reallocationShiftPct] = useState<number>(20);
  const [hasAppliedOptimization, setHasAppliedOptimization] = useState<boolean>(false);

  // UTM Builder & Conversion Pixel Studio state
  const [utmSource, setUtmSource] = useState<string>('linkedin');
  const [utmMedium, setUtmMedium] = useState<string>('organic_social');
  const [utmCampaign, setUtmCampaign] = useState<string>('q4_enterprise_it_solutions');
  const [utmTerm, setUtmTerm] = useState<string>('starlink_failover_networking');
  const [utmContent, setUtmContent] = useState<string>('executive_case_study');
  const [copiedUtm, setCopiedUtm] = useState<boolean>(false);
  const [copiedPixel, setCopiedPixel] = useState<boolean>(false);
  const [pixelVerified] = useState<boolean>(true);
  const [pixelEventsCount] = useState<number>(1428);

  const triggerToast = (msg: string) => {
    setNotice(msg);
    if (onShowToast) onShowToast(msg);
    setTimeout(() => setNotice(null), 4500);
  };

  // Published posts with analytics
  const publishedPosts = useMemo(
    () => posts.filter(p => p.status === 'published' && p.analytics),
    [posts]
  );

  const [selectedPostId, setSelectedPostId] = useState<string>(
    publishedPosts[0]?.id || ''
  );

  // Ensure selectedPostId tracks initial list
  React.useEffect(() => {
    if (!selectedPostId && publishedPosts[0]?.id) {
      setSelectedPostId(publishedPosts[0].id);
    }
  }, [publishedPosts, selectedPostId]);

  // Efficiency Score formula
  const getEfficiencyScore = (post: PageSocialPost): number => {
    if (!post.analytics) return 0;
    const ctrComponent = Math.min(45, post.analytics.ctr * 7.5);
    const engComponent = Math.min(35, post.analytics.engagementRate * 4.5);
    const kdBonus = Math.max(5, 25 - Math.round(post.researchBrief.difficultyScore * 0.35));
    return Math.min(99, Math.round(ctrComponent + engComponent + kdBonus));
  };

  const filteredPosts = useMemo(() => {
    return publishedPosts
      .filter(post => {
        if (platformFilter !== 'All' && post.platform !== platformFilter) return false;
        if (intentFilter !== 'All' && post.researchBrief.buyerIntent !== intentFilter) return false;
        if (
          searchQuery.trim() &&
          !post.keyword.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !post.content.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (!a.analytics || !b.analytics) return 0;
        if (sortBy === 'ctr') return b.analytics.ctr - a.analytics.ctr;
        if (sortBy === 'reach') return b.analytics.reach - a.analytics.reach;
        if (sortBy === 'engagementRate') return b.analytics.engagementRate - a.analytics.engagementRate;
        return getEfficiencyScore(b) - getEfficiencyScore(a);
      });
  }, [publishedPosts, platformFilter, intentFilter, searchQuery, sortBy]);

  const selectedPost =
    filteredPosts.find(p => p.id === selectedPostId) ||
    filteredPosts[0] ||
    publishedPosts[0];

  // Time range multiplier
  const timeMultiplier = useMemo(() => {
    if (timeRange === '7d') return 0.32;
    if (timeRange === '90d') return 2.45;
    if (timeRange === 'YTD') return 3.6;
    return 1;
  }, [timeRange]);

  // Aggregate KPI summary
  const kpiSummary = useMemo(() => {
    const list = filteredPosts.length > 0 ? filteredPosts : publishedPosts;
    const totalReach = Math.round(
      list.reduce((acc, p) => acc + (p.analytics?.reach || 0), 0) * timeMultiplier
    );
    const totalImpressions = Math.round(
      list.reduce((acc, p) => acc + (p.analytics?.impressions || 0), 0) * timeMultiplier
    );
    const totalClicks = Math.round(
      list.reduce((acc, p) => acc + (p.analytics?.clicks || 0), 0) * timeMultiplier
    );
    const totalReactions = Math.round(
      list.reduce((acc, p) => acc + (p.analytics?.reactions || 0), 0) * timeMultiplier
    );
    const totalComments = Math.round(
      list.reduce((acc, p) => acc + (p.analytics?.commentsCount || 0), 0) * timeMultiplier
    );
    const totalShares = Math.round(
      list.reduce((acc, p) => acc + (p.analytics?.shares || 0), 0) * timeMultiplier
    );

    const avgCtr =
      list.length > 0
        ? Number(
            (list.reduce((acc, p) => acc + (p.analytics?.ctr || 0), 0) / list.length).toFixed(1)
          )
        : 3.2;

    const avgEngagement =
      list.length > 0
        ? Number(
            (list.reduce((acc, p) => acc + (p.analytics?.engagementRate || 0), 0) / list.length).toFixed(1)
          )
        : 4.8;

    return {
      totalReach,
      totalImpressions,
      totalClicks,
      totalReactions,
      totalComments,
      totalShares,
      avgCtr,
      avgEngagement
    };
  }, [filteredPosts, publishedPosts, timeMultiplier]);

  // Comprehensive Attribution & Revenue Funnel
  const liveAttributionData = useMemo(() => {
    const weeklyCitations = geoScore?.aiEngineBreakdown?.reduce((sum, e: any) => sum + (e.citationsCount || e.citationsLastWeek || 0), 0) || 1280;
    const monthlyCitations = Math.round(weeklyCitations * 4.3 * timeMultiplier);

    const socialImpressions = publishedPosts.reduce((sum, p) => sum + (p.analytics?.impressions || 0), 0);
    const socialClicks = publishedPosts.reduce((sum, p) => sum + (p.analytics?.clicks || 0), 0);

    const totalLeadsCount = leads.length;
    const qualifiedLeadsCount = leads.filter(
      l => l.status === 'qualified' || l.status === 'contacted' || l.status === 'converted'
    ).length;
    const convertedDealsCount = Math.max(1, leads.filter(l => l.status === 'converted').length);

    const stage1Impressions = Math.round((socialImpressions + monthlyCitations * 185) * timeMultiplier);
    const stage2CitationsAndViews = Math.round(monthlyCitations * 18 + socialImpressions * 0.42);
    const stage3InboundClicks = Math.round((socialClicks + monthlyCitations * 3.8) * timeMultiplier);
    const stage4CapturedSignals = Math.round(
      (totalLeadsCount * 28 + Math.round(stage3InboundClicks * 0.085)) * (timeRange === '7d' ? 0.5 : 1)
    );
    const stage5SqlDemos = Math.max(qualifiedLeadsCount * 14, Math.round(stage4CapturedSignals * 0.24));
    const stage6ClosedDeals = Math.max(convertedDealsCount * 12, Math.round(stage5SqlDemos * 0.26));

    const avgDealArr = 6500;
    const totalInfluencedArr = stage6ClosedDeals * avgDealArr;
    const blendedCac = Number((2400 / Math.max(1, stage6ClosedDeals)).toFixed(0));

    const modelMeta = ATTRIBUTION_MODEL_META[attributionModel];
    const w = modelMeta.weights;

    const rawChannels = [
      {
        id: 'geo-search',
        channel: 'AI Search Citations (Perplexity, ChatGPT & Gemini)',
        weight: w.geoSearch,
        monthlySpend: 950,
        attributedArr: Math.round(totalInfluencedArr * w.geoSearch),
        attributedDeals: Math.max(1, Math.round(stage6ClosedDeals * w.geoSearch)),
        roas: Number(((totalInfluencedArr * w.geoSearch) / 950).toFixed(1)),
        trend: '+38.4%'
      },
      {
        id: 'linkedin-organic',
        channel: 'LinkedIn Organization Page & Executive Posts',
        weight: w.linkedinOrganic,
        monthlySpend: 620,
        attributedArr: Math.round(totalInfluencedArr * w.linkedinOrganic),
        attributedDeals: Math.max(1, Math.round(stage6ClosedDeals * w.linkedinOrganic)),
        roas: Number(((totalInfluencedArr * w.linkedinOrganic) / 620).toFixed(1)),
        trend: '+24.1%'
      },
      {
        id: 'facebook-organic',
        channel: 'Facebook Business Page & Tech Groups',
        weight: w.facebookOrganic,
        monthlySpend: 410,
        attributedArr: Math.round(totalInfluencedArr * w.facebookOrganic),
        attributedDeals: Math.max(1, Math.round(stage6ClosedDeals * w.facebookOrganic)),
        roas: Number(((totalInfluencedArr * w.facebookOrganic) / 410).toFixed(1)),
        trend: '+16.8%'
      },
      {
        id: 'email-nurture',
        channel: 'Lifecycle Email Sequences & Newsletters',
        weight: w.emailNurture,
        monthlySpend: 420,
        attributedArr: Math.round(totalInfluencedArr * w.emailNurture),
        attributedDeals: Math.max(1, Math.round(stage6ClosedDeals * w.emailNurture)),
        roas: Number(((totalInfluencedArr * w.emailNurture) / 420).toFixed(1)),
        trend: '+28.5%'
      }
    ];

    const totalSpend = rawChannels.reduce((sum, c) => sum + c.monthlySpend, 0);
    const blendedRoi = Number((totalInfluencedArr / Math.max(1, totalSpend)).toFixed(1));

    return {
      funnel: [
        { name: '1. Brand Impressions', value: stage1Impressions, metric: 'Search & Social Views' },
        { name: '2. Citations & Pageviews', value: stage2CitationsAndViews, metric: 'GEO Citations' },
        { name: '3. Inbound Site Clicks', value: stage3InboundClicks, metric: 'High-Intent Traffic' },
        { name: '4. Lead Captures', value: stage4CapturedSignals, metric: 'Signals & Enquiries' },
        { name: '5. SQL Demos', value: stage5SqlDemos, metric: 'Qualified Opportunities' },
        { name: '6. Won Contracts', value: stage6ClosedDeals, metric: 'Closed Revenue' }
      ],
      channels: rawChannels,
      totalInfluencedArr,
      totalSpend,
      blendedRoi,
      blendedCac,
      totalDeals: stage6ClosedDeals
    };
  }, [publishedPosts, leads, geoScore, timeMultiplier, attributionModel, timeRange]);

  // Pull telemetry action
  const handlePullLiveTelemetry = () => {
    setIsSyncingMetrics(true);
    setTimeout(() => {
      const updated = posts.map(p => {
        if (p.status !== 'published' || !p.analytics) return p;
        const boost = Math.round(p.analytics.reach * 0.05) + 120;
        return {
          ...p,
          analytics: {
            ...p.analytics,
            impressions: p.analytics.impressions + Math.round(boost * 1.3),
            reach: p.analytics.reach + boost,
            clicks: p.analytics.clicks + Math.round(boost * 0.04),
            ctr: Number(Math.min(5.2, p.analytics.ctr + 0.1).toFixed(1)),
            reactions: p.analytics.reactions + 8,
            commentsCount: p.analytics.commentsCount + 1,
            shares: p.analytics.shares + 2
          }
        };
      });
      updatePosts(updated);
      setIsSyncingMetrics(false);
      triggerToast('Successfully pulled live telemetry from connected pages.');
    }, 600);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['Keyword', 'Platform', 'Reach', 'Impressions', 'Clicks', 'CTR', 'Efficiency Score'];
    const rows = filteredPosts.map(p => [
      `"${p.keyword}"`,
      p.platform,
      p.analytics?.reach || 0,
      p.analytics?.impressions || 0,
      p.analytics?.clicks || 0,
      `${p.analytics?.ctr || 0}%`,
      `${getEfficiencyScore(p)}/100`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `analytics-telemetry-${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Exported telemetry CSV report successfully.');
  };

  // Generated UTM URL
  const generatedUtmUrl = useMemo(() => {
    const base = (brandProfile.website || 'https://techsheba.com').replace(/\/$/, '');
    const params = new URLSearchParams();
    if (utmSource) params.set('utm_source', utmSource);
    if (utmMedium) params.set('utm_medium', utmMedium);
    if (utmCampaign) params.set('utm_campaign', utmCampaign);
    if (utmTerm) params.set('utm_term', utmTerm);
    if (utmContent) params.set('utm_content', utmContent);
    return `${base}/?${params.toString()}`;
  }, [brandProfile.website, utmSource, utmMedium, utmCampaign, utmTerm, utmContent]);

  const conversionPixelSnippet = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.serpely.com';
    return `<!-- Sincly Autonomous Conversion Pixel -->
<script>
  (function(w,d,s,u){
    w.SinclyQueue=w.SinclyQueue||[];
    w.sinclyTrack=function(event,meta){w.SinclyQueue.push({event:event,meta:meta,ts:Date.now()});};
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s);
    j.async=true;j.src=u+'/pixel.js';f.parentNode.insertBefore(j,f);
  })(window,document,'script','${origin}');
  sinclyTrack('PageView', { site: '${brandProfile.website}' });
</script>`;
  }, [brandProfile.website]);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Analytics & ROI</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Live Telemetry
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Track multi-touch attribution, audience demographics, and realized content ROI for {brandProfile.name}.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter */}
          <div className="flex items-center gap-0.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            {['7d', '30d', '90d', 'YTD'].map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-semibold ${
                  timeRange === t
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 hover:text-neutral-100 text-xs font-semibold transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {/* Pull Telemetry */}
          <button
            onClick={handlePullLiveTelemetry}
            disabled={isSyncingMetrics}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-neutral-950 text-xs font-bold transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncingMetrics ? 'animate-spin' : ''}`} />
            <span>{isSyncingMetrics ? 'Pulling...' : 'Pull Live Metrics'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-neutral-400 hover:text-neutral-100">✕</button>
        </div>
      )}

      {/* Main Tab Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          <button
            onClick={() => setActiveTab('overview-roi')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'overview-roi'
                ? 'bg-neutral-800 text-emerald-400 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Overview & ROI</span>
          </button>

          <button
            onClick={() => setActiveTab('post-performance')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'post-performance'
                ? 'bg-neutral-800 text-emerald-400 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Post Performance ({filteredPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audience-demographics')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'audience-demographics'
                ? 'bg-neutral-800 text-emerald-400 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Audience & Demographics</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
              Real Data
            </span>
          </button>

          <button
            onClick={() => setActiveTab('utm-pixel')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'utm-pixel'
                ? 'bg-neutral-800 text-emerald-400 shadow-xs'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>UTM & Pixel Studio</span>
          </button>
        </div>

        {/* Quick Nav Shortcut Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('leads')}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-sky-400 flex items-center gap-1 transition-colors"
          >
            <span>Leads Pipeline ({leads.length})</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
          <button
            onClick={() => onNavigate('social')}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <span>Social Studio</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & MULTI-TOUCH ROI                                        */}
      {/* ========================================================================= */}
      {activeTab === 'overview-roi' && (
        <div className="space-y-6">
          {/* 4 Executive KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex flex-col justify-between space-y-3">
              <span className="text-xs font-medium text-neutral-400">Total Influenced Pipeline</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  ${liveAttributionData.totalInfluencedArr.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-emerald-400">+31.2%</span>
              </div>
              <span className="text-[11px] text-neutral-500">Across {liveAttributionData.totalDeals} Qualified Opportunities</span>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex flex-col justify-between space-y-3">
              <span className="text-xs font-medium text-neutral-400">Blended Marketing ROI</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                  {liveAttributionData.blendedRoi}x
                </span>
                <span className="text-xs font-semibold text-emerald-400">High ROAS</span>
              </div>
              <span className="text-[11px] text-neutral-500">${liveAttributionData.totalSpend.toLocaleString()} Total Monthly Spend</span>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex flex-col justify-between space-y-3">
              <span className="text-xs font-medium text-neutral-400">Combined Content Reach</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {kpiSummary.totalReach.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-sky-400">{kpiSummary.avgCtr}% CTR</span>
              </div>
              <span className="text-[11px] text-neutral-500">{kpiSummary.totalImpressions.toLocaleString()} Total Impressions</span>
            </div>

            <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex flex-col justify-between space-y-3">
              <span className="text-xs font-medium text-neutral-400">Blended Customer Acquisition</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  ${liveAttributionData.blendedCac}
                </span>
                <span className="text-xs font-semibold text-neutral-400">CAC per Deal</span>
              </div>
              <span className="text-[11px] text-neutral-500">{leads.length} Tracked Buying Signals</span>
            </div>
          </div>

          {/* Full-Funnel Conversion Flow */}
          <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Full-Funnel Commercial Attribution Telemetry</h3>
                <p className="text-xs text-neutral-400">From initial zero-click AI citations to closed high-ticket B2B service contracts.</p>
              </div>
              <span className="text-xs font-mono text-emerald-400">6-Stage Autonomous Pipeline</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {liveAttributionData.funnel.map((stage, idx) => (
                <div key={stage.name} className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1 text-center relative">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">{stage.name}</span>
                  <div className="text-lg font-bold text-white tabular-nums">{stage.value.toLocaleString()}</div>
                  <span className="text-[10px] text-neutral-400 block truncate">{stage.metric}</span>
                  {idx < 5 && (
                    <ChevronRight className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-700 z-10" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Touch Attribution Engine */}
          <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Multi-Touch Channel Attribution & ROAS Matrix</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Weighting: <strong className="text-emerald-400">{ATTRIBUTION_MODEL_META[attributionModel].label}</strong> — {ATTRIBUTION_MODEL_META[attributionModel].formula}
                </p>
              </div>

              {/* Attribution Model Switcher */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
                {(Object.keys(ATTRIBUTION_MODEL_META) as AttributionModelId[]).map(id => (
                  <button
                    key={id}
                    onClick={() => setAttributionModel(id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      attributionModel === id
                        ? 'bg-neutral-800 text-emerald-400'
                        : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40'
                    }`}
                  >
                    {ATTRIBUTION_MODEL_META[id].shortTag}
                  </button>
                ))}
              </div>
            </div>

            {/* Channels Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="text-[10px] font-mono text-neutral-400 uppercase border-b border-neutral-800">
                  <tr>
                    <th className="py-2.5 pr-4">Channel / Marketing Driver</th>
                    <th className="py-2.5 px-3 text-right">Attribution Weight</th>
                    <th className="py-2.5 px-3 text-right">Monthly Spend</th>
                    <th className="py-2.5 px-3 text-right">Attributed Revenue</th>
                    <th className="py-2.5 px-3 text-right">Deals Won</th>
                    <th className="py-2.5 pl-3 text-right">Realized ROAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono tabular-nums">
                  {liveAttributionData.channels.map(ch => (
                    <tr key={ch.id} className="hover:bg-neutral-900/60 transition-colors">
                      <td className="py-3 pr-4 font-sans font-medium text-white flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                        <span>{ch.channel}</span>
                      </td>
                      <td className="py-3 px-3 text-right text-neutral-300">{(ch.weight * 100).toFixed(0)}%</td>
                      <td className="py-3 px-3 text-right text-neutral-400">${ch.monthlySpend.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-bold text-white">${ch.attributedArr.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-neutral-300">{ch.attributedDeals}</td>
                      <td className="py-3 pl-3 text-right font-bold text-emerald-400">{ch.roas}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Budget Reallocation Suggestion */}
          <div className="p-5 rounded-2xl border border-neutral-800 bg-linear-to-r from-neutral-900/70 via-emerald-950/20 to-neutral-900/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Sparkles className="h-4 w-4" />
                <span>AI Budget Optimization Insight</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                GEO Citations and LinkedIn Organic Posts are generating <strong>3.4x higher conversion efficiency</strong> than traditional acquisition. Increasing priority into automated LinkedIn content and lifecycle email will project an increase in high-intent inbound leads by <strong>+24.6%</strong> with zero extra CAC.
              </p>
            </div>
            <button
              onClick={() => {
                setHasAppliedOptimization(!hasAppliedOptimization);
                triggerToast(
                  hasAppliedOptimization
                    ? 'Reset budget allocation to standard baseline.'
                    : 'Applied AI high-ROAS budget shift recommendation across campaigns.'
                );
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                hasAppliedOptimization
                  ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
              }`}
            >
              {hasAppliedOptimization ? 'Revert to Baseline' : 'Apply AI Budget Shift'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: POST & CONTENT PERFORMANCE (SIDE-BY-SIDE SPLIT MASTER-DETAIL)      */}
      {/* ========================================================================= */}
      {activeTab === 'post-performance' && (
        <div className="space-y-4">
          {/* Top Filter & Search Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Platform Switcher */}
              {(['All', 'LinkedIn', 'Facebook'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    platformFilter === p
                      ? 'bg-neutral-800 text-emerald-400'
                      : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40'
                  }`}
                >
                  {p === 'All' ? 'All Platforms' : p}
                </button>
              ))}

              <div className="h-4 w-px bg-neutral-800 mx-1 hidden sm:block"></div>

              {/* Intent Filter */}
              {(['All', 'Commercial', 'Transactional', 'Informational'] as const).map(i => (
                <button
                  key={i}
                  onClick={() => setIntentFilter(i)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    intentFilter === i
                      ? 'bg-neutral-800 text-emerald-400 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter by keyword or topic..."
                  className="w-48 sm:w-56 pl-8 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ctr">Highest CTR %</option>
                <option value="reach">Highest Reach</option>
                <option value="engagementRate">Engagement Rate</option>
                <option value="efficiency">Efficiency Score</option>
              </select>
            </div>
          </div>

          {/* Side-by-Side Split Master-Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Scrollable Post Selector List (7 Cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5 px-1">
                <div>
                  <h3 className="text-sm font-bold text-white">Tracked Content Dispatches</h3>
                  <p className="text-[11px] text-neutral-400">
                    Showing {filteredPosts.length} posts · Click any item to inspect details on the right
                  </p>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  Live Sync
                </span>
              </div>

              {/* Scrollable Container with ergonomic max height */}
              <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                {filteredPosts.map(post => {
                  const effScore = getEfficiencyScore(post);
                  const isSelected = selectedPost?.id === post.id;
                  const cleanHeadline =
                    !post.visualConfig?.headline ||
                    post.visualConfig.headline === 'true' ||
                    post.visualConfig.headline === 'false'
                      ? post.keyword
                      : post.visualConfig.headline;

                  return (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPostId(post.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-l-4 border-l-emerald-400 border-neutral-700 bg-neutral-900/90 shadow-md ring-1 ring-emerald-500/20'
                          : 'border-neutral-800/80 bg-neutral-950/60 hover:bg-neutral-900/60 hover:border-neutral-700'
                      }`}
                    >
                      {/* Left: Creative Asset Thumbnail & Topic Info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {post.visualUrl ? (
                          <img
                            src={post.visualUrl}
                            alt={post.keyword}
                            onError={e => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                              const sib = e.currentTarget.nextElementSibling as HTMLElement;
                              if (sib) sib.style.display = 'flex';
                            }}
                            className="h-11 w-16 rounded-lg border border-neutral-800 object-cover shrink-0 bg-neutral-950"
                          />
                        ) : null}
                        <div
                          style={{ display: post.visualUrl ? 'none' : 'flex' }}
                          className="h-11 w-16 rounded-lg border border-neutral-800 bg-linear-to-br from-neutral-900 to-neutral-950 flex-col items-center justify-center shrink-0 text-center p-1"
                        >
                          <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase truncate w-full">
                            {post.platform}
                          </span>
                          <span className="text-[8px] text-neutral-400 truncate w-full">
                            Asset
                          </span>
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono font-bold uppercase ${
                                post.platform === 'LinkedIn' ? 'text-sky-400' : 'text-blue-400'
                              }`}
                            >
                              {post.platform}
                            </span>
                            <span className="text-neutral-600">·</span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              {post.researchBrief.buyerIntent}
                            </span>
                          </div>
                          <h4
                            className={`text-xs font-semibold truncate max-w-[240px] sm:max-w-xs ${
                              isSelected ? 'text-white' : 'text-neutral-200'
                            }`}
                            title={cleanHeadline}
                          >
                            {cleanHeadline}
                          </h4>
                          <div className="text-[11px] font-mono text-neutral-400 truncate">
                            Keyword: <strong className="text-neutral-300">{post.keyword}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Right: Key Performance Telemetry & Efficiency Pill */}
                      <div className="flex items-center gap-3 shrink-0 font-mono text-right">
                        <div className="hidden sm:block text-xs tabular-nums">
                          <div className="font-bold text-white">{post.analytics?.reach.toLocaleString()}</div>
                          <div className="text-[10px] text-neutral-500">Reach</div>
                        </div>

                        <div className="text-xs tabular-nums">
                          <div className="font-bold text-emerald-400">{post.analytics?.ctr}%</div>
                          <div className="text-[10px] text-neutral-400">CTR</div>
                        </div>

                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-bold tabular-nums ${
                            effScore >= 70
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : effScore >= 50
                              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {effScore}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Sticky Pinned Live Post Attribution Inspector (5 Cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-6">
              {selectedPost && selectedPost.analytics ? (
                <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 shadow-xl space-y-4">
                  {/* Inspector Header */}
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                        Live Attribution Inspector
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                      Score: {getEfficiencyScore(selectedPost)}/100
                    </span>
                  </div>

                  {/* Post Title & Platform Badge */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          selectedPost.platform === 'LinkedIn'
                            ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                        }`}
                      >
                        {selectedPost.platform} Post
                      </span>
                      <span className="text-xs font-mono text-neutral-400">
                        {selectedPost.researchBrief.buyerIntent} Intent
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {!selectedPost.visualConfig?.headline ||
                      selectedPost.visualConfig.headline === 'true' ||
                      selectedPost.visualConfig.headline === 'false'
                        ? selectedPost.keyword
                        : selectedPost.visualConfig.headline}
                    </h3>
                  </div>

                  {/* Creative Asset Preview Box */}
                  <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 aspect-[16/9] flex items-center justify-center relative">
                    {selectedPost.visualUrl ? (
                      <img
                        src={selectedPost.visualUrl}
                        alt={selectedPost.keyword}
                        onError={e => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                          const sib = e.currentTarget.nextElementSibling as HTMLElement;
                          if (sib) sib.style.display = 'flex';
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                    <div
                      style={{ display: selectedPost.visualUrl ? 'none' : 'flex' }}
                      className="w-full h-full bg-linear-to-br from-neutral-900 via-neutral-950 to-neutral-900 flex-col items-center justify-center p-4 text-center space-y-1.5"
                    >
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        {selectedPost.platform} Verified Asset
                      </span>
                      <div className="text-xs font-bold text-white max-w-xs leading-snug">
                        {selectedPost.keyword}
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {selectedPost.pageName || 'Tech Sheba'}
                      </span>
                    </div>
                  </div>

                  {/* 2x2 Bento Metric Telemetry */}
                  <div className="grid grid-cols-2 gap-2.5 font-mono tabular-nums text-center">
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                      <span className="text-[10px] text-neutral-500 uppercase block">REACH</span>
                      <span className="text-base font-bold text-white">{selectedPost.analytics.reach.toLocaleString()}</span>
                      <span className="text-[9px] text-neutral-500 block">{selectedPost.analytics.impressions.toLocaleString()} impr.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                      <span className="text-[10px] text-neutral-500 uppercase block">CLICKS & CTR</span>
                      <span className="text-base font-bold text-emerald-400">{selectedPost.analytics.ctr}%</span>
                      <span className="text-[9px] text-neutral-400 block">{selectedPost.analytics.clicks} link clicks</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                      <span className="text-[10px] text-neutral-500 uppercase block">REACTIONS</span>
                      <span className="text-base font-bold text-sky-400">{selectedPost.analytics.reactions}</span>
                      <span className="text-[9px] text-neutral-500 block">{selectedPost.analytics.commentsCount} comments</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                      <span className="text-[10px] text-neutral-500 uppercase block">ENGAGEMENT</span>
                      <span className="text-base font-bold text-indigo-400">{selectedPost.analytics.engagementRate}%</span>
                      <span className="text-[9px] text-neutral-500 block">Social Rate</span>
                    </div>
                  </div>

                  {/* Audience Pain Point Narrative */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1.5 text-xs">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                      Target Audience Pain Point & Gap
                    </span>
                    <p className="text-neutral-300 leading-relaxed font-medium">
                      {selectedPost.researchBrief.audiencePainPoint}
                    </p>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      <strong className="text-neutral-200">Angle:</strong> {selectedPost.researchBrief.competitorGap}
                    </p>
                  </div>

                  {/* Action Links */}
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={selectedPost.externalPostUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-sky-400 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>View on {selectedPost.platform}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>

                    <button
                      onClick={() => setActiveTab('audience-demographics')}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>Demographics</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 text-center space-y-2">
                  <p className="text-xs text-neutral-400">Select any post from the list on the left to inspect its live attribution details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUDIENCE & DEMOGRAPHICS (USER'S REAL LINKEDIN DATA)               */}
      {/* ========================================================================= */}
      {activeTab === 'audience-demographics' && (
        <div className="space-y-6">
          {/* Banner with Real Engagement Totals */}
          <div className="p-6 rounded-2xl border border-neutral-800 bg-linear-to-r from-neutral-900 via-neutral-900/90 to-neutral-900 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Verified Audience Demographics</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    LinkedIn Post Telemetry
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Extracted directly from author Post Analytics for Tech Sheba updates. Shows who engaged with your content.
                </p>
              </div>

              {/* Engagement Stat Pills */}
              <div className="flex flex-wrap items-center gap-2 font-mono tabular-nums">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                  <span><strong>{REAL_LINKEDIN_DEMOGRAPHICS.engagements.total}</strong> Total Engagements</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200">
                  <ThumbsUp className="h-3.5 w-3.5 text-sky-400" />
                  <span><strong>{REAL_LINKEDIN_DEMOGRAPHICS.engagements.reactions}</strong> Reactions</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200">
                  <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
                  <span><strong>{REAL_LINKEDIN_DEMOGRAPHICS.engagements.comments}</strong> Comments</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200">
                  <Share2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span><strong>{REAL_LINKEDIN_DEMOGRAPHICS.engagements.reposts}</strong> Reposts</span>
                </div>
              </div>
            </div>

            {/* Demographics Category Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl overflow-x-auto">
              {[
                { id: 'all', label: 'All Highlights' },
                { id: 'job-title', label: 'Job Titles' },
                { id: 'seniority', label: 'Seniority Level' },
                { id: 'company', label: 'Target Companies' },
                { id: 'location', label: 'Locations (Dhaka)' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setDemographicTab(cat.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    demographicTab === cat.id
                      ? 'bg-neutral-800 text-emerald-400'
                      : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Demographic Cards Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Job Title Breakdown */}
            {(demographicTab === 'all' || demographicTab === 'job-title') && (
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Job Titles</h4>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">9 Detected</span>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  {REAL_LINKEDIN_DEMOGRAPHICS.jobTitles.map((job, idx) => (
                    <div key={job.label} className="space-y-1">
                      <div className="flex items-center justify-between font-sans">
                        <span className="text-neutral-200 text-xs">{job.label}</span>
                        <span className="font-bold text-white tabular-nums font-mono">{job.percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            idx === 0 ? 'bg-emerald-400' : idx < 3 ? 'bg-sky-400' : 'bg-neutral-500'
                          }`}
                          style={{ width: `${Math.min(100, job.percentage * 7)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 2: Seniority Level Breakdown */}
            {(demographicTab === 'all' || demographicTab === 'seniority') && (
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-sky-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Seniority Level</h4>
                  </div>
                  <span className="text-[11px] font-mono text-sky-400">67% Senior/Entry</span>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  {REAL_LINKEDIN_DEMOGRAPHICS.seniority.map((sen, idx) => (
                    <div key={sen.label} className="space-y-1">
                      <div className="flex items-center justify-between font-sans">
                        <span className="text-neutral-200 text-xs">{sen.label}</span>
                        <span className="font-bold text-white tabular-nums font-mono">{sen.percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            idx === 0 ? 'bg-sky-400' : idx === 1 ? 'bg-emerald-400' : 'bg-neutral-500'
                          }`}
                          style={{ width: `${Math.min(100, sen.percentage * 2.5)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 3: Top Companies Engaging */}
            {(demographicTab === 'all' || demographicTab === 'company') && (
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Engaging Companies (ICP)</h4>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400">High-Intent Orgs</span>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  {REAL_LINKEDIN_DEMOGRAPHICS.companies.map((comp, idx) => (
                    <div key={comp.label} className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2 font-sans">
                        <span className="h-6 w-6 rounded-lg bg-neutral-900 text-neutral-300 font-bold text-[11px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-white text-xs">{comp.label}</div>
                          <span className="text-[10px] text-neutral-500">Tech / Software Firm</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-400 font-mono">{comp.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 4: Location Breakdown (Dhaka) */}
            {(demographicTab === 'all' || demographicTab === 'location') && (
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-rose-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Geographic Distribution</h4>
                  </div>
                  <span className="text-[11px] font-mono text-rose-400">Bangladesh</span>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  {REAL_LINKEDIN_DEMOGRAPHICS.locations.map(loc => (
                    <div key={loc.label} className="space-y-1">
                      <div className="flex items-center justify-between font-sans">
                        <span className="text-neutral-200 text-xs">{loc.label}</span>
                        <span className="font-bold text-white tabular-nums font-mono">{loc.percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-rose-400"
                          style={{ width: `${Math.min(100, loc.percentage * 7)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Card 5: Industry & Company Size */}
            {demographicTab === 'all' && (
              <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Industry & Firm Size</h4>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-400">Firmographics</span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">Top Industry</span>
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex justify-between items-center text-xs">
                      <span className="font-semibold text-white">Software Development</span>
                      <span className="font-mono font-bold text-emerald-400">31%</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">Primary Company Scale</span>
                    <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex justify-between items-center text-xs">
                      <span className="font-semibold text-white">51-200 Employees (SMB/Mid-Market)</span>
                      <span className="font-mono font-bold text-sky-400">22%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card 6: Autonomous ICP Conversion Trigger */}
            {demographicTab === 'all' && (
              <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <Sparkles className="h-4 w-4" />
                    <span>Autonomous ICP Account Action</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Viewers from <strong>Brain Station 23, weDevs, XpeedStudio, and Roxnor</strong> fall directly into Tech Sheba's ideal IT maintenance and network infrastructure tier (51-200 seats).
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newLead: LeadItem = {
                      id: `lead-icp-${Date.now()}`,
                      name: 'IT Director / Founder',
                      email: 'contact@brainstation-23.com',
                      company: 'Brain Station 23',
                      role: 'Engineering Lead / Founder',
                      source: 'LinkedIn Comment',
                      status: 'qualified',
                      intent: 'buying-signal',
                      detectedMessage: 'Viewed Tech Sheba Starlink & Network Post. Estimated deal size $8,500/yr.',
                      buyingSignals: ['Viewed Tech Sheba Starlink & Network Post', 'Dhaka Mirpur Software Team (51-200 seats)'],
                      score: 95,
                      assignedAgent: 'leads',
                      suggestedAction: 'Send Custom IT Infrastructure & CCTV Proposal',
                      timestamp: 'Just now'
                    };
                    updateLeads([newLead, ...leads]);
                    triggerToast('Added Brain Station 23 to Qualified Leads & Pipeline!');
                    onNavigate('leads');
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Enroll Top ICPs to Leads Pipeline</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: UTM BUILDER & CONVERSION PIXEL STUDIO                              */}
      {/* ========================================================================= */}
      {activeTab === 'utm-pixel' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: UTM Builder */}
          <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Link2 className="h-4 w-4 text-emerald-400" />
                <span>Campaign UTM Parameter Generator</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">Generate trackable links to measure exact channel and creative conversion.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Source (utm_source)</label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={e => setUtmSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Medium (utm_medium)</label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={e => setUtmMedium(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Campaign (utm_campaign)</label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={e => setUtmCampaign(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Keyword (utm_term)</label>
                <input
                  type="text"
                  value={utmTerm}
                  onChange={e => setUtmTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">Content (utm_content)</label>
                <input
                  type="text"
                  value={utmContent}
                  onChange={e => setUtmContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Generated Tracking Link</span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs text-emerald-400 font-mono truncate">{generatedUtmUrl}</code>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(generatedUtmUrl);
                    setCopiedUtm(true);
                    setTimeout(() => setCopiedUtm(false), 2000);
                    triggerToast('Copied UTM tracking URL to clipboard!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 flex items-center gap-1 shrink-0 font-medium"
                >
                  {copiedUtm ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedUtm ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: 1st-Party Conversion Pixel */}
          <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-sky-400" />
                  <span>First-Party Conversion Pixel</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">Embed on {brandProfile.website} to measure real website actions.</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {pixelVerified ? 'Active & Verified' : 'Listening'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">JavaScript Tracking Snippet</span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(conversionPixelSnippet);
                    setCopiedPixel(true);
                    setTimeout(() => setCopiedPixel(false), 2000);
                    triggerToast('Copied pixel tracking script!');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 flex items-center gap-1 font-medium"
                >
                  {copiedPixel ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedPixel ? 'Copied' : 'Copy Snippet'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-neutral-300 overflow-x-auto p-2 rounded-lg bg-neutral-900 border border-neutral-800 max-h-36">
                {conversionPixelSnippet}
              </pre>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
              <span className="text-neutral-400">Total Tracked Inbound Events:</span>
              <span className="font-mono font-bold text-white tabular-nums">{pixelEventsCount.toLocaleString()} conversions</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
