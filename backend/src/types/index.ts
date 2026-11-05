export type ViewId =
  | 'overview'
  | 'dashboard'
  | 'agents'
  | 'marketing-hub'
  | 'campaigns'
  | 'content'
  | 'social'
  | 'seo'
  | 'email'
  | 'leads'
  | 'meetings'
  | 'community'
  | 'analytics'
  | 'approvals'
  | 'automation'
  | 'reports'
  | 'integrations'
  | 'settings';

export type AgentId =
  | 'orchestrator'
  | 'research'
  | 'strategy'
  | 'content'
  | 'social'
  | 'community'
  | 'leads'
  | 'seo'
  | 'email'
  | 'analytics'
  | 'memory';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface AgentInfo {
  id: AgentId;
  name: string;
  role: string;
  department: 'RESEARCH' | 'CONTENT STUDIO' | 'POSTING & COMMUNITY' | 'GROWTH';
  riskLevel: RiskLevel;
  phase: number;
  model: string;
  status: 'idle' | 'running' | 'waiting_approval' | 'active';
  description: string;
  inputContract: {
    format: string;
    fields: string[];
  };
  outputContract: {
    format: string;
    fields: string[];
  };
  stats: {
    tasksCompleted: number;
    accuracyScore: number;
    avgLatencyMs: number;
  };
}

