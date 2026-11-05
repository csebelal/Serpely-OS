import {
  AgentInfo,
  CampaignItem,
  ContentItem,
  SocialPost,
  GeoScoreData,
  LeadItem,
  CommunityMessage,
  EmailCampaign,
  EmailTemplate,
  EmailSequenceWorkflow,
  SaaSAppProfile,
  SmtpConfig,
  EmailContact,
  MemoryItem,
  AutomationRule,
  IntegrationItem,
  ApprovalItem,
  YouTubeVideoProject,
  SocialChannelAccount,
  VideoMutationConfig,
  SocialVisualCardConfig,
  VisualCardLayout,
  SocialPagePlatform,
  KeywordResearchBrief,
  ConnectedSocialPage,
  PageSocialPost,
  BrandProfile,
  ReportItem,
  MeetingItem,
  MessagingConfig
} from '../types';

export const mockAgents: AgentInfo[] = [
  {
    id: 'orchestrator',
    name: 'AI Orchestrator',
    role: 'Central Dispatcher & QA Supervisor',
    department: 'RESEARCH',
    riskLevel: 'low',
    phase: 1,
    model: 'gemini-3.8-flash (Reasoning Core)',
    status: 'active',
    description: 'Deconstructs high-level marketing goals, plans multi-agent pipelines, enforces human approval gates on high-risk actions, and audits final outputs.',
    inputContract: {
      format: 'JSON / Natural Language',
      fields: ['prompt', 'campaignContext', 'budgetLimit', 'urgencyTier']
    },
    outputContract: {
      format: 'Structured Pipeline Plan',
      fields: ['stepSequence', 'assignedAgents', 'riskAssessment', 'approvalGates']
    },
    stats: {
      tasksCompleted: 0,
      accuracyScore: 100,
      avgLatencyMs: 0
    }
  },
  {
    id: 'research',
    name: 'Market Research Agent',
    role: 'Competitive Intelligence & Trend Mining',
    department: 'RESEARCH',
    riskLevel: 'low',
    phase: 1,
    model: 'gemini-3.8-flash (Deep Intel)',
    status: 'idle',
    description: 'Monitors competitor pricing, search engine algorithm updates, audience pain points, and AI search visibility trends.',
    inputContract: {
      format: 'JSON Query',
      fields: ['competitorList', 'marketNiche', 'targetPersona', 'timeWindow']
    },
    outputContract: {
      format: 'Competitive Brief JSON',
      fields: ['gapsIdentified', 'emergingKeywords', 'sentimentShift', 'strategicAngle']
    },
    stats: {
      tasksCompleted: 0,
      accuracyScore: 100,
      avgLatencyMs: 0
    }
  },
  {
    id: 'strategy',
    name: 'Marketing Strategy Agent',
    role: 'Positioning & Content Pillar Architect',
    department: 'CONTENT STUDIO',
    riskLevel: 'low',
    phase: 1,
    model: 'gemini-3.8-flash (Strategic)',
    status: 'idle',
    description: 'Transforms competitive insights into cohesive go-to-market strategies, core value propositions, and 30-day content pillars.',
    inputContract: {
      format: 'Research Brief',
      fields: ['marketResearchData', 'brandPillars', 'quarterlyKPIs']
    },
    outputContract: {
      format: 'Strategy Roadmap JSON',
      fields: ['coreMessage', 'contentDistributionMix', 'funnelStages', 'targetKPIs']
    },
    stats: {
      tasksCompleted: 0,
      accuracyScore: 100,
      avgLatencyMs: 0
    }
  },
  {
    id: 'content',
    name: 'Content Agent',
    role: 'Editorial & Thought-Leadership Writer',
    department: 'CONTENT STUDIO',
    riskLevel: 'low',
    phase: 1,
    model: 'gemini-3.8-flash (Creative Prose)',
    status: 'active',
    description: 'Drafts technical deep dives, LinkedIn posts, viral carousels, video script outlines, and case studies aligned with Serpely brand voice.',
    inputContract: {
      format: 'Content Brief',
      fields: ['strategyRoadmap', 'topic', 'formatType', 'wordCountTarget']
    },
    outputContract: {
      format: 'Formatted Markdown Draft',
      fields: ['headlineOptions', 'bodyDraft', 'callToAction', 'readingTimeMin']
    },
    stats: {
      tasksCompleted: 0,
      accuracyScore: 100,
      avgLatencyMs: 0
    }
  },
  {
    id: 'social',
    name: 'Social Media Agent',
    role: 'Multi-Channel Calendar & Publishing',
    department: 'POSTING & COMMUNITY',
    riskLevel: 'medium',
    phase: 1,
    model: 'gemini-3.8-flash (Social Dist)',
    status: 'idle',
    description: 'Schedules 7-day multi-platform distributions across LinkedIn, X, Instagram, and YouTube Shorts with optimal engagement timing.',
    inputContract: {
      format: 'Approved Content Draft',
      fields: ['contentId', 'targetChannels', 'desiredFrequency', 'mediaAssets']
    },
    outputContract: {
      format: 'Calendar Schedule JSON',
      fields: ['channelVariations', 'scheduledSlots', 'hashtagPayload', 'visualPlacement']
    },
    stats: {
      tasksCompleted: 0,
      accuracyScore: 100,
      avgLatencyMs: 0
    }
  },
  {
    id: 'community',
    name: 'Community Agent',
    role: 'Inbox & Sentiment Classifier',
    department: 'POSTING & COMMUNITY',
    riskLevel: 'medium',
    phase: 2,
    model: 'gemini-3.8-flash (Intent Scanner)',
    status: 'active',
    description: 'Scans all inbound comments, DMs, and mentions; classifies user intent (Buying Signal, Question, Praise, Spam) and drafts contextual responses.',
    inputContract: {
      format: 'Webhook Event Stream',
      fields: ['platformSource', 'senderProfile', 'messageBody', 'timestamp']
    },
    outputContract: {
      format: 'Classified Interaction JSON',
      fields: ['intentTier', 'sentimentCategory', 'draftReply', 'escalationFlag']
    },
    stats: {
      tasksCompleted: 0,
      accuracyScore: 100,
      avgLatencyMs: 0
    }
  },
  {
    id: 'leads',
    name: 'Lead Agent',
    role: 'Buying Signal Extraction & Pipeline Sync',
    department: 'POSTING & COMMUNITY',
    riskLevel: 'medium',
    phase: 1,
    model: 'gemini-3.8-flash (Sales Intel)',
    status: 'active',
    description: 'Detects high-intent commercial keywords ("cost", "pricing", "demo", "enterprise", "switch from Semrush") and routes directly into sales pipeline.',
    inputContract: {
      format: 'Interaction Payload',
      fields: ['communityMessageId', 'leadIdentity', 'inquiryBody']
    },
    outputContract: {
      format: 'Qualified Lead JSON',
      fields: ['leadScore', 'detectedSignals', 'lifecycleStage', 'suggestedOutreach']
    },
    stats: {
      tasksCompleted: 0,
      accuracyScore: 100,
      avgLatencyMs: 0
    }
  },
  {
    id: 'seo',
    name: 'SEO & GEO Agent',
    role: 'Generative Engine Optimization & Citation Audit',
    department: 'RESEARCH',
    riskLevel: 'low',
    phase: 2,
    model: 'gemini-3.8-flash (Search Intel)',
    status: 'active',
    description: 'Monitors Serpely GEO Score (0–100), tracks brand citations across ChatGPT, Perplexity, Gemini, and Google AI Overviews, and detects hallucinations.',
    inputContract: {
      format: 'Search Domain Config',
      fields: ['targetKeywords', 'brandEntities', 'competitorDomains']
    },
    outputContract: {
      format: 'GEO Report JSON',
      fields: ['geoScore', 'engineCitations', 'hallucinationAlerts', 'knowledgeGraphGaps']
    },
    stats: {
      tasksCompleted: 0,
      accuracyScore: 100,
      avgLatencyMs: 0
    }
  },
  {
    id: 'email',
    name: 'Email Agent',
    role: 'Lifecycle Sequences & Customer Comms',
    department: 'CONTENT STUDIO',
    riskLevel: 'high',
    phase: 2,
    model: 'gemini-3.8-flash (Direct Response)',
    status: 'idle',
    description: 'Drafts promotional email broadcasts, onboarding sequences, trial-to-paid nurture cadences, and monthly GEO updates.',
    inputContract: {
      format: 'Email Campaign Request',
      fields: ['audienceSegment', 'campaignTrigger', 'offerDetails']
    },
    outputContract: {
      format: 'Email Sequence JSON',
      fields: ['subjectLineVariations', 'preheader', 'htmlBody', 'scheduledDelivery']
    },
    stats: {
      tasksCompleted: 0,
      accuracyScore: 100,
      avgLatencyMs: 0
    }
  },
  {
    id: 'analytics',
    name: 'Analytics Agent',
    role: 'Attribution & Conversion Optimization',
    department: 'GROWTH',
    riskLevel: 'low',
    phase: 1,
    model: 'gemini-3.8-flash (Data Analyst)',
    status: 'idle',
    description: 'Analyzes multi-channel funnels, attribution weight, winner/loser patterns, and generates actionable executive growth summaries.',
    inputContract: {
      format: 'Multi-Source Telemetry',
      fields: ['ga4Data', 'adSpendMetrics', 'crmConversions', 'timeWindow']
    },
    outputContract: {
      format: 'Attribution Report JSON',
      fields: ['channelROI', 'cacTrends', 'winningTactics', 'budgetReallocations']
    },
    stats: {
      tasksCompleted: 0,
      accuracyScore: 100,
      avgLatencyMs: 0
    }
  },
  {
    id: 'memory',
    name: 'Memory Agent',
    role: 'Continuous Learning & Vector Knowledge Store',
    department: 'GROWTH',
    riskLevel: 'low',
    phase: 1,
    model: 'gemini-3.8-flash (Vector Memory)',
    status: 'idle',
    description: 'Catalogs winning hooks, objection resolutions, audience reactions, and algorithmic shift patterns into the persistent Knowledge Hub.',
    inputContract: {
      format: 'Campaign Retrospective',
      fields: ['performanceDeltas', 'topPerformingAssets', 'customerFeedback']
    },
    outputContract: {
      format: 'Knowledge Synthesis JSON',
      fields: ['newRulesFormulated', 'confidenceScore', 'applicableAgents']
    },
    stats: {
      tasksCompleted: 0,
      accuracyScore: 100,
      avgLatencyMs: 0
    }
  }
];

export const mockBrandProfile: BrandProfile = {
  name: 'Serpely',
  website: 'https://serpely.com',
  tagline: 'Autonomous AI Marketing Operating System',
  mission: 'Empowering growth teams to orchestrate 12 specialized AI agents across search visibility (SEO & GEO), multi-channel social publishing, paid acquisition, and inbound lead conversion.',
  voiceTone: 'Authoritative, precise, visionary, developer-friendly, and data-backed.',
  coreUSPs: [],
  competitors: [],
  brandRules: [],
  knowledgeDocs: []
};

export const mockCampaigns: CampaignItem[] = [];
export const mockApprovals: ApprovalItem[] = [];
export const mockGeoScore: GeoScoreData = {
  overallScore: 0,
  change30Days: 0,
  lastAuditedUrl: '',
  lastAuditedAt: '',
  aiEngineBreakdown: [
    { engine: 'ChatGPT', score: 0, citationShare: 0, sentiment: 'Neutral', citationsLastWeek: 0, topQuery: '' },
    { engine: 'Perplexity', score: 0, citationShare: 0, sentiment: 'Neutral', citationsLastWeek: 0, topQuery: '' },
    { engine: 'Google AI Overviews', score: 0, citationShare: 0, sentiment: 'Neutral', citationsLastWeek: 0, topQuery: '' },
    { engine: 'Gemini', score: 0, citationShare: 0, sentiment: 'Neutral', citationsLastWeek: 0, topQuery: '' }
  ],
  hallucinationAlerts: [],
  topRankedEntities: [],
  technicalFixes: []
};
export const mockContentList: ContentItem[] = [];
export const mockSocialCalendar: SocialPost[] = [];
export const mockLeads: LeadItem[] = [];
export const mockCommunityMessages: CommunityMessage[] = [];
export const mockMemories: MemoryItem[] = [];
export const mockAutomations: AutomationRule[] = [
  {
    id: 'aut-linkedin-01',
    name: 'LinkedIn Post High-Intent Comment Responder',
    category: 'LinkedIn',
    description: 'Detects new comments and viral engagement spikes on LinkedIn Company & Executive posts. AI filters buyer intent and auto-drafts executive responses for approval.',
    triggerEvent: 'linkedin.post.comment_received',
    condition: 'Comment contains intent keywords (price, quote, demo, audit) or reactions > 15',
    actionPipeline: ['Intent Sentiment Filter', 'AI Executive Draft', 'Approval Gate', 'CRM Lead Sync'],
    active: true,
    timesTriggered: 34,
    lastTriggered: '15m ago'
  },
  {
    id: 'aut-facebook-02',
    name: 'Facebook Post Reach Velocity & Viral Booster',
    category: 'Facebook',
    description: 'Monitors newly published Facebook page posts. When a post reaches >50 engagements within 2 hours, autonomously generates a targeted community follow-up and queues for approval.',
    triggerEvent: 'facebook.post.published',
    condition: 'Organic reach velocity > 50 engagements in 120 mins',
    actionPipeline: ['Reach Velocity Analysis', 'Intent Sentiment Filter', 'Human Approval Gate', 'Social Broadcast'],
    active: true,
    timesTriggered: 21,
    lastTriggered: '2h ago'
  },
  {
    id: 'aut-email-03',
    name: 'B2B Cold Outreach & Unopened Follow-Up Nurture',
    category: 'Email',
    description: 'Triggers personalized drip sequence when a prospective lead opens an email 2+ times or submits a contact inquiry. Automatically schedules step-2 follow-up if no reply in 48 hours.',
    triggerEvent: 'email.outreach.lead_engaged',
    condition: 'Recipient opens email >= 2 times AND reply_received == false',
    actionPipeline: ['Telemetry Verification', 'Dynamic Pitch Customizer', 'Custom SMTP Queue', 'Pipeline Stage Move'],
    active: true,
    timesTriggered: 88,
    lastTriggered: '45m ago'
  },
  {
    id: 'aut-lead-04',
    name: 'Instant Lead Scoring & SDR Team Routing',
    category: 'Leads & CRM',
    description: 'When a new lead arrives via social link click, website pixel, or form submission, automatically enriches company firmographics and routes high-priority deals to sales pipeline.',
    triggerEvent: 'lead.created',
    condition: 'Lead ICP Score >= 70 OR company_size >= 20 seats',
    actionPipeline: ['Firmographic Enrichment', 'B2B ICP Scoring', 'Slack Executive Alert', 'Stage Assignment'],
    active: true,
    timesTriggered: 56,
    lastTriggered: '1h ago'
  },
  {
    id: 'aut-competitor-05',
    name: 'Competitor Pricing & Market Radar Counter-Play',
    category: 'Radar & Webhook',
    description: 'Real-time webhook listener for competitor feature releases, price changes, or trending industry keywords. Autonomously generates rebuttal content and comparison FAQ schema.',
    triggerEvent: 'competitor.radar.alert',
    condition: 'Competitor price shift detected OR new Tier announced',
    actionPipeline: ['Webhook Payload Parse', 'Competitive Rebuttal Engine', 'Approval Gate', 'Social Broadcast'],
    active: true,
    timesTriggered: 12,
    lastTriggered: 'Yesterday'
  },
  {
    id: 'aut-shopify-06',
    name: 'Shopify New Product Omnipost Queue Dispatcher',
    category: 'Radar & Webhook',
    description: 'When a new product is added to Shopify, autonomously normalizes product data, generates high-converting LinkedIn, Facebook, and Instagram copy with branded visual cards, and queues into Smart Omnipost slots.',
    triggerEvent: 'shopify.product.created',
    condition: 'Product status == published AND price > 0',
    actionPipeline: ['Shopify Webhook Normalizer', 'Omnichannel Copy Synthesis', 'Branded Visual Engine', 'Smart Queue Slot Dispatch'],
    active: true,
    timesTriggered: 19,
    lastTriggered: 'Just now'
  },
  {
    id: 'aut-wordpress-07',
    name: 'WordPress Article Omnichannel Thought Leadership Cascade',
    category: 'Radar & Webhook',
    description: 'When a new blog article is published in WordPress, extracts core takeaways, generates executive LinkedIn carousel frameworks and community discussion threads, and stages them for approval.',
    triggerEvent: 'wordpress.post.published',
    condition: 'Post post_status == "publish" AND excerpt != empty',
    actionPipeline: ['WordPress Webhook Ingestion', 'Key Takeaway Extraction', 'Executive Carousel & Thread Generator', 'Approval Gate'],
    active: true,
    timesTriggered: 24,
    lastTriggered: '2h ago'
  },
  {
    id: 'aut-n8n-make-08',
    name: 'n8n & Make.com Universal Webhook Hub Dispatcher',
    category: 'Radar & Webhook',
    description: 'Universal listener for incoming n8n workflows and Make.com scenarios. Verifies secret token, parses custom payload, scores virality, and dispatches across connected social channels.',
    triggerEvent: 'webhook.incoming.dispatch',
    condition: 'Valid X-Sincly-Webhook-Secret OR public endpoint active',
    actionPipeline: ['Webhook Signature Verify', 'Dynamic Payload Parser', 'Virality Scoring Engine', 'Omnipost Queue'],
    active: true,
    timesTriggered: 45,
    lastTriggered: '10m ago'
  }
];

export const mockIntegrations: IntegrationItem[] = [
  { id: 'int-00', name: 'Google Gemini AI (@google/genai)', category: 'AI Provider', status: 'connected', authMethod: 'API Key (GEMINI_API_KEY)', description: 'Powering core AI agent orchestration, autonomous reasoning, content generation & SEO/GEO analysis.', lastSync: 'Live via GEMINI_API_KEY' },
  { id: 'int-01', name: 'OpenAI (GPT-4o & Search)', category: 'AI Provider', status: 'disconnected', authMethod: 'API Key (OPENAI_API_KEY)', description: 'Powering deep reasoning and natural language generation.' },
  { id: 'int-02', name: 'Anthropic (Claude 3.5 Sonnet)', category: 'AI Provider', status: 'disconnected', authMethod: 'API Key (ANTHROPIC_API_KEY)', description: 'Long-form editorial and technical writing.' },
  { id: 'int-03', name: 'NVIDIA NIM (Nemotron 70B)', category: 'AI Provider', status: 'disconnected', authMethod: 'API Key (NVIDIA_API_KEY)', description: 'Ultra-low latency open-weights inference.' },
  { id: 'int-04', name: 'Ollama (Local Llama 3.2)', category: 'AI Provider', status: 'disconnected', authMethod: 'Localhost:11434', description: 'Zero-cost local summarization and entity extraction.' },
  { id: 'int-05', name: 'LinkedIn Marketing API', category: 'Social', status: 'connected', authMethod: 'OAuth 2.0 Bearer Token', description: 'Direct posting to Serpely Company Page and Executive profiles.', lastSync: 'Live OAuth 2.0' },
  { id: 'int-06', name: 'X Developer API v2', category: 'Social', status: 'disconnected', authMethod: 'OAuth 1.0a / Bearer Token', description: 'Real-time thread publishing and social listening.' },
  { id: 'int-07', name: 'Instagram Graph API', category: 'Social', status: 'disconnected', authMethod: 'Meta Graph Access Token', description: 'Carousel and reel distribution.' },
  { id: 'int-08', name: 'YouTube Data API v3', category: 'Social', status: 'disconnected', authMethod: 'OAuth 2.0', description: 'Publishing video shorts and community posts.' },
  { id: 'int-09', name: 'Meta Marketing API (Facebook/Instagram Ads)', category: 'Advertising', status: 'disconnected', authMethod: 'System User Token', description: 'A/B ad testing and audience retargeting.' },
  { id: 'int-10', name: 'Google Ads API', category: 'Advertising', status: 'disconnected', authMethod: 'Developer Token + OAuth', description: 'Search and Performance Max campaign control.' },
  { id: 'int-11', name: 'Google Analytics 4', category: 'Analytics', status: 'disconnected', authMethod: 'Measurement Protocol', description: 'Full-funnel attribution and traffic telemetry.' },
  { id: 'int-12', name: 'Google Search Console', category: 'Analytics', status: 'disconnected', authMethod: 'Service Account', description: 'Traditional impressions vs AI Overviews divergence.' },
  { id: 'int-13', name: 'Google Sheets', category: 'Productivity', status: 'disconnected', authMethod: 'Service Account OAuth', description: 'Syncing weekly KPI spreadsheets and lead lists.' },
  { id: 'int-14', name: 'Notion Workspace', category: 'Productivity', status: 'disconnected', authMethod: 'Internal Integration Token', description: 'Knowledge Hub live document two-way sync.' },
  { id: 'int-15', name: 'n8n Automation Engine', category: 'Automation', status: 'connected', authMethod: 'Webhook Hub (/api/webhooks/n8n)', description: 'Real-time JSON workflow trigger connecting n8n directly to Sincly Omnipost queue.', lastSync: 'Live Gateway Active' },
  { id: 'int-15b', name: 'Make.com Integration Hub', category: 'Automation', status: 'connected', authMethod: 'Webhook Hub (/api/webhooks/make)', description: 'Instant multi-channel content dispatch from Make.com scenario modules.', lastSync: 'Live Gateway Active' },
  { id: 'int-15c', name: 'Shopify Product Webhook Hub', category: 'Automation', status: 'connected', authMethod: 'products/create Webhook', description: 'Autonomously triggers promotional Omniposts when a new product is added to your Shopify store.', lastSync: 'Live Gateway Active' },
  { id: 'int-15d', name: 'WordPress Blog Webhook Hub', category: 'Automation', status: 'connected', authMethod: 'publish_post Hook', description: 'Autonomously generates executive carousel decks and thought leadership threads from published articles.', lastSync: 'Live Gateway Active' },
  { id: 'int-16', name: 'Slack Workspace Connector', category: 'Slack & Discord', status: 'connected', authMethod: 'Webhook & Bot Token', description: 'Automated meeting announcements, lead alerts, and executive approval gate dispatches to Slack channels.', lastSync: 'Live (#general, #leads)' },
  { id: 'int-discord', name: 'Discord Community & Guild Bot', category: 'Slack & Discord', status: 'connected', authMethod: 'Discord Webhook & Bot', description: 'Instant meeting calendar reminders, community mention listening, and pipeline alerts inside Discord servers.', lastSync: 'Live (#announcements)' },
  { id: 'int-17', name: 'HubSpot CRM', category: 'CRM', status: 'disconnected', authMethod: 'Private App Token', description: 'Two-way lead sync and lifecycle deal stages.' },
  { id: 'int-18', name: 'Model Context Protocol (MCP)', category: 'MCP', status: 'connected', authMethod: 'Server URL + Token', description: 'Extending agent capabilities to custom enterprise data sources.', lastSync: 'Live via port 5000' },
  { id: 'int-threads', name: 'Meta Threads Direct API', category: 'Social', status: 'disconnected', authMethod: 'Threads Graph API (v1.0)', description: 'Direct scheduled conversational post & media container publishing to Meta Threads.', lastSync: 'Disconnected' },
  { id: 'int-bluesky', name: 'Bluesky AT Protocol (bsky.social)', category: 'Social', status: 'disconnected', authMethod: 'ATProto XRPC (App Password / Token)', description: 'Decentralized federated publishing and rich-text facet generation for Bluesky networks.', lastSync: 'Disconnected' },
  { id: 'int-19', name: 'TikTok Content Posting API v2', category: 'Social', status: 'disconnected', authMethod: 'TikTok Creator Access Token', description: 'Direct video and carousel scheduled publishing for viral short-form distribution.', lastSync: 'Disconnected' },
  { id: 'int-20', name: 'ElevenLabs Voice AI (TTS)', category: 'AI Provider', status: 'connected', authMethod: 'API Key (ELEVENLABS_API_KEY)', description: 'Ultra-realistic neural voiceover synthesis directly from video scene scripts and viral hooks.', lastSync: 'Curated 7-Voice Engine Active' },
  { id: 'int-21', name: 'HeyGen AI Video Avatar', category: 'AI Provider', status: 'connected', authMethod: 'API Key (HEYGEN_API_KEY)', description: 'Photorealistic face avatar rendering with neural lip-sync and studio backdrops for YouTube and Shorts.', lastSync: 'Curated 5-Avatar Studio Active' }
];