export interface OrchestrationStep {
  id: string;
  agent: AgentId;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'skipped' | 'approval';
  detail?: string;
  output?: string;
  riskLevel?: RiskLevel;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  timeline?: OrchestrationStep[];
  suggestedAction?: {
    label: string;
    view?: ViewId;
    actionType?: string;
  };
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'auto';

export interface ApprovalItem {
  id: string;
  title: string;
  agent: AgentId;
  contentType: 'social-post' | 'email' | 'blog' | 'commercial-reply';
  platform?: string;
  riskLevel: RiskLevel;
  status: ApprovalStatus;
  campaign?: string;
  submittedAt: string;
  preview: string;
  riskReason: string;
  diff?: {
    before?: string;
    after: string;
  };
  budgetImpact?: string;
  targetAudience?: string;
  visualUrl?: string;
  keyword?: string;
  linkedPagePostId?: string;
}

export interface CampaignItem {
  id: string;
  name: string;
  tagline: string;
  status: 'planning' | 'research' | 'content_creation' | 'review' | 'running' | 'completed' | 'paused';
  currentStage: number; // 1 to 10
  budget: {
    allocated: number;
    spent: number;
  };
  startDate: string;
  endDate: string;
  primaryMetric: {
    name: string;
    value: string;
    target: string;
  };
  leadAgent: AgentId;
  channels: string[];
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'blog' | 'linkedin-post' | 'x-thread' | 'carousel' | 'newsletter';
  platform: 'LinkedIn' | 'X' | 'Blog' | 'Instagram' | 'YouTube';
  status: 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'published';
  body: string;
  authorAgent: AgentId;
  createdAt: string;
  scheduledFor?: string;
  tags: string[];
  metrics?: {
    views?: number;
    clicks?: number;
    engagements?: number;
  };
}

export interface SocialPost {
  id: string;
  platform: SocialPagePlatform;
  content: string;
  scheduledTime: string;
  dayOfWeek: string;
  status: 'scheduled' | 'published' | 'draft';
  authorAgent: AgentId;
  mediaType?: 'text' | 'image' | 'video' | 'carousel';
  targetAccountHandle?: string;
  connectorType?: string;
  scheduledTimestamp?: number;
  publishedUrl?: string;
}

export interface TechnicalSeoFix {
  id: string;
  category: 'Schema & JSON-LD' | 'Core Web Vitals' | 'Meta & OpenGraph' | 'AI Citation Structure' | 'Content Gap';
  priority: 'critical' | 'high' | 'medium';
  title: string;
  impact: string;
  recommendation: string;
  status: 'open' | 'fixed';
}

export interface GeoScoreData {
  overallScore: number;
  change30Days: number;
  lastAuditedUrl?: string;
  lastAuditedAt?: string;
  aiEngineBreakdown: {
    engine: 'ChatGPT' | 'Perplexity' | 'Google AI Overviews' | 'Gemini';
    score: number;
    citationShare: number;
    sentiment: 'Positive' | 'Neutral' | 'Mixed';
    citationsLastWeek: number;
    topQuery: string;
  }[];
  hallucinationAlerts: {
    id: string;
    engine: string;
    severity: 'high' | 'medium' | 'low';
    claim: string;
    correction: string;
    detectedAt: string;
    status: 'open' | 'addressed';
  }[];
  topRankedEntities: {
    entity: string;
    visibility: number;
    position: number;
    trend: 'up' | 'stable' | 'down';
  }[];
  technicalFixes?: TechnicalSeoFix[];
}

export interface LeadItem {
  id: string;
  name: string;
  company: string;
  role: string;
  email?: string;
  source: 'LinkedIn Comment' | 'X Mention' | 'Contact Form' | 'Demo Request' | 'Facebook Page' | 'CSV Import';
  status: 'new' | 'qualified' | 'contacted' | 'converted';
  intent: 'high-priority-lead' | 'buying-signal' | 'interested';
  detectedMessage: string;
  buyingSignals: string[];
  score: number;
  assignedAgent: AgentId;
  suggestedAction: string;
  timestamp: string;
  notes?: string;
  outreachDraft?: {
    subject: string;
    body: string;
    channel: 'Email' | 'LinkedIn DM';
  };
  enrolledSequence?: string;
}

export interface CommunityMessage {
  id: string;
  sender: string;
  senderRole?: string;
  senderCompany?: string;
  avatar?: string;
  platform:
    | 'LinkedIn'
    | 'X'
    | 'YouTube'
    | 'Instagram'
    | 'Facebook'
    | 'Threads'
    | 'TikTok'
    | 'Pinterest'
    | 'Bluesky'
    | 'Slack'
    | 'Discord';
  type: 'comment' | 'dm' | 'mention';
  message: string;
  timestamp: string;
  intent: 'high-priority-lead' | 'buying-signal' | 'question' | 'praise' | 'spam';
  sentiment: 'positive' | 'neutral' | 'curious' | 'critical';
  requiresApproval: boolean;
  draftReply?: string;
  status: 'pending' | 'replied' | 'ignored';
  sourceChannel?: 'social_sync' | 'webhook' | 'manual' | 'seed';
  pageName?: string;
  externalPostId?: string;
  externalCommentId?: string;
  repliedAt?: string;
  publishedToPlatform?: boolean;
  convertedLeadId?: string;
}

export type MeetingType =
  | 'client_demo'
  | 'strategy_audit'
  | 'discovery_call'
  | 'quarterly_review'
  | 'technical_support';

export type MeetingPlatform = 'google_meet' | 'zoom' | 'teams' | 'phone';

export type MeetingStatus = 'scheduled' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';

export interface MeetingItem {
  id: string;
  title: string;
  type: MeetingType;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // e.g. '03:00 PM'
  durationMinutes: number; // 15, 30, 45, 60
  timezone: string;
  platform: MeetingPlatform;
  meetingUrl: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  clientPhone?: string;
  agenda?: string;
  notes?: string;
  status: MeetingStatus;
  leadId?: string;
  notifySlack: boolean;
  notifyDiscord: boolean;
  notifyEmail: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SlackConfig {
  connected: boolean;
  webhookUrl?: string;
  botToken?: string;
  workspaceName?: string;
  defaultChannel?: string;
  notifyOnMeeting?: boolean;
  notifyOnLead?: boolean;
  notifyOnApproval?: boolean;
  lastTestedAt?: string;
}

export interface DiscordConfig {
  connected: boolean;
  webhookUrl?: string;
  botToken?: string;
  serverName?: string;
  defaultChannel?: string;
  notifyOnMeeting?: boolean;
  notifyOnLead?: boolean;
  notifyOnApproval?: boolean;
  lastTestedAt?: string;
}

export interface MessagingConfig {
  slack: SlackConfig;
  discord: DiscordConfig;
}

export interface SaaSAppProfile {
  id: string;
  name: string;
  category: 'SaaS Platform' | 'Web App' | 'Developer Tool' | 'AI Product';
  domain: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  accentColor: string;
  tagline: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean; // true for 465, false for 587 STARTTLS
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  verified?: boolean;
  lastVerifiedAt?: string;
}

export interface EmailContact {
  id: string;
  email: string;
  firstName: string;
  company: string;
  appId: string;
  appName: string;
  planTier: 'Free Trial' | 'Starter' | 'Pro' | 'Enterprise';
  tags: string[];
  status: 'subscribed' | 'unsubscribed' | 'bounced';
  addedAt: string;
}

export interface EmailCampaign {
  id: string;
  appId?: string;
  appName?: string;
  title: string;
  type: 'welcome-flow' | 'nurture' | 'announcement' | 're-engagement' | 'feature-update';
  subjectLine: string;
  previewText: string;
  body: string;
  htmlCode?: string;
  audienceSegment: string;
  targetTag?: string;
  recipientsCount: number;
  openRate: number;
  ctr: number;
  status: 'draft' | 'pending_approval' | 'scheduled' | 'sent';
  riskLevel: RiskLevel;
  scheduledTime?: string;
  sentAt?: string;
  deliveryVia?: string;
  templateId?: string;
}

export interface EmailTemplateStepItem {
  title: string;
  description: string;
  duration?: string;
}

export interface EmailTemplate {
  id: string;
  appId?: string;
  name: string;
  category: 'onboarding' | 'feature-update' | 'nurture' | 'announcement' | 're-engagement';
  themeMode?: 'light' | 'dark';
  subjectLine: string;
  preheader: string;
  headerTitle: string;
  bodyContent: string;
  stepsList?: EmailTemplateStepItem[];
  postCtaText?: string;
  infoBox?: {
    title: string;
    description: string;
  };
  fallbackUrl?: string;
  signOffNote?: string;
  signOffName?: string;
  signOffRole?: string;
  footerReason?: string;
  highlightBox?: {
    title: string;
    value: string;
    caption: string;
  };
  ctaText: string;
  ctaUrl: string;
  accentColor?: string;
  logoText?: string;
  htmlCode?: string;
  variables: string[];
  lastModified: string;
}

export type SequenceNodeType = 'trigger' | 'email' | 'delay' | 'condition' | 'action';

export interface ConditionBranch {
  conditionType: 'email_opened' | 'link_clicked' | 'geo_score_gt' | 'demo_booked';
  description: string;
  trueNextNodeId?: string;
  falseNextNodeId?: string;
}

export interface SequenceNode {
  id: string;
  type: SequenceNodeType;
  title: string;
  subtitle?: string;
  templateId?: string;
  delayDays?: number;
  delayHours?: number;
  condition?: ConditionBranch;
  actionType?: 'hubspot_deal' | 'slack_notify' | 'tag_lead' | 'end_sequence';
  status: 'active' | 'paused' | 'draft';
  stats?: {
    entered: number;
    completed: number;
    dropoffRate: number;
  };
  nextNodeId?: string;
}

export interface SequenceStep {
  id: string;
  stepNumber: number;
  delayDays: number;
  templateId: string;
  subjectLine: string;
  previewSnippet: string;
  status: 'active' | 'draft' | 'paused';
  branchCondition?: string;
  stats: {
    sent: number;
    openRate: number;
    clickRate: number;
    replyRate: number;
  };
}

export interface EmailSequenceWorkflow {
  id: string;
  name: string;
  triggerEvent: string;
  description: string;
  status: 'active' | 'draft' | 'paused';
  targetAudience: string;
  steps: SequenceStep[];
  nodes?: SequenceNode[];
  overallMetrics: {
    enrolled: number;
    completed: number;
    avgOpenRate: number;
    avgClickRate: number;
  };
}

export interface MemoryItem {
  id: string;
  category: 'winning-hook' | 'winning-format' | 'best-time' | 'objection-handling' | 'competitor-gap';
  agent: AgentId;
  learning: string;
  confidence: number;
  supportingData: string;
  dateLogged: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  actionPipeline: string[];
  active: boolean;
  timesTriggered: number;
  lastTriggered: string;
  category?: 'LinkedIn' | 'Facebook' | 'Email' | 'Leads & CRM' | 'Radar & Webhook' | 'Scheduled' | 'Custom';
  condition?: string;
}

export interface IntegrationItem {
  id: string;
  name: string;
  category: 'AI Provider' | 'Social' | 'Advertising' | 'Analytics' | 'Productivity' | 'Automation' | 'CRM' | 'MCP' | 'Slack & Discord' | 'Webhook Hub';
  status: 'connected' | 'mock-mode' | 'disconnected' | 'error';
  description: string;
  authMethod: string;
  lastSync?: string;
}

// AutoSocial Integration Types (YouTube Shorts/Long-form & Multi-Channel)
export type VideoFormat = 'shorts' | 'longform';

export interface VideoScene {
  id: string;
  timestamp: string; // e.g. "0:00 - 0:08"
  sceneNumber: number;
  narration: string;
  visualCue: string;
  overlayText?: string;
  audioUrl?: string;
  audioDurationSeconds?: number;
  voiceId?: string;
  isGeneratingAudio?: boolean;
}

export interface VideoHookOption {
  id: string;
  text: string;
  viralityScore: number; // 0-100
  angle: string;
  isSelected: boolean;
}

export interface VideoVoiceoverConfig {
  provider: 'elevenlabs';
  voiceId: string;
  voiceName: string;
  stability: number;
  similarityBoost: number;
  style: number;
  audioUrl?: string;
  status?: 'idle' | 'rendering' | 'ready' | 'error';
  renderedAt?: string;
  durationSeconds?: number;
}

export interface VideoAvatarConfig {
  provider: 'heygen';
  avatarId: string;
  avatarName: string;
  backgroundMode: 'dark_studio' | 'neon_matrix' | 'minimal_office' | 'chroma_green';
  videoUrl?: string;
  previewImageUrl?: string;
  status?: 'idle' | 'rendering' | 'ready' | 'error';
  renderedAt?: string;
  durationSeconds?: number;
}

export interface YouTubeVideoProject {
  id: string;
  title: string;
  format: VideoFormat; // 'shorts' (9:16) | 'longform' (16:9)
  targetChannelId: string;
  durationSeconds: number;
  status: 'draft' | 'pending_approval' | 'scheduled' | 'published';
  hooks: VideoHookOption[];
  scenes: VideoScene[];
  description: string;
  tags: string[];
  chapters?: { timestamp: string; title: string }[];
  thumbnailConcept: {
    headline: string;
    visualDescription: string;
    badgeText?: string;
  };
  voiceover?: VideoVoiceoverConfig;
  avatar?: VideoAvatarConfig;
  metrics?: {
    views?: number;
    retentionRate?: number;
    ctr?: number;
    subscribersGained?: number;
  };
  createdAt: string;
}

export interface SocialChannelAccount {
  id: string;
  name: string;
  handle: string;
  platform: 'YouTube' | 'TikTok' | 'Instagram' | 'X' | 'LinkedIn' | 'Threads' | 'Bluesky';
  category: 'official_brand' | 'personal_founder' | 'micro_content' | 'insights';
  followerCount: number;
  dailyUploadLimit: number;
  queuedCount: number;
  status: 'connected' | 'rate_limited' | 'paused';
  lastUploadAt?: string;
}

export interface VideoMutationConfig {
  speedMultiplier: number;
  pitchShiftCents: number;
  stripMetadata: boolean;
  applyMicroColorGrade: boolean;
  aspectRatio: '9:16' | '16:9' | '1:1';
  watermarkOpacity: number;
  voiceMutationEnabled?: boolean;
  targetVoiceId?: string;
  targetVoiceName?: string;
  mutatedAudioUrl?: string;
  avatarOverlayEnabled?: boolean;
  avatarId?: string;
  avatarName?: string;
  avatarPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'pip-circle';
  avatarScale?: number;
  mutatedVideoUrl?: string;
}

// Multi-Channel Social Page Platforms: Facebook, Instagram, LinkedIn, X (Twitter), YouTube, Threads, Bluesky, TikTok, Pinterest
export type SocialPagePlatform =
  | 'Facebook'
  | 'Instagram'
  | 'LinkedIn'
  | 'X'
  | 'YouTube'
  | 'Threads'
  | 'TikTok'
  | 'Pinterest'
  | 'Bluesky';

export interface ScheduledSocialPost {
  id: string;
  platform: SocialPagePlatform;
  pageId?: string;
  pageName?: string;
  pageHandle?: string;
  content: string;
  visualUrl?: string;
  mediaType?: 'text' | 'image' | 'video' | 'carousel';
  scheduledTimestamp: number;
  scheduledTimeFormatted: string;
  dayOfWeek?: string;
  status: 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';
  createdAt: string;
  publishedAt?: string;
  connectorType:
    | 'threads_graph_api'
    | 'bluesky_atproto'
    | 'tiktok_posting_api'
    | 'pinterest_content_api'
    | 'meta_graph'
    | 'linkedin_rest'
    | 'x_v2'
    | 'youtube_v3';
  livePostId?: string;
  externalPostUrl?: string;
  retriesCount?: number;
  maxRetries?: number;
  lastError?: string;
  rawConnectorResponse?: any;
  tags?: string[];
  viralityScore?: number;
  targetAudience?: string;
}

export type VisualCardTheme =
  | 'emerald-matrix'
  | 'linkedin-executive'
  | 'facebook-cobalt'
  | 'instagram-gradient'
  | 'x-dark'
  | 'amber-alert'
  | 'amber-authority'
  | 'violet-story'
  | 'threads-slate'
  | 'tiktok-neon'
  | 'pinterest-crimson'
  | 'bluesky-azure';

export type VisualCardLayout =
  | 'checklist-roadmap'
  | 'stat-spotlight'
  | 'executive-quote'
  | 'comparison-split';

export interface SocialVisualCardConfig {
  headline: string;
  subheadline: string;
  metricValue: string;
  metricLabel: string;
  keywordTag: string;
  theme: VisualCardTheme;
  footerBrand: string;
  layout?: VisualCardLayout;
  bulletPoints?: string[];
  customImageUrl?: string;
  aspectRatio?: '1200:627' | '1080:1080' | '1000:1500';
  visualMode?: 'ai-image' | 'svg-infographic' | 'uploaded-image';
  aiPrompt?: string;
  aiStyle?: 'photorealistic' | 'modern-digital-art' | 'minimalist-infographic' | 'corporate-executive';
}

export interface KeywordResearchBrief {
  keyword: string;
  searchVolume: string;
  difficultyScore: number;
  buyerIntent: 'Informational' | 'Commercial' | 'Transactional' | 'Executive Research';
  competitorGap: string;
  audiencePainPoint: string;
  keyBenchmarkStat: string;
  recommendedAngles: {
    linkedinAngle: string;
    facebookAngle: string;
  };
}

export interface CommentSentimentInsight {
  positivePercent: number;
  curiousQuestionsPercent: number;
  objectionPercent: number;
  topQuestions: string[];
  sampleComments: {
    author: string;
    roleOrHandle: string;
    text: string;
    sentiment: 'positive' | 'question' | 'objection';
    timestamp: string;
  }[];
  recommendedFollowUpKeyword: string;
  aiResearchTakeaway: string;
}

export interface ConnectedSocialPage {
  id: string;
  platform: SocialPagePlatform;
  pageName: string;
  pageHandle: string;
  externalPageId: string;
  followersCount: number;
  oauthConnected: boolean;
  scopes: string[];
  lastSyncedAt: string;
  isSelected?: boolean;
  accessToken?: string;
  category?: string;
  pictureUrl?: string;
}

export interface PageSocialPost {
  id: string;
  platform: SocialPagePlatform;
  pageId: string;
  pageName: string;
  pageHandle: string;
  keyword: string;
  researchBrief: KeywordResearchBrief;
  content: string;
  hashtags: string[];
  visualConfig: SocialVisualCardConfig;
  visualUrl: string;
  status: 'draft' | 'pending_approval' | 'published' | 'rejected';
  createdAt: string;
  publishedAt?: string;
  approvalId?: string;
  syncedToResearchAgent?: boolean;
  livePostId?: string;
  externalPostUrl?: string;
  analytics?: {
    impressions: number;
    reach: number;
    clicks: number;
    ctr: number;
    reactions: number;
    commentsCount: number;
    shares: number;
    engagementRate: number;
  };
  commentInsights?: CommentSentimentInsight;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  chunks: number;
  embeddings: string;
  lastSynced: string;
  source: string;
  url?: string;
  sampleChunks?: string[];
}

export interface BrandProfile {
  name: string;
  website: string;
  tagline: string;
  mission: string;
  voiceTone: string;
  coreUSPs: string[];
  competitors: {
    name: string;
    threat: 'High' | 'Medium' | 'Low';
    focus: string;
  }[];
  brandRules: string[];
  knowledgeDocs?: KnowledgeDoc[];
}

export interface ReportItem {
  id: string;
  title: string;
  period: string;
  type: string;
  summary: string;
  keyKpi: string;
  author: string;
  metricsSnapshot?: Record<string, string | number>;
}

export type UserRole = 'owner' | 'director' | 'editor' | 'viewer';

export interface RolePermissionConfig {
  role: UserRole;
  label: string;
  tagline: string;
  badgeColor: string;
  canApproveSpend: boolean;
  canManageSettings: boolean;
  canManageApiKeys: boolean;
  canCreateAndDraft: boolean;
  canPublishLive: boolean;
  isReadOnly: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  initials: string;
  avatarUrl?: string;
  permissions: {
    canManageSettings: boolean;
    canManageApiKeys: boolean;
    canApproveSpends: boolean;
    canCreateAssets: boolean;
    canPublishLive: boolean;
    isReadOnly: boolean;
  };
}

export interface WebhookHubConfig {
  enabled: boolean;
  secretToken: string;
  requireSecret: boolean;
  routingMode: 'smart_queue' | 'approval_gate' | 'instant_publish';
  targetPlatforms: SocialPagePlatform[];
  autoGenerateVisuals: boolean;
  brandTone: string;
}

export interface WebhookLogEntry {
  id: string;
  timestamp: string;
  source: 'Shopify' | 'WordPress' | 'n8n' | 'Make.com' | 'Custom';
  eventType: string;
  title: string;
  url?: string;
  price?: string;
  status: 'success' | 'queued' | 'unauthorized' | 'error';
  generatedPostsCount: number;
  postIds: string[];
  approvalIds: string[];
  payloadSummary: string;
  rawPayloadSnippet: string;
  latencyMs: number;
}