export const mockEmails: EmailCampaign[] = [];
export const mockEmailCampaigns: EmailCampaign[] = mockEmails;
export const mockSaaSApps: SaaSAppProfile[] = [];
export const mockDefaultSmtpConfig: SmtpConfig = {
  host: '',
  port: 587,
  secure: false,
  user: '',
  pass: '',
  fromName: 'Serpely',
  fromEmail: '',
  replyTo: '',
  verified: false
};
export const mockEmailContacts: EmailContact[] = [];

export function buildResponsiveEmailHtml(params: {
  appName?: string;
  themeMode?: 'light' | 'dark';
  headerTitle: string;
  preheader?: string;
  bodyContent: string;
  stepsList?: { title: string; description: string; duration?: string }[];
  postCtaText?: string;
  infoBox?: { title: string; description: string };
  fallbackUrl?: string;
  signOffNote?: string;
  signOffName?: string;
  signOffRole?: string;
  footerReason?: string;
  highlightBox?: { title: string; value: string; caption: string };
  ctaText: string;
  ctaUrl: string;
  accentColor?: string;
  logoText?: string;
}): string {
  const isDark = params.themeMode === 'dark';
  const accent = params.accentColor || '#17c964';
  const rawBrand = params.appName || 'Serpely';
  const isSerpely = rawBrand.toLowerCase().includes('serpely');

  // Theme palette matching the 4 reference screenshots
  const outerBg = isDark ? '#050a07' : '#f1f7f3';
  const gridLineColor = isDark ? 'rgba(23,201,100,0.06)' : 'rgba(23,201,100,0.08)';
  const cardBg = isDark ? '#111312' : '#ffffff';
  const cardBorder = isDark ? '#1f2421' : '#e3ebe6';
  const titleColor = isDark ? '#ffffff' : '#0a0a0a';
  const bodyColor = isDark ? '#d1d5db' : '#374151';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';
  const subBoxBg = isDark ? '#161917' : '#f8faf9';
  const subBoxBorder = isDark ? '#262b28' : '#e5e7eb';
  const dividerColor = isDark ? '#222624' : '#e5e7eb';

  // Official Serpely Logo Assets (Green & White default, or All-White variant)
  const logoAssetUrl =
    params.logoText === 'Serpely-White'
      ? '/assets/aistudio/Serpely_-_Logo_Logo_-_White_66777434.png'
      : '/assets/aistudio/Serpely_-_Logo_Logo_-_G_W_70384cc3.png';

  // Body paragraphs
  const paragraphsHtml = (params.bodyContent || '')
    .split('\n\n')
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 18px 0;font-size:15.5px;line-height:1.65;color:${bodyColor};">${p.replace(
          /\n/g,
          '<br/>'
        )}</p>`
    )
    .join('\n');

  // Optional 3-Step Numbered Checklist Box (Welcome to Serpely style)
  const stepsHtml =
    params.stepsList && params.stepsList.length > 0
      ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 26px 0;background-color:${subBoxBg};border:1px solid ${subBoxBorder};border-radius:16px;overflow:hidden;">
          ${params.stepsList
            .map(
              (step, idx) => `
            <tr>
              <td style="padding:18px 22px;${
                idx > 0 ? `border-top:1px solid ${subBoxBorder};` : ''
              }">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="28" valign="top" style="font-size:15px;font-weight:700;color:${accent};padding-top:1px;">
                      ${idx + 1}
                    </td>
                    <td valign="top" style="padding-right:12px;">
                      <div style="font-size:15px;font-weight:700;color:${titleColor};margin-bottom:3px;">
                        ${step.title}
                      </div>
                      <div style="font-size:13.5px;line-height:1.5;color:${mutedColor};">
                        ${step.description}
                      </div>
                    </td>
                    ${
                      step.duration
                        ? `<td valign="middle" align="right" style="white-space:nowrap;font-size:13px;color:${mutedColor};">
                            ${step.duration}
                          </td>`
                        : ''
                    }
                  </tr>
                </table>
              </td>
            </tr>`
            )
            .join('')}
        </table>`
      : '';

  // Optional Post-CTA Note (e.g. "This link expires in 30 minutes..." or "Once everything's connected...")
  const postCtaHtml = params.postCtaText
    ? `<p style="margin:24px 0 0 0;font-size:14px;line-height:1.6;color:${mutedColor};">
        ${params.postCtaText}
      </p>`
    : '';

  // Optional Info / Security Box (e.g. "Didn't sign up for Serpely?")
  const infoBoxHtml = params.infoBox
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0 0;background-color:${subBoxBg};border:1px solid ${subBoxBorder};border-radius:14px;">
        <tr>
          <td style="padding:18px 22px;">
            <div style="font-size:14px;font-weight:700;color:${titleColor};margin-bottom:4px;">
              ${params.infoBox.title}
            </div>
            <div style="font-size:13.5px;line-height:1.55;color:${mutedColor};">
              ${params.infoBox.description}
            </div>
          </td>
        </tr>
      </table>`
    : '';

  // Optional Highlight Metric Box (if used on feature update / benchmark templates)
  const highlightHtml =
    params.highlightBox && !params.stepsList && !params.infoBox
      ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0 0;background-color:${subBoxBg};border:1px solid ${subBoxBorder};border-radius:14px;">
          <tr>
            <td style="padding:18px 22px;">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${accent};margin-bottom:4px;">
                ${params.highlightBox.title}
              </div>
              <div style="font-size:20px;font-weight:800;color:${titleColor};margin-bottom:4px;">
                ${params.highlightBox.value}
              </div>
              <div style="font-size:13px;color:${mutedColor};">
                ${params.highlightBox.caption}
              </div>
            </td>
          </tr>
        </table>`
      : '';

  // Optional Fallback Verification URL
  const fallbackUrlHtml = params.fallbackUrl
    ? `<div style="margin:24px 0 0 0;">
        <div style="font-size:13px;color:${mutedColor};margin-bottom:4px;">
          Button not working? Paste this link into your browser:
        </div>
        <a href="${params.fallbackUrl}" style="font-size:13px;color:${accent};text-decoration:underline;word-break:break-all;">
          ${params.fallbackUrl}
        </a>
      </div>`
    : '';

  // Sign-off block
  const signOffNoteHtml = params.signOffNote
    ? `<p style="margin:0 0 14px 0;font-size:14px;line-height:1.6;color:${mutedColor};">
        ${params.signOffNote}
      </p>`
    : '';

  const signOffName = params.signOffName || 'The Serpely team';
  const signOffRoleHtml = params.signOffRole
    ? `<div style="font-size:13.5px;color:${mutedColor};margin-top:2px;">${params.signOffRole}</div>`
    : '';

  const footerReason =
    params.footerReason || "You're receiving this email because you created a Serpely account.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${params.headerTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:${outerBg};background-image:linear-gradient(to right, ${gridLineColor} 1px, transparent 1px),linear-gradient(to bottom, ${gridLineColor} 1px, transparent 1px);background-size:64px 64px;font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${params.preheader || params.headerTitle}
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- MAIN CARD -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:${cardBg};border-radius:24px;overflow:hidden;border:1px solid ${cardBorder};box-shadow:0 16px 40px rgba(0,0,0,0.12);">
          <!-- Top Dark Emerald Wave Banner with Official Serpely Logo -->
          <tr>
            <td align="center" style="background:radial-gradient(ellipse at 30% 120%, #065f46 0%, #022c22 45%, #030906 100%);padding:44px 32px;border-bottom:1px solid #0d2e22;">
              <img src="${logoAssetUrl}" alt="Serpely" style="height:46px;width:auto;display:block;margin:0 auto;" />
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding:40px 44px;">
              <h1 style="margin:0 0 24px 0;font-size:30px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;color:${titleColor};">
                ${params.headerTitle}
              </h1>

              ${paragraphsHtml}

              ${stepsHtml}

              <!-- Primary Green Pill/Rounded CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                <tr>
                  <td align="left">
                    <a href="${params.ctaUrl}" style="display:inline-block;background-color:${accent};color:#050a07;font-weight:700;font-size:15px;text-decoration:none;padding:14px 26px;border-radius:12px;">
                      ${params.ctaText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              ${postCtaHtml}

              ${infoBoxHtml}

              ${highlightHtml}

              ${fallbackUrlHtml}

              <!-- Divider + Team Sign-off -->
              <div style="border-top:1px solid ${dividerColor};margin:28px 0 22px 0;"></div>
              ${signOffNoteHtml}
              <div style="font-size:15px;font-weight:700;color:${titleColor};">
                ${signOffName}
              </div>
              ${signOffRoleHtml}
            </td>
          </tr>
        </table>

        <!-- DETACHED DARK FOOTER CARD -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin-top:16px;background-color:#070908;border:1px solid #161c18;border-radius:24px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px;">
              <!-- Top Footer Row: Brand + Social Icons -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="top">
                    <img src="${logoAssetUrl}" alt="Serpely" style="height:28px;width:auto;display:block;" />
                    <div style="font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#9ca3af;margin-top:10px;">
                      AGENTIC SEO FOR THE AI-FIRST WEB
                    </div>
                  </td>
                  <td valign="top" align="right" style="white-space:nowrap;">
                    <!-- Social Links (Facebook, LinkedIn, X, Instagram) -->
                    <a href="https://facebook.com" style="display:inline-block;margin-left:14px;color:#d1d5db;text-decoration:none;font-size:14px;font-weight:700;" title="Facebook">f</a>
                    <a href="https://linkedin.com" style="display:inline-block;margin-left:14px;color:#d1d5db;text-decoration:none;font-size:14px;font-weight:700;" title="LinkedIn">in</a>
                    <a href="https://x.com" style="display:inline-block;margin-left:14px;color:#d1d5db;text-decoration:none;font-size:14px;font-weight:700;" title="X">&#120143;</a>
                    <a href="https://instagram.com" style="display:inline-block;margin-left:14px;color:#d1d5db;text-decoration:none;font-size:14px;font-weight:700;" title="Instagram">&#9678;</a>
                  </td>
                </tr>
              </table>

              <div style="border-top:1px solid #1a201c;margin:22px 0;"></div>

              <div style="font-size:12px;line-height:1.6;color:#9ca3af;margin-bottom:4px;">
                ${footerReason}
              </div>
              <div style="font-size:12px;line-height:1.6;color:#6b7280;margin-bottom:14px;">
                Serpely &middot; 123 Example Street, City, Country
              </div>
              <div style="font-size:12px;color:#9ca3af;">
                <a href="https://serpely.com/blog" style="color:#9ca3af;text-decoration:underline;">Blog</a>
                <span style="margin:0 6px;color:#4b5563;">&middot;</span>
                <a href="https://serpely.com/help" style="color:#9ca3af;text-decoration:underline;">Help center</a>
                <span style="margin:0 6px;color:#4b5563;">&middot;</span>
                <a href="https://serpely.com/privacy" style="color:#9ca3af;text-decoration:underline;">Privacy</a>
                <span style="margin:0 6px;color:#4b5563;">&middot;</span>
                <a href="https://serpely.com/terms" style="color:#9ca3af;text-decoration:underline;">Terms</a>
                <span style="margin:0 6px;color:#4b5563;">&middot;</span>
                <span style="color:#6b7280;">&copy; 2026 Serpely</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const mockEmailTemplates: EmailTemplate[] = [];
export const mockEmailSequences: EmailSequenceWorkflow[] = [];
export const mockChannelAccounts: SocialChannelAccount[] = [
  {
    id: 'ch-yt-shorts',
    name: 'Sincly Shorts & AI Bites',
    handle: '@sincly_shorts',
    platform: 'YouTube',
    category: 'micro_content',
    followerCount: 18400,
    dailyUploadLimit: 5,
    queuedCount: 2,
    status: 'connected',
    lastUploadAt: 'Yesterday'
  },
  {
    id: 'ch-yt-main',
    name: 'Sincly Engineering & GEO Hub',
    handle: '@sincly_hq',
    platform: 'YouTube',
    category: 'official_brand',
    followerCount: 42600,
    dailyUploadLimit: 2,
    queuedCount: 1,
    status: 'connected',
    lastUploadAt: '3 days ago'
  }
];

export const mockYouTubeVideos: YouTubeVideoProject[] = [
  {
    id: 'yt-proj-1',
    title: 'The #1 Reason B2B Websites Disappear From AI Search',
    format: 'shorts',
    targetChannelId: 'ch-yt-shorts',
    durationSeconds: 58,
    status: 'draft',
    hooks: [
      {
        id: 'hk-1-1',
        text: 'Google just quietly rolled out a new AI search metric, and your competitors have no idea.',
        viralityScore: 97,
        angle: 'Insider Intelligence / Secret Gap',
        isSelected: true
      },
      {
        id: 'hk-1-2',
        text: 'If your site relies on classic blog SEO, you are losing 70% of potential traffic right now.',
        viralityScore: 91,
        angle: 'Urgency & Loss Aversion',
        isSelected: false
      },
      {
        id: 'hk-1-3',
        text: 'How we got cited in 4,200 ChatGPT prompts in 30 days without writing a single backlink email.',
        viralityScore: 86,
        angle: 'Proven Case Study Proof',
        isSelected: false
      }
    ],
    scenes: [
      {
        id: 'sc-1-1',
        sceneNumber: 1,
        timestamp: '0:00 - 0:12',
        narration: 'Google just quietly rolled out a new AI search metric, and your competitors have no idea.',
        visualCue: 'Screen capture of AI search result comparing cited vs omitted sources',
        overlayText: 'THE #1 CITATION SECRET'
      },
      {
        id: 'sc-1-2',
        sceneNumber: 2,
        timestamp: '0:12 - 0:28',
        narration: 'If your site relies on classic 2,000-word blog SEO, LLMs are ignoring 70% of your product pages right now.',
        visualCue: 'Animated schema diagram showing missing semantic relations',
        overlayText: '70% CITATION LOSS'
      },
      {
        id: 'sc-1-3',
        sceneNumber: 3,
        timestamp: '0:28 - 0:45',
        narration: 'Websites that declare strict JSON-LD Entity Disambiguation are cited 3.4 times more frequently in SearchGPT and Perplexity.',
        visualCue: 'Animated bar chart showing 3.4x citation lift across Gemini and ChatGPT',
        overlayText: '3.4X HIGHER AI CITATION'
      },
      {
        id: 'sc-1-4',
        sceneNumber: 4,
        timestamp: '0:45 - 0:58',
        narration: 'Run your brand GEO Audit on Serpely today to get your live score. Link in description!',
        visualCue: 'Fast overview of Serpely GEO score calculation with glowing emerald badge',
        overlayText: 'AUDIT YOUR BRAND FREE'
      }
    ],
    description: 'Discover how Generative Engine Optimization allows brands to stay visible in ChatGPT and Google AI Overviews.\n\nFree audit: https://sincly.io/audit\n\n#AISEO #YouTube #Shorts #TechTrends',
    tags: ['AI Search', 'GEO', 'Agentic Marketing', 'Sincly', 'SEO Tips'],
    thumbnailConcept: {
      headline: 'AI SEARCH EXPLAINED',
      visualDescription: 'Clean dark background with glowing green citation metrics and bold white typography.',
      badgeText: 'NEW 2026'
    },
    voiceover: {
      provider: 'elevenlabs',
      voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam
      voiceName: 'Adam',
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.05,
      status: 'idle'
    },
    avatar: {
      provider: 'heygen',
      avatarId: 'avatar_tyler_exec',
      avatarName: 'Tyler',
      backgroundMode: 'dark_studio',
      status: 'idle'
    },
    createdAt: '2026-11-01'
  },
  {
    id: 'yt-proj-2',
    title: 'How Generative Answer Engines Actually Audit Your Brand',
    format: 'longform',
    targetChannelId: 'ch-yt-main',
    durationSeconds: 620,
    status: 'draft',
    hooks: [
      {
        id: 'hk-2-1',
        text: 'Why 2026 is the year Generative Engine Optimization completely replaces conventional search rankings.',
        viralityScore: 94,
        angle: 'Paradigm Shift / Thought Leadership',
        isSelected: true
      },
      {
        id: 'hk-2-2',
        text: 'The full technical architecture behind how Perplexity and SearchGPT pick their #1 citations.',
        viralityScore: 90,
        angle: 'Deep Engineering Breakdown',
        isSelected: false
      }
    ],
    scenes: [
      {
        id: 'sc-2-1',
        sceneNumber: 1,
        timestamp: '0:00 - 1:15',
        narration: 'Why 2026 is the year Generative Engine Optimization completely replaces conventional search rankings.',
        visualCue: 'Split screen comparing traditional blue links vs RAG synthesized multi-source answers',
        overlayText: 'THE GEO REVOLUTION'
      },
      {
        id: 'sc-2-2',
        sceneNumber: 2,
        timestamp: '1:15 - 4:30',
        narration: 'We audited 1,000 SaaS websites. Here are the 4 Schema.org tags that dictate AI visibility across Google, Perplexity, and ChatGPT.',
        visualCue: 'High-density terminal view displaying valid JSON-LD graph nodes connecting products to pricing',
        overlayText: '4 ESSENTIAL SCHEMA TAGS'
      },
      {
        id: 'sc-2-3',
        sceneNumber: 3,
        timestamp: '4:30 - 7:45',
        narration: 'Notice how citation confidence drops to zero when your brand lacks verified third-party benchmarks.',
        visualCue: 'Dial gauge shifting from red 32% to emerald 96% citation reliability score',
        overlayText: 'PROVEN BENCHMARK DATA'
      },
      {
        id: 'sc-2-4',
        sceneNumber: 4,
        timestamp: '7:45 - 10:20',
        narration: 'Check the link below for the complete open-source GEO checklist and autonomous agent templates.',
        visualCue: 'Executive dashboard showing multi-channel waterfall publishing cascade in action',
        overlayText: 'DOWNLOAD THE GEO CHECKLIST'
      }
    ],
    description: 'The definitive architectural guide to Generative Engine Optimization (GEO). Learn how LLMs index, retrieve, and cite B2B brands.\n\nRead the full report: https://sincly.io/geo-guide\n\n#GenerativeAI #SearchGPT #Perplexity #SEO2026',
    tags: ['GEO', 'Generative Engine Optimization', 'AI Strategy', 'Enterprise Tech'],
    thumbnailConcept: {
      headline: 'WHY SEO IS DEAD',
      visualDescription: 'Tyler Tech Executive avatar framed against dark glassmorphism studio backdrop with neon citation stats.',
      badgeText: 'MASTERCLASS'
    },
    voiceover: {
      provider: 'elevenlabs',
      voiceId: '21m00Tcm4TlvDq8ikWAM', // Rachel
      voiceName: 'Rachel',
      stability: 0.55,
      similarityBoost: 0.8,
      style: 0.1,
      status: 'idle'
    },
    avatar: {
      provider: 'heygen',
      avatarId: 'avatar_angela_anchor',
      avatarName: 'Angela',
      backgroundMode: 'minimal_office',
      status: 'idle'
    },
    createdAt: '2026-10-28'
  }
];

export const defaultVideoMutationConfig: VideoMutationConfig = {
  speedMultiplier: 1.02,
  pitchShiftCents: 8,
  stripMetadata: true,
  applyMicroColorGrade: true,
  aspectRatio: '9:16',
  watermarkOpacity: 0.15,
  voiceMutationEnabled: true,
  targetVoiceId: 'ErXwobaYiN019PkySvjV', // Antoni
  targetVoiceName: 'Antoni (Dynamic Tech)',
  avatarOverlayEnabled: true,
  avatarId: 'avatar_dexter_educator',
  avatarName: 'Dexter (Educator)',
  avatarPosition: 'bottom-right',
  avatarScale: 0.32
};

/**
 * Analyzes any post caption text and derives a complete, redesigned SocialVisualCardConfig
 * (headline, subheadline, extracted bullet points, key metric/stat, keyword tag, and best visual layout).
 */
export function deriveVisualConfigFromCaption(
  caption: string,
  platform: SocialPagePlatform,
  currentConfig: SocialVisualCardConfig,
  options?: { rotateLayout?: boolean; explicitLayout?: VisualCardLayout }
): SocialVisualCardConfig {
  const rawLines = (caption || '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));

  // 1. Extract bullet points / numbered takeaways from the caption
  const bulletLines = rawLines
    .filter(l => /^(\d+[\.\)]|[-•*✓✔→])\s+/.test(l))
    .map(l => l.replace(/^(\d+[\.\)]|[-•*✓✔→])\s+/, '').trim());

  const nonBulletLines = rawLines.filter(l => !/^(\d+[\.\)]|[-•*✓✔→])\s+/.test(l));

  // 2. Extract headline from the opening hook of the caption
  const firstHook =
    nonBulletLines[0] ||
    rawLines[0] ||
    currentConfig.headline ||
    `${platform} Strategic Growth Update`;
  const cleanHeadline = firstHook
    .replace(/^(Executive Breakdown:|Update:|Insight:)\s*/i, '')
    .slice(0, 74);

  // 3. Extract subheadline from second paragraph or supporting sentence
  const secondLine =
    nonBulletLines[1] ||
    nonBulletLines[2] ||
    bulletLines[0] ||
    currentConfig.subheadline ||
    `Key takeaways and actionable insights for ${platform} audiences.`;
  const cleanSubheadline = secondLine.slice(0, 112);

  // 4. Populate 3 visual takeaway points directly from the caption
  let extractedBullets: string[] = [];
  if (bulletLines.length > 0) {
    extractedBullets = bulletLines.slice(0, 3).map(b => b.slice(0, 58));
  } else {
    // Split body sentences into 3 concise takeaways
    const bodySentences = nonBulletLines
      .slice(1)
      .join(' ')
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 12);
    extractedBullets = bodySentences.slice(0, 3).map(s => s.slice(0, 58));
  }
  while (extractedBullets.length < 3) {
    const defaults = [
      'Structure core insights for immediate audience clarity',
      'Pair every social update with verifiable proof points',
      'Convert audience questions into high-intent follow-ups'
    ];
    extractedBullets.push(defaults[extractedBullets.length]);
  }

  // 5. Extract a quantitative metric or highlight stat from the caption text
  const statRegex =
    /\b(\d+(?:\.\d+)?(?:\s*%|\s*x|\s*X|\+)|\d{1,3}(?:,\d{3})+|\$\d+(?:\.\d+)?[kKmMbB]?|\d+\s*(?:hrs?|hours?|mins?|minutes?|days?|steps?|mistakes?|shifts?|pillars?|tips?))\b/i;
  const statMatch = caption.match(statRegex);
  let metricValue = currentConfig.metricValue || '3.8x';
  let metricLabel = currentConfig.metricLabel || 'Higher Audience Reach';

  if (statMatch && statMatch[1]) {
    metricValue = statMatch[1].trim().slice(0, 14);
    const matchIndex = statMatch.index || 0;
    const afterText = caption
      .slice(matchIndex + statMatch[0].length, matchIndex + statMatch[0].length + 48)
      .replace(/^[\s,.:;-]+/, '')
      .split(/[.!?\n]/)[0]
      .trim();
    if (afterText.length >= 6) {
      metricLabel = afterText.slice(0, 34);
    } else if (bulletLines.length > 0) {
      metricLabel = `${bulletLines.length} Actionable Steps Inside`;
    } else {
      metricLabel = 'Key Highlight From Post';
    }
  } else if (bulletLines.length > 0) {
    metricValue = `${bulletLines.length} Steps`;
    metricLabel = 'Actionable Playbook Breakdown';
  }

  // 6. Select or rotate visual layout based on caption structure
  const allLayouts: VisualCardLayout[] = [
    'checklist-roadmap',
    'stat-spotlight',
    'executive-quote',
    'comparison-split'
  ];

  let nextLayout: VisualCardLayout = currentConfig.layout || 'checklist-roadmap';
  if (options?.explicitLayout) {
    nextLayout = options.explicitLayout;
  } else if (options?.rotateLayout) {
    const idx = allLayouts.indexOf(currentConfig.layout || 'checklist-roadmap');
    nextLayout = allLayouts[(idx + 1) % allLayouts.length];
  } else {
    // Auto-pick best layout based on caption content
    if (bulletLines.length >= 2) {
      nextLayout = 'checklist-roadmap';
    } else if (/\b(\d+(?:\.\d+)?%|\d+(?:\.\d+)?x)\b/i.test(caption)) {
      nextLayout = 'stat-spotlight';
    } else if (caption.includes('?')) {
      nextLayout = 'executive-quote';
    } else {
      nextLayout = 'comparison-split';
    }
  }

  return {
    ...currentConfig,
    headline: cleanHeadline,
    subheadline: cleanSubheadline,
    metricValue,
    metricLabel,
    bulletPoints: extractedBullets,
    layout: nextLayout
  };
}

/**
 * Generates a high-resolution 1200x630 SVG data URI for LinkedIn & Facebook Page social cards.
 * Dynamically adapts its visual architecture based on the caption-derived config & layout style.
 */
export function generateBrandedSocialSvgDataUri(config: SocialVisualCardConfig): string {
  if (config.customImageUrl) {
    return config.customImageUrl;
  }

  const palette =
    config.theme === 'linkedin-executive'
      ? { bg1: '#07111E', bg2: '#0B2342', accent: '#38BDF8', badgeBg: '#0A66C2', grid: '#1E3A5F' }
      : config.theme === 'facebook-cobalt'
      ? { bg1: '#080D1A', bg2: '#10214B', accent: '#60A5FA', badgeBg: '#1877F2', grid: '#1E3A8A' }
      : config.theme === 'instagram-gradient'
      ? { bg1: '#1F0B1A', bg2: '#3B0F2A', accent: '#F43F5E', badgeBg: '#E11D48', grid: '#4C0519' }
      : config.theme === 'x-dark'
      ? { bg1: '#0A0A0A', bg2: '#171717', accent: '#E5E5E5', badgeBg: '#262626', grid: '#262626' }
      : config.theme === 'amber-alert' || config.theme === 'amber-authority'
      ? { bg1: '#140C06', bg2: '#291507', accent: '#FBBF24', badgeBg: '#D97706', grid: '#451A03' }
      : config.theme === 'violet-story'
      ? { bg1: '#11091F', bg2: '#231242', accent: '#C084FC', badgeBg: '#7C3AED', grid: '#3B1D6E' }
      : config.theme === 'threads-slate'
      ? { bg1: '#0F141C', bg2: '#1E293B', accent: '#E2E8F0', badgeBg: '#334155', grid: '#334155' }
      : config.theme === 'tiktok-neon'
      ? { bg1: '#010101', bg2: '#0D0D12', accent: '#00F2FE', badgeBg: '#FE2C55', grid: '#1F1F2E' }
      : config.theme === 'pinterest-crimson'
      ? { bg1: '#1F050A', bg2: '#3F0A15', accent: '#F87171', badgeBg: '#E60023', grid: '#5F1220' }
      : config.theme === 'bluesky-azure'
      ? { bg1: '#061325', bg2: '#0C274E', accent: '#38BDF8', badgeBg: '#0285FF', grid: '#1E3A8A' }
      : { bg1: '#06120E', bg2: '#0B291E', accent: '#34D399', badgeBg: '#059669', grid: '#064E3B' };

  const safe = (str: string) =>
    (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const wrapWords = (text: string, maxCharsPerLine: number, maxLines: number): string[] => {
    const words = (text || '').trim().split(/\s+/);
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      if ((current + ' ' + word).trim().length <= maxCharsPerLine) {
        current = (current + ' ' + word).trim();
      } else {
        if (current) lines.push(current);
        current = word;
        if (lines.length === maxLines - 1) break;
      }
    }
    const remainingWords = words.slice(lines.join(' ').split(/\s+/).filter(Boolean).length);
    if (remainingWords.length > 0 && lines.length < maxLines) {
      const lastLine = remainingWords.join(' ');
      lines.push(
        lastLine.length > maxCharsPerLine
          ? lastLine.slice(0, maxCharsPerLine - 1) + '…'
          : lastLine
      );
    } else if (current && lines.length < maxLines) {
      lines.push(current);
    }
    return lines.length > 0 ? lines : ['Key Social Update'];
  };

  const headlineLines = wrapWords(config.headline || 'Strategic Growth Breakdown', 30, 3).map(safe);
  const subheadlineLines = wrapWords(
    config.subheadline || 'Actionable takeaways from our latest analysis.',
    46,
    2
  ).map(safe);

  const metricVal = safe((config.metricValue || '3.8x').slice(0, 14));
  const metricLbl = safe((config.metricLabel || 'Audience Impact').slice(0, 34));
  const kwTag = safe((config.keywordTag || 'SOCIAL INSIGHT').toUpperCase().slice(0, 34));
  const footer = safe(config.footerBrand || 'AI MARKETING OS · CAPTION-DRIVEN VISUAL STUDIO');
  const layout: VisualCardLayout = config.layout || 'checklist-roadmap';

  const bullets = (
    config.bulletPoints && config.bulletPoints.length > 0
      ? config.bulletPoints
      : [
          'Structure key answers for immediate value',
          'Pair every post with a visual summary card',
          'Track topics that drive real conversions'
        ]
  )
    .slice(0, 3)
    .map(b => safe(b.slice(0, 52)));

  const isPin = config.aspectRatio === '1000:1500';
  const isSquare = config.aspectRatio === '1080:1080' || isPin;
  const width = isPin ? 1000 : isSquare ? 1080 : 1200;
  const height = isPin ? 1500 : isSquare ? 1080 : 627;
  const footerY = isPin ? 1440 : isSquare ? 1020 : 576;
  const footerLineY = isPin ? 1385 : isSquare ? 965 : 530;

  let bodySvg = '';

  if (isSquare) {
    // =========================================================================
    // DEDICATED SQUARE (1080x1080) ARCHITECTURE - BALANCED VERTICAL CANVAS
    // =========================================================================
    if (layout === 'checklist-roadmap') {
      bodySvg = `
        <!-- Square 1080x1080 Checklist Roadmap -->
        <rect x="60" y="60" width="380" height="38" rx="8" fill="${palette.badgeBg}" fill-opacity="0.28" stroke="${palette.accent}" stroke-opacity="0.55" />
        <text x="78" y="85" fill="${palette.accent}" font-family="monospace" font-size="14" font-weight="700" letter-spacing="1.4">TOPIC: ${kwTag}</text>

        <text x="60" y="145" fill="#FFFFFF" font-family="sans-serif" font-size="38" font-weight="800">${headlineLines[0] || ''}</text>
        <text x="60" y="195" fill="#FFFFFF" font-family="sans-serif" font-size="38" font-weight="800">${headlineLines[1] || ''}</text>
        <text x="60" y="245" fill="${palette.accent}" font-family="sans-serif" font-size="36" font-weight="800">${headlineLines[2] || ''}</text>

        <text x="60" y="295" fill="#CBD5E1" font-family="sans-serif" font-size="20" font-weight="500">${subheadlineLines[0] || ''}</text>
        <text x="60" y="325" fill="#94A3B8" font-family="sans-serif" font-size="20" font-weight="500">${subheadlineLines[1] || ''}</text>

        <!-- Full-Width Stat Spotlight Pill -->
        <g transform="translate(60, 360)">
          <rect x="0" y="0" width="960" height="105" rx="18" fill="#090D16" fill-opacity="0.9" stroke="${palette.accent}" stroke-opacity="0.45" stroke-width="1.5" />
          <text x="32" y="68" fill="${palette.accent}" font-family="monospace" font-size="46" font-weight="800">${metricVal}</text>
          <line x1="220" y1="20" x2="220" y2="85" stroke="${palette.grid}" stroke-width="2" />
          <text x="245" y="46" fill="#94A3B8" font-family="monospace" font-size="12" font-weight="700" letter-spacing="1.2">KEY CAPTION HIGHLIGHT</text>
          <text x="245" y="74" fill="#F8FAFC" font-family="sans-serif" font-size="19" font-weight="700">${metricLbl}</text>
        </g>

        <!-- 3 Actionable Roadmap Steps Stacked Vertically -->
        ${bullets
          .map(
            (b, i) => `
          <g transform="translate(60, ${485 + i * 155})">
            <rect x="0" y="0" width="960" height="135" rx="18" fill="#070B14" fill-opacity="0.88" stroke="${palette.accent}" stroke-opacity="${i === 0 ? '0.7' : '0.35'}" stroke-width="1.8" />
            <circle cx="58" cy="67" r="28" fill="${palette.accent}" fill-opacity="0.18" stroke="${palette.accent}" stroke-width="2" />
            <text x="46" y="75" fill="${palette.accent}" font-family="monospace" font-size="20" font-weight="800">0${i + 1}</text>
            <text x="110" y="48" fill="${palette.accent}" font-family="monospace" font-size="13" font-weight="700" letter-spacing="1.2">STEP 0${i + 1} · ACTIONABLE TAKEAWAY</text>
            <text x="110" y="84" fill="#F8FAFC" font-family="sans-serif" font-size="21" font-weight="600">${b}</text>
          </g>
        `
          )
          .join('')}
      `;
    } else if (layout === 'executive-quote') {
      bodySvg = `
        <!-- Square 1080x1080 Executive Quote -->
        <rect x="60" y="60" width="960" height="875" rx="26" fill="#070B14" fill-opacity="0.88" stroke="${palette.accent}" stroke-opacity="0.45" stroke-width="2" />
        <text x="95" y="160" fill="${palette.accent}" opacity="0.3" font-family="serif" font-size="140" font-weight="900">“</text>
        <rect x="175" y="90" width="360" height="36" rx="8" fill="${palette.badgeBg}" fill-opacity="0.3" stroke="${palette.accent}" stroke-opacity="0.5" />
        <text x="192" y="114" fill="${palette.accent}" font-family="monospace" font-size="13" font-weight="700" letter-spacing="1.4">${kwTag}</text>

        <text x="95" y="230" fill="#FFFFFF" font-family="sans-serif" font-size="38" font-weight="800">${headlineLines[0] || ''}</text>
        <text x="95" y="280" fill="#FFFFFF" font-family="sans-serif" font-size="38" font-weight="800">${headlineLines[1] || ''}</text>
        <text x="95" y="330" fill="${palette.accent}" font-family="sans-serif" font-size="34" font-weight="700">${headlineLines[2] || subheadlineLines[0] || ''}</text>

        <text x="95" y="390" fill="#CBD5E1" font-family="sans-serif" font-size="20" font-weight="500">${subheadlineLines[0] || ''}</text>
        <text x="95" y="420" fill="#94A3B8" font-family="sans-serif" font-size="19" font-weight="500">${subheadlineLines[1] || ''}</text>

        <line x1="95" y1="460" x2="985" y2="460" stroke="${palette.grid}" stroke-width="1.5" />

        <!-- 3 Executive Bullet Takeaways -->
        ${bullets
          .map(
            (b, i) => `
          <g transform="translate(95, ${485 + i * 115})">
            <rect x="0" y="0" width="890" height="95" rx="14" fill="${palette.bg2}" fill-opacity="0.6" stroke="${palette.grid}" stroke-width="1.2" />
            <circle cx="38" cy="47" r="16" fill="${palette.accent}" fill-opacity="0.2" />
            <text x="31" y="53" fill="${palette.accent}" font-family="monospace" font-size="14" font-weight="800">0${i + 1}</text>
            <text x="70" y="54" fill="#F8FAFC" font-family="sans-serif" font-size="18" font-weight="600">${b}</text>
          </g>
        `
          )
          .join('')}

        <!-- Metric Badge in Quote Footer -->
        <g transform="translate(95, 840)">
          <rect x="0" y="0" width="890" height="70" rx="12" fill="${palette.badgeBg}" fill-opacity="0.25" stroke="${palette.accent}" stroke-opacity="0.4" stroke-width="1.2" />
          <text x="24" y="44" fill="${palette.accent}" font-family="monospace" font-size="28" font-weight="800">${metricVal}</text>
          <line x1="150" y1="15" x2="150" y2="55" stroke="${palette.grid}" stroke-width="1.5" />
          <text x="175" y="42" fill="#E2E8F0" font-family="sans-serif" font-size="17" font-weight="700">${metricLbl}</text>
        </g>
      `;
    } else if (layout === 'comparison-split') {
      bodySvg = `
        <!-- Square 1080x1080 Comparison Split -->
        <rect x="60" y="60" width="320" height="36" rx="8" fill="${palette.badgeBg}" fill-opacity="0.28" stroke="${palette.accent}" stroke-opacity="0.5" />
        <text x="78" y="83" fill="${palette.accent}" font-family="monospace" font-size="13" font-weight="700" letter-spacing="1.4">${kwTag}</text>

        <text x="60" y="135" fill="#FFFFFF" font-family="sans-serif" font-size="34" font-weight="800">${headlineLines[0] || ''}</text>
        <text x="60" y="175" fill="#CBD5E1" font-family="sans-serif" font-size="19" font-weight="500">${subheadlineLines[0] || ''}</text>

        <g transform="translate(740, 60)">
          <rect x="0" y="0" width="280" height="115" rx="16" fill="#070B14" stroke="${palette.accent}" stroke-width="1.8" />
          <text x="24" y="52" fill="${palette.accent}" font-family="monospace" font-size="40" font-weight="800">${metricVal}</text>
          <text x="24" y="86" fill="#E2E8F0" font-family="sans-serif" font-size="14" font-weight="600">${metricLbl.slice(0, 24)}</text>
        </g>

        <!-- 3 Vertical Pillars -->
        ${bullets
          .map(
            (b, i) => `
          <g transform="translate(${60 + i * 335}, 210)">
            <rect x="0" y="0" width="310" height="720" rx="20" fill="#070B14" fill-opacity="0.88" stroke="${palette.accent}" stroke-opacity="${i === 0 ? '0.7' : '0.35'}" stroke-width="2" />
            <rect x="24" y="24" width="56" height="56" rx="14" fill="${palette.badgeBg}" fill-opacity="0.3" stroke="${palette.accent}" stroke-width="1.5" />
            <text x="40" y="60" fill="${palette.accent}" font-family="monospace" font-size="24" font-weight="800">0${i + 1}</text>
            <text x="24" y="120" fill="${palette.accent}" font-family="monospace" font-size="13" font-weight="700" letter-spacing="1.2">KEY PILLAR 0${i + 1}</text>
            <text x="24" y="165" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="700">${b.slice(0, 24)}</text>
            <text x="24" y="200" fill="#CBD5E1" font-family="sans-serif" font-size="18" font-weight="500">${b.slice(24, 60)}</text>
            <line x1="24" y1="640" x2="286" y2="640" stroke="${palette.grid}" stroke-width="1.5" />
            <text x="24" y="675" fill="#94A3B8" font-family="monospace" font-size="12" font-weight="600">VERIFIED TAKEAWAY</text>
          </g>
        `
          )
          .join('')}
      `;
    } else {
      // Default / 'stat-spotlight' for Square
      bodySvg = `
        <!-- Square 1080x1080 Stat Spotlight -->
        <rect x="60" y="60" width="380" height="38" rx="8" fill="${palette.badgeBg}" fill-opacity="0.25" stroke="${palette.accent}" stroke-opacity="0.5" />
        <text x="78" y="85" fill="${palette.accent}" font-family="monospace" font-size="14" font-weight="700" letter-spacing="1.4">TOPIC: ${kwTag}</text>

        <text x="60" y="145" fill="#FFFFFF" font-family="sans-serif" font-size="40" font-weight="800">${headlineLines[0] || ''}</text>
        <text x="60" y="195" fill="#FFFFFF" font-family="sans-serif" font-size="40" font-weight="800">${headlineLines[1] || ''}</text>
        <text x="60" y="245" fill="${palette.accent}" font-family="sans-serif" font-size="36" font-weight="800">${headlineLines[2] || ''}</text>

        <text x="60" y="295" fill="#CBD5E1" font-family="sans-serif" font-size="20" font-weight="500">${subheadlineLines[0] || ''}</text>

        <!-- Giant Stat Hero Card -->
        <g transform="translate(60, 335)">
          <rect x="0" y="0" width="960" height="330" rx="22" fill="#090D16" fill-opacity="0.92" stroke="${palette.accent}" stroke-opacity="0.55" stroke-width="2" />
          <text x="40" y="52" fill="#94A3B8" font-family="monospace" font-size="14" font-weight="700" letter-spacing="1.5">KEY PERFORMANCE METRIC</text>
          <text x="40" y="152" fill="${palette.accent}" font-family="monospace" font-size="88" font-weight="900">${metricVal}</text>
          <text x="40" y="205" fill="#F8FAFC" font-family="sans-serif" font-size="26" font-weight="700">${metricLbl}</text>
          <!-- Decorative visual bar chart -->
          <g transform="translate(620, 90)">
            <rect x="0" y="120" width="55" height="90" rx="8" fill="${palette.grid}" />
            <rect x="75" y="80" width="55" height="130" rx="8" fill="${palette.grid}" />
            <rect x="150" y="40" width="55" height="170" rx="8" fill="${palette.badgeBg}" />
            <rect x="225" y="-10" width="55" height="220" rx="8" fill="${palette.accent}" />
          </g>
        </g>

        <!-- 2 Bottom Bullet Highlights -->
        <g transform="translate(60, 690)">
          <rect x="0" y="0" width="960" height="110" rx="16" fill="#070B14" fill-opacity="0.8" stroke="${palette.grid}" stroke-width="1.5" />
          <circle cx="45" cy="55" r="18" fill="${palette.accent}" fill-opacity="0.2" />
          <text x="37" y="61" fill="${palette.accent}" font-family="sans-serif" font-size="18" font-weight="900">✓</text>
          <text x="80" y="62" fill="#F8FAFC" font-family="sans-serif" font-size="20" font-weight="600">${bullets[0] || ''}</text>
        </g>
        <g transform="translate(60, 820)">
          <rect x="0" y="0" width="960" height="110" rx="16" fill="#070B14" fill-opacity="0.8" stroke="${palette.grid}" stroke-width="1.5" />
          <circle cx="45" cy="55" r="18" fill="${palette.accent}" fill-opacity="0.2" />
          <text x="37" y="61" fill="${palette.accent}" font-family="sans-serif" font-size="18" font-weight="900">✓</text>
          <text x="80" y="62" fill="#CBD5E1" font-family="sans-serif" font-size="20" font-weight="600">${bullets[1] || ''}</text>
        </g>
      `;
    }
  } else {
    // =========================================================================
    // LANDSCAPE (1200x627) ARCHITECTURE - HORIZONTAL 2-COLUMN / 3-PILLAR
    // =========================================================================
    if (layout === 'checklist-roadmap') {
      bodySvg = `
        <!-- Left Column: Caption Hook & Metric Pill -->
        <rect x="64" y="64" width="420" height="38" rx="8" fill="${palette.badgeBg}" fill-opacity="0.28" stroke="${palette.accent}" stroke-opacity="0.55" />
        <text x="82" y="89" fill="${palette.accent}" font-family="monospace" font-size="14" font-weight="700" letter-spacing="1.4">TOPIC: ${kwTag}</text>

        <text x="64" y="162" fill="#FFFFFF" font-family="sans-serif" font-size="38" font-weight="800">${headlineLines[0] || ''}</text>
        <text x="64" y="212" fill="#FFFFFF" font-family="sans-serif" font-size="38" font-weight="800">${headlineLines[1] || ''}</text>
        <text x="64" y="262" fill="${palette.accent}" font-family="sans-serif" font-size="36" font-weight="800">${headlineLines[2] || ''}</text>

        <text x="64" y="320" fill="#CBD5E1" font-family="sans-serif" font-size="20" font-weight="500">${subheadlineLines[0] || ''}</text>
        <text x="64" y="350" fill="#94A3B8" font-family="sans-serif" font-size="20" font-weight="500">${subheadlineLines[1] || ''}</text>

        <!-- Highlight Stat Badge on Left Bottom -->
        <g transform="translate(64, 392)">
          <rect x="0" y="0" width="440" height="96" rx="16" fill="#090D16" fill-opacity="0.88" stroke="${palette.accent}" stroke-opacity="0.45" stroke-width="1.5" />
          <text x="24" y="60" fill="${palette.accent}" font-family="monospace" font-size="42" font-weight="800">${metricVal}</text>
          <line x1="175" y1="22" x2="175" y2="74" stroke="${palette.grid}" stroke-width="2" />
          <text x="196" y="44" fill="#94A3B8" font-family="monospace" font-size="12" font-weight="700" letter-spacing="1.2">KEY CAPTION HIGHLIGHT</text>
          <text x="196" y="68" fill="#F8FAFC" font-family="sans-serif" font-size="17" font-weight="700">${metricLbl}</text>
        </g>

        <!-- Right Column: Visual Checklist Extracted from Caption -->
        <g transform="translate(580, 64)">
          <rect x="0" y="0" width="556" height="424" rx="22" fill="#070B14" fill-opacity="0.9" stroke="${palette.accent}" stroke-opacity="0.4" stroke-width="2" />
          <text x="32" y="46" fill="${palette.accent}" font-family="monospace" font-size="14" font-weight="700" letter-spacing="1.5">KEY TAKEAWAYS FROM POST</text>
          <line x1="32" y1="64" x2="524" y2="64" stroke="${palette.grid}" stroke-width="1.5" />

          ${bullets
            .map(
              (b, i) => `
            <g transform="translate(32, ${92 + i * 102})">
              <rect x="0" y="0" width="492" height="82" rx="14" fill="${palette.bg2}" fill-opacity="0.65" stroke="${palette.grid}" stroke-width="1.2" />
              <circle cx="40" cy="41" r="20" fill="${palette.accent}" fill-opacity="0.18" stroke="${palette.accent}" stroke-width="1.8" />
              <text x="31" y="47" fill="${palette.accent}" font-family="monospace" font-size="16" font-weight="800">0${i + 1}</text>
              <text x="78" y="36" fill="#94A3B8" font-family="monospace" font-size="11" font-weight="700" letter-spacing="1">STEP 0${i + 1}</text>
              <text x="78" y="58" fill="#F8FAFC" font-family="sans-serif" font-size="16" font-weight="600">${b}</text>
            </g>
          `
            )
            .join('')}
        </g>
      `;
    } else if (layout === 'executive-quote') {
      bodySvg = `
        <!-- Editorial Quote / Insight Layout -->
        <rect x="64" y="58" width="1072" height="436" rx="26" fill="#070B14" fill-opacity="0.82" stroke="${palette.accent}" stroke-opacity="0.45" stroke-width="2" />
        <text x="96" y="132" fill="${palette.accent}" opacity="0.35" font-family="serif" font-size="96" font-weight="900">“</text>
        <rect x="155" y="84" width="390" height="34" rx="8" fill="${palette.badgeBg}" fill-opacity="0.3" stroke="${palette.accent}" stroke-opacity="0.5" />
        <text x="172" y="106" fill="${palette.accent}" font-family="monospace" font-size="13" font-weight="700" letter-spacing="1.4">${kwTag}</text>

        <text x="96" y="188" fill="#FFFFFF" font-family="sans-serif" font-size="40" font-weight="800">${headlineLines[0] || ''}</text>
        <text x="96" y="238" fill="#FFFFFF" font-family="sans-serif" font-size="40" font-weight="800">${headlineLines[1] || ''}</text>
        <text x="96" y="286" fill="${palette.accent}" font-family="sans-serif" font-size="36" font-weight="700">${headlineLines[2] || subheadlineLines[0] || ''}</text>

        <g transform="translate(96, 336)">
          <rect x="0" y="0" width="660" height="122" rx="16" fill="${palette.bg2}" fill-opacity="0.6" stroke="${palette.grid}" stroke-width="1.5" />
          <text x="24" y="34" fill="${palette.accent}" font-family="monospace" font-size="13" font-weight="700" letter-spacing="1.2">POST SUMMARY</text>
          <text x="24" y="64" fill="#F1F5F9" font-family="sans-serif" font-size="17" font-weight="600">• ${bullets[0] || subheadlineLines[0] || ''}</text>
          <text x="24" y="96" fill="#CBD5E1" font-family="sans-serif" font-size="17" font-weight="500">• ${bullets[1] || subheadlineLines[1] || ''}</text>
        </g>

        <g transform="translate(780, 336)">
          <rect x="0" y="0" width="320" height="122" rx="16" fill="${palette.badgeBg}" fill-opacity="0.28" stroke="${palette.accent}" stroke-width="2" />
          <text x="28" y="58" fill="${palette.accent}" font-family="monospace" font-size="44" font-weight="800">${metricVal}</text>
          <text x="28" y="94" fill="#FFFFFF" font-family="sans-serif" font-size="16" font-weight="700">${metricLbl}</text>
        </g>
      `;
    } else if (layout === 'comparison-split') {
      bodySvg = `
        <!-- Top Header Banner + 3-Pillar Architecture Grid -->
        <rect x="64" y="56" width="340" height="36" rx="8" fill="${palette.badgeBg}" fill-opacity="0.28" stroke="${palette.accent}" stroke-opacity="0.5" />
        <text x="82" y="79" fill="${palette.accent}" font-family="monospace" font-size="13" font-weight="700" letter-spacing="1.4">${kwTag}</text>

        <text x="64" y="144" fill="#FFFFFF" font-family="sans-serif" font-size="38" font-weight="800">${headlineLines[0] || ''} ${headlineLines[1] || ''}</text>
        <text x="64" y="186" fill="#CBD5E1" font-family="sans-serif" font-size="20" font-weight="500">${subheadlineLines[0] || ''}</text>

        <g transform="translate(880, 56)">
          <rect x="0" y="0" width="256" height="92" rx="16" fill="#070B14" stroke="${palette.accent}" stroke-width="2" />
          <text x="24" y="48" fill="${palette.accent}" font-family="monospace" font-size="34" font-weight="800">${metricVal}</text>
          <text x="24" y="74" fill="#E2E8F0" font-family="sans-serif" font-size="13" font-weight="600">${metricLbl.slice(0, 26)}</text>
        </g>

        ${bullets
          .map(
            (b, i) => `
          <g transform="translate(${64 + i * 366}, 224)">
            <rect x="0" y="0" width="340" height="270" rx="20" fill="#070B14" fill-opacity="0.88" stroke="${palette.accent}" stroke-opacity="${i === 0 ? '0.7' : '0.35'}" stroke-width="2" />
            <rect x="28" y="28" width="54" height="54" rx="14" fill="${palette.badgeBg}" fill-opacity="0.3" stroke="${palette.accent}" stroke-width="1.5" />
            <text x="43" y="63" fill="${palette.accent}" font-family="monospace" font-size="22" font-weight="800">0${i + 1}</text>
            <text x="28" y="118" fill="${palette.accent}" font-family="monospace" font-size="13" font-weight="700" letter-spacing="1.2">KEY PILLAR 0${i + 1}</text>
            <text x="28" y="156" fill="#FFFFFF" font-family="sans-serif" font-size="20" font-weight="700">${b.slice(0, 24)}</text>
            <text x="28" y="186" fill="#CBD5E1" font-family="sans-serif" font-size="18" font-weight="500">${b.slice(24, 48)}</text>
            <line x1="28" y1="228" x2="312" y2="228" stroke="${palette.grid}" stroke-width="1.5" />
            <text x="28" y="250" fill="#94A3B8" font-family="monospace" font-size="12" font-weight="600">VERIFIED TAKEAWAY</text>
          </g>
        `
          )
          .join('')}
      `;
    } else {
      // Default / 'stat-spotlight' for Landscape
      bodySvg = `
        <rect x="72" y="68" width="400" height="40" rx="8" fill="${palette.badgeBg}" fill-opacity="0.25" stroke="${palette.accent}" stroke-opacity="0.5" />
        <text x="92" y="94" fill="${palette.accent}" font-family="monospace" font-size="15" font-weight="700" letter-spacing="1.5">TOPIC: ${kwTag}</text>

        <text x="72" y="176" fill="#FFFFFF" font-family="sans-serif" font-size="42" font-weight="800">${headlineLines[0] || ''}</text>
        <text x="72" y="228" fill="#FFFFFF" font-family="sans-serif" font-size="42" font-weight="800">${headlineLines[1] || ''}</text>
        <text x="72" y="280" fill="${palette.accent}" font-family="sans-serif" font-size="38" font-weight="800">${headlineLines[2] || ''}</text>

        <text x="72" y="334" fill="#CBD5E1" font-family="sans-serif" font-size="21" font-weight="500">${subheadlineLines[0] || ''}</text>
        <text x="72" y="366" fill="#94A3B8" font-family="sans-serif" font-size="20" font-weight="500">${subheadlineLines[1] || ''}</text>

        <!-- Bottom Caption Bullet Callouts -->
        <g transform="translate(72, 398)">
          <rect x="0" y="0" width="680" height="92" rx="14" fill="#070B14" fill-opacity="0.78" stroke="${palette.grid}" stroke-width="1.5" />
          <text x="22" y="36" fill="#F8FAFC" font-family="sans-serif" font-size="17" font-weight="600">✓ ${bullets[0] || ''}</text>
          <text x="22" y="68" fill="#CBD5E1" font-family="sans-serif" font-size="17" font-weight="500">✓ ${bullets[1] || ''}</text>
        </g>

        <g transform="translate(790, 84)" opacity="0.95">
          <rect x="0" y="0" width="340" height="406" rx="22" fill="#090D16" fill-opacity="0.92" stroke="${palette.accent}" stroke-opacity="0.55" stroke-width="2" />
          <text x="32" y="52" fill="#94A3B8" font-family="monospace" font-size="14" font-weight="700" letter-spacing="1.5">KEY CAPTION METRIC</text>
          <text x="32" y="142" fill="${palette.accent}" font-family="monospace" font-size="64" font-weight="800">${metricVal}</text>
          <text x="32" y="184" fill="#F8FAFC" font-family="sans-serif" font-size="19" font-weight="700">${metricLbl}</text>
          <g transform="translate(32, 240)">
            <rect x="0" y="58" width="44" height="52" rx="6" fill="${palette.grid}" />
            <rect x="64" y="38" width="44" height="72" rx="6" fill="${palette.grid}" />
            <rect x="128" y="16" width="44" height="94" rx="6" fill="${palette.badgeBg}" />
            <rect x="192" y="-14" width="44" height="124" rx="6" fill="${palette.accent}" />
          </g>
        </g>
      `;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.bg1}" />
        <stop offset="100%" stop-color="${palette.bg2}" />
      </linearGradient>
      <radialGradient id="glow" cx="82%" cy="28%" r="48%">
        <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.24" />
        <stop offset="100%" stop-color="${palette.bg1}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    <rect width="${width}" height="${height}" fill="url(#glow)" />
    <g stroke="${palette.grid}" stroke-width="1" opacity="0.32">
      <line x1="0" y1="${isSquare ? 180 : 120}" x2="${width}" y2="${isSquare ? 180 : 120}" />
      <line x1="0" y1="${isSquare ? 360 : 260}" x2="${width}" y2="${isSquare ? 360 : 260}" />
      <line x1="0" y1="${isSquare ? 540 : 400}" x2="${width}" y2="${isSquare ? 540 : 400}" />
      <line x1="0" y1="${isSquare ? 720 : 530}" x2="${width}" y2="${isSquare ? 720 : 530}" />
      <line x1="0" y1="${footerLineY}" x2="${width}" y2="${footerLineY}" />
      <line x1="${isSquare ? 270 : 180}" y1="0" x2="${isSquare ? 270 : 180}" y2="${height}" />
      <line x1="${isSquare ? 540 : 560}" y1="0" x2="${isSquare ? 540 : 560}" y2="${height}" />
      <line x1="${isSquare ? 810 : 880}" y1="0" x2="${isSquare ? 810 : 880}" y2="${height}" />
    </g>
    ${bodySvg}
    <line x1="60" y1="${footerLineY}" x2="${width - 60}" y2="${footerLineY}" stroke="${palette.accent}" stroke-opacity="0.3" stroke-width="1.5" />
    <circle cx="80" cy="${footerY - 6}" r="14" fill="${palette.accent}" />
    <text x="74" y="${footerY}" fill="#05080F" font-family="sans-serif" font-size="16" font-weight="900">S</text>
    <text x="108" y="${footerY}" fill="#F8FAFC" font-family="monospace" font-size="14" font-weight="700" letter-spacing="1.4">${footer}</text>
    <text x="${width - 240}" y="${footerY}" fill="${palette.accent}" font-family="monospace" font-size="13" font-weight="700">${isPin ? 'PIN 1000x1500' : isSquare ? 'SQUARE 1080x1080' : 'LANDSCAPE 1200x627'}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const mockConnectedSocialPages: ConnectedSocialPage[] = [
  {
    id: 'page-li-1',
    platform: 'LinkedIn',
    pageName: 'Tech Sheba Official',
    pageHandle: '@techsheba',
    externalPageId: 'li_org_1029384',
    followersCount: 14200,
    oauthConnected: true,
    scopes: ['w_member_social', 'r_liteprofile'],
    lastSyncedAt: 'Live Connected',
    isSelected: true,
    category: 'LinkedIn Organization Page'
  },
  {
    id: 'page-fb-1',
    platform: 'Facebook',
    pageName: 'Tech Sheba Support & Solutions',
    pageHandle: '@techsheba.support',
    externalPageId: 'fb_page_556677',
    followersCount: 8400,
    oauthConnected: false,
    scopes: ['pages_manage_posts', 'pages_read_engagement'],
    lastSyncedAt: 'Not connected',
    isSelected: false,
    category: 'Facebook Business Page'
  },
  {
    id: 'page-ig-1',
    platform: 'Instagram',
    pageName: 'Tech Sheba Creative',
    pageHandle: '@techsheba_official',
    externalPageId: 'ig_biz_998811',
    followersCount: 6300,
    oauthConnected: false,
    scopes: ['instagram_basic', 'instagram_content_publish'],
    lastSyncedAt: 'Not connected',
    isSelected: false,
    category: 'Instagram Business Profile'
  },
  {
    id: 'page-x-1',
    platform: 'X',
    pageName: 'Tech Sheba Systems',
    pageHandle: '@techsheba',
    externalPageId: 'x_usr_445566',
    followersCount: 5200,
    oauthConnected: false,
    scopes: ['tweet.read', 'tweet.write'],
    lastSyncedAt: 'Not connected',
    isSelected: false,
    category: 'X Verified Handle'
  },
  {
    id: 'page-th-1',
    platform: 'Threads',
    pageName: 'Tech Sheba (Official Threads)',
    pageHandle: '@techsheba_official',
    externalPageId: 'th_usr_techsheba_991',
    followersCount: 2840,
    oauthConnected: false,
    scopes: ['threads_basic', 'threads_content_publish', 'threads_read_replies'],
    lastSyncedAt: 'Not connected',
    isSelected: false,
    category: 'Meta Threads Creator Profile'
  },
  {
    id: 'page-bsky-1',
    platform: 'Bluesky',
    pageName: 'Tech Sheba (Decentralized Node)',
    pageHandle: '@techsheba.bsky.social',
    externalPageId: 'did:plc:techsheba778899atproto',
    followersCount: 1650,
    oauthConnected: false,
    scopes: ['atproto:read', 'atproto:write', 'app.bsky.feed.post'],
    lastSyncedAt: 'Not connected',
    isSelected: false,
    category: 'AT Protocol Federated Profile'
  },
  {
    id: 'page-tt-1',
    platform: 'TikTok',
    pageName: 'Tech Sheba Tech Clips',
    pageHandle: '@techsheba_tech',
    externalPageId: 'tt_creator_techsheba_44',
    followersCount: 8920,
    oauthConnected: false,
    scopes: ['user.info.basic', 'video.publish', 'video.upload'],
    lastSyncedAt: 'Not connected',
    isSelected: false,
    category: 'TikTok Creator Hub'
  },
  {
    id: 'page-pin-1',
    platform: 'Pinterest',
    pageName: 'Tech Sheba Visual Playbooks',
    pageHandle: '@techsheba_pins',
    externalPageId: 'pin_biz_techsheba_108',
    followersCount: 5410,
    oauthConnected: false,
    scopes: ['boards:read', 'pins:read', 'pins:write'],
    lastSyncedAt: 'Not connected',
    isSelected: false,
    category: 'Pinterest Business Verified Hub'
  }
];
export const mockKeywordResearchBriefs: KeywordResearchBrief[] = [];
export const mockPageSocialPosts: PageSocialPost[] = [];
export const mockReports: ReportItem[] = [];

export const mockMessagingConfig: MessagingConfig = {
  slack: {
    connected: false,
    webhookUrl: 'https://example.com/slack-webhook-placeholder',
    workspaceName: 'Tech Sheba Enterprise Workspace',
    defaultChannel: '#leads-and-meetings',
    notifyOnMeeting: true,
    notifyOnLead: true,
    notifyOnApproval: true,
    lastTestedAt: 'Just now'
  },
  discord: {
    connected: true,
    webhookUrl: 'https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz',
    serverName: 'Tech Sheba Community Guild',
    defaultChannel: '#announcements-and-calls',
    notifyOnMeeting: true,
    notifyOnLead: true,
    notifyOnApproval: false,
    lastTestedAt: 'Just now'
  }
};

export const mockMeetings: MeetingItem[] = [
  {
    id: 'meet-01',
    title: 'Enterprise IT Infrastructure & Starlink Architecture Audit',
    type: 'strategy_audit',
    scheduledDate: '2026-11-05',
    scheduledTime: '03:00 PM',
    durationMinutes: 45,
    timezone: 'GMT+6 (Dhaka)',
    platform: 'google_meet',
    meetingUrl: 'https://meet.google.com/qwe-rtyu-iop',
    clientName: 'Tanvir Hossain',
    clientEmail: 'tanvir@apexholdings.bd',
    clientCompany: 'Apex Industrial Holdings',
    clientPhone: '+880 1711-223344',
    agenda: 'Review current factory campus WiFi deadzones, Starlink redundancy failover, and 24/7 CCTV biometrics.',
    notes: 'Tanvir requested pricing deck for 4-warehouse connectivity rollout.',
    status: 'confirmed',
    leadId: 'lead-01',
    notifySlack: true,
    notifyDiscord: true,
    notifyEmail: true,
    createdAt: 'Yesterday'
  },
  {
    id: 'meet-02',
    title: 'Zero-Downtime Cloud Backup & Disaster Recovery Demo',
    type: 'client_demo',
    scheduledDate: '2026-11-06',
    scheduledTime: '11:30 AM',
    durationMinutes: 30,
    timezone: 'GMT+6 (Dhaka)',
    platform: 'zoom',
    meetingUrl: 'https://zoom.us/j/9876543210',
    clientName: 'Sabrina Rahman',
    clientEmail: 'sabrina.r@dhakafintech.io',
    clientCompany: 'Dhaka FinTech Labs',
    clientPhone: '+880 1819-556677',
    agenda: 'Demonstrate automated snapshot failover, 15-minute RPO/RTO verification, and audit logs compliance.',
    status: 'scheduled',
    leadId: 'lead-02',
    notifySlack: true,
    notifyDiscord: false,
    notifyEmail: true,
    createdAt: 'Today'
  },
  {
    id: 'meet-03',
    title: 'Q4 Generative Engine Optimization (GEO) & Marketing Sync',
    type: 'quarterly_review',
    scheduledDate: '2026-11-08',
    scheduledTime: '04:15 PM',
    durationMinutes: 60,
    timezone: 'GMT+6 (Dhaka)',
    platform: 'google_meet',
    meetingUrl: 'https://meet.google.com/zxc-vbnm-lkj',
    clientName: 'Mahmudul Hasan',
    clientEmail: 'm.hasan@cloudscale.net',
    clientCompany: 'CloudScale Solutions',
    agenda: 'Quarterly review of Perplexity and ChatGPT brand citations, authority visual cards performance, and lead velocity.',
    status: 'scheduled',
    notifySlack: true,
    notifyDiscord: true,
    notifyEmail: true,
    createdAt: '2 days ago'
  }
];
