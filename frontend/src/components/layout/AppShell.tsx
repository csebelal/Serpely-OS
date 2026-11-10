import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandCenter } from '../command-center/CommandCenter';
import {
  ViewId,
  AgentInfo,
  ApprovalItem,
  BrandProfile,
  CampaignItem,
  ContentItem,
  SocialPost,
  GeoScoreData,
  LeadItem,
  CommunityMessage,
  AutomationRule,
  IntegrationItem,
  MemoryItem,
  ConnectedSocialPage,
  PageSocialPost,
  ReportItem,
  UserRole,
  AuthUser,
  MeetingItem
} from '../../types';
import {
  ROLE_CONFIGS,
  getAuthUserByRole,
  DEFAULT_ADMIN_USER
} from '../../data/rbac-data';
import { LoginView } from '../auth/LoginView';
import { OnboardingView, OnboardingResult } from '../auth/OnboardingView';
import { apiClient } from '../../services/apiClient';
import { ErrorBoundary } from '../common/ErrorBoundary';
import {
  mockBrandProfile,
  mockAgents,
  mockApprovals,
  mockGeoScore,
  mockCampaigns,
  mockContentList,
  mockSocialCalendar,
  mockLeads,
  mockCommunityMessages,
  mockAutomations,
  mockIntegrations,
  mockMemories,
  mockConnectedSocialPages,
  mockPageSocialPosts,
  mockReports,
  mockMeetings
} from '../../data/mock-data';

// Import all 18 views
import { OverviewView } from '../views/OverviewView';
import { DashboardView } from '../views/DashboardView';
import { AgentsView } from '../views/AgentsView';
import { MarketingHubView } from '../views/MarketingHubView';
import { CampaignsView } from '../views/CampaignsView';
import { ContentView } from '../views/ContentView';
import { SocialView } from '../views/SocialView';
import { SeoView } from '../views/SeoView';
import { EmailView } from '../views/EmailView';
import { LeadsView } from '../views/LeadsView';
import { CommunityView } from '../views/CommunityView';
import { AnalyticsView } from '../views/AnalyticsView';
import { ApprovalsView } from '../views/ApprovalsView';
import { AutomationView } from '../views/AutomationView';
import { ReportsView } from '../views/ReportsView';
import { IntegrationsView } from '../views/IntegrationsView';
import { SettingsView } from '../views/SettingsView';
import { MeetingsView } from '../views/MeetingsView';
import { DashboardSkeleton } from '../dashboard/DashboardSkeleton';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

export const VIEW_TO_PATH: Record<ViewId, string> = {
  dashboard: '/dashboard',
  overview: '/overview',
  agents: '/agents',
  'marketing-hub': '/marketing-hub',
  campaigns: '/campaigns',
  content: '/content',
  social: '/social',
  seo: '/seo',
  email: '/email',
  leads: '/leads',
  meetings: '/meetings',
  community: '/community',
  analytics: '/analytics',
  approvals: '/approvals',
  automation: '/automation',
  reports: '/reports',
  integrations: '/integrations',
  settings: '/settings'
};

export const PATH_TO_VIEW: Record<string, ViewId> = {
  '': 'dashboard',
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/overview': 'overview',
  '/architecture': 'overview',
  '/agents': 'agents',
  '/marketing-hub': 'marketing-hub',
  '/knowledge': 'marketing-hub',
  '/campaigns': 'campaigns',
  '/content': 'content',
  '/social': 'social',
  '/seo': 'seo',
  '/email': 'email',
  '/leads': 'leads',
  '/meetings': 'meetings',
  '/community': 'community',
  '/analytics': 'analytics',
  '/approvals': 'approvals',
  '/automation': 'automation',
  '/reports': 'reports',
  '/integrations': 'integrations',
  '/settings': 'settings'
};

export const getViewFromPathname = (
  pathname: string
): {
  view: ViewId;
  isLogin: boolean;
  initialAuthMode?: 'signin' | 'signup';
  isOnboarding?: boolean;
} => {
  const norm = (pathname || '').replace(/\/+$/, '') || '/';
  const lower = norm.toLowerCase();
  if (lower === '/signup') {
    return { view: 'dashboard', isLogin: true, initialAuthMode: 'signup', isOnboarding: false };
  }
  if (lower === '/onboarding') {
    return { view: 'dashboard', isLogin: false, isOnboarding: true };
  }
  if (lower === '/login' || norm === '/' || norm === '') {
    return { view: 'dashboard', isLogin: true, initialAuthMode: 'signin', isOnboarding: false };
  }
  const found = PATH_TO_VIEW[lower];
  if (found) {
    return { view: found, isLogin: false, isOnboarding: false };
  }
  return { view: 'dashboard', isLogin: false, isOnboarding: false };
};

export const AppShell: React.FC = () => {
  const initialRoute = typeof window !== 'undefined'
    ? getViewFromPathname(window.location.pathname)
    : { view: 'dashboard' as ViewId, isLogin: false };

  const [activeView, setActiveView] = useState<ViewId>(initialRoute.view);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('serpely_theme_default_light');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (appTheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    try {
      localStorage.setItem('serpely_theme_default_light', appTheme);
    } catch {
      // ignore storage errors
    }
  }, [appTheme]);

  const handleToggleTheme = () => {
    setAppTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(`Switched workspace to ${next === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}.`);
      return next;
    });
  };

  // Core persistent workspace state across all 18 views
  const [brandProfile, setBrandProfile] = useState<BrandProfile>({
    name: 'My Workspace',
    website: '',
    industry: '',
    description: '',
    tagline: 'Autonomous AI Growth & Marketing Engine',
    mission: 'Scale revenue and brand authority through autonomous AI marketing orchestration.',
    voiceTone: 'Professional, Engaging & Authoritative',
    targetAudience: '',
    keyThemes: [],
    brandColors: ['#10b981', '#064e3b', '#0f172a']
  });
  const [agents, setAgents] = useState<AgentInfo[]>(mockAgents);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [geoScore, setGeoScore] = useState<GeoScoreData>({ overallScore: 0, breakdowns: [] } as any);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([
    { id: 'int-gemini', name: 'Google Gemini 2.5 Pro', category: 'ai', status: 'connected', description: 'Core LLM Engine for autonomous marketing orchestration', icon: 'Sparkles', lastSync: 'Active System Engine' },
    { id: 'int-linkedin', name: 'LinkedIn Marketing Platform', category: 'social', status: 'disconnected', description: 'Publish and schedule executive content and company updates', icon: 'Linkedin', lastSync: 'Never' },
    { id: 'int-meta', name: 'Meta (Facebook & Instagram)', category: 'social', status: 'disconnected', description: 'Publish feeds, reels, and stories with Graph API', icon: 'Facebook', lastSync: 'Never' },
    { id: 'int-google', name: 'Google / YouTube & Ads', category: 'analytics', status: 'disconnected', description: 'Track YouTube channel analytics and PPC search campaigns', icon: 'Youtube', lastSync: 'Never' },
    { id: 'int-hubspot', name: 'HubSpot CRM', category: 'crm', status: 'disconnected', description: 'Synchronize leads, contacts, and deal pipelines', icon: 'Layers', lastSync: 'Never' },
    { id: 'int-smtp', name: 'Custom SMTP Mailer', category: 'email', status: 'disconnected', description: 'Send automated email drip campaigns with custom SMTP', icon: 'Mail', lastSync: 'Never' },
    { id: 'int-elevenlabs', name: 'ElevenLabs Voice AI', category: 'ai', status: 'disconnected', description: 'Synthesize studio-quality voiceovers and audio podcasts', icon: 'Mic', lastSync: 'Never' },
    { id: 'int-heygen', name: 'HeyGen Video Avatars', category: 'ai', status: 'disconnected', description: 'Render photorealistic AI spokesperson video avatars', icon: 'Video', lastSync: 'Never' }
  ]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [connectedPages, setConnectedPages] = useState<ConnectedSocialPage[]>([]);
  const [pagePosts, setPagePosts] = useState<PageSocialPost[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  // Role-Based Access Control (RBAC) User Session
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    try {
      const savedUser = localStorage.getItem('serpely_authenticated_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      const saved = localStorage.getItem('serpely_active_role') as UserRole;
      if (saved) {
        return getAuthUserByRole(saved);
      }
    } catch {}
    return DEFAULT_ADMIN_USER;
  });

  const [isAuthScreenOpen, setIsAuthScreenOpen] = useState<boolean>(() => {
    if (initialRoute.isLogin) return true;
    try {
      const saved = localStorage.getItem('serpely_authenticated_user');
      if (saved) return false;
    } catch {}
    return true;
  });
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>(
    initialRoute.initialAuthMode || 'signin'
  );
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() =>
    Boolean(initialRoute.isOnboarding)
  );

  const handleNavigate = (view: ViewId, replace = false) => {
    setActiveView(view);
    const targetPath = VIEW_TO_PATH[view] || '/dashboard';
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      if (replace) {
        window.history.replaceState({ view }, '', targetPath);
      } else {
        window.history.pushState({ view }, '', targetPath);
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('serpely_authenticated_user');
    const currentPath = window.location.pathname.toLowerCase();
    if (currentPath === '' || currentPath === '/' || !saved) {
      if (currentPath !== '/login' && currentPath !== '/signup') {
        window.history.replaceState({ isLogin: true }, '', '/login');
      }
      setIsAuthScreenOpen(true);
    }

    const handlePopState = () => {
      const route = getViewFromPathname(window.location.pathname);
      setActiveView(route.view);
      setIsAuthScreenOpen(route.isLogin);
      if (route.initialAuthMode) {
        setAuthInitialMode(route.initialAuthMode);
      }
      setIsOnboardingOpen(Boolean(route.isOnboarding));
    };

    const handleUnauthorized = () => {
      setIsAuthScreenOpen(true);
      if (window.location.pathname !== '/login') {
        window.history.pushState({ isLogin: true }, '', '/login');
      }
      showToast('Session expired or unauthorized. Please sign in again.');
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const handleSwitchRole = (newRole: UserRole) => {
    const user = getAuthUserByRole(newRole);
    setCurrentUser(user);
    try {
      localStorage.setItem('serpely_active_role', newRole);
      localStorage.setItem('serpely_authenticated_user', JSON.stringify(user));
    } catch {}
    showToast(`Workspace role switched to ${user.title || newRole.toUpperCase()}.`);
  };

  const handleLogin = (user: AuthUser, options?: { isNewUser?: boolean }) => {
    setCurrentUser(user);
    setIsAuthScreenOpen(false);
    try {
      localStorage.setItem('serpely_authenticated_user', JSON.stringify(user));
      localStorage.setItem('serpely_active_role', user.role);
    } catch {}

    if (options?.isNewUser) {
      setIsOnboardingOpen(true);
      if (typeof window !== 'undefined' && window.location.pathname !== '/onboarding') {
        window.history.pushState({ isOnboarding: true }, '', '/onboarding');
      }
      showToast(`Welcome to Sincly, ${user.name}! Let's personalize your workspace.`);
      return;
    }

    setIsOnboardingOpen(false);
    const targetPath = VIEW_TO_PATH[activeView] || '/dashboard';
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ view: activeView }, '', targetPath);
    }
    showToast(`Signed in as ${user.name} (${user.role.toUpperCase()}). Full permissions active.`);
  };

  const handleCompleteOnboarding = (result: OnboardingResult) => {
    setBrandProfile(result.brandProfile);
    persistPartialState({ brandProfile: result.brandProfile });
    try {
      localStorage.setItem(`serpely_onboarding_completed_${currentUser.email}`, 'true');
    } catch {}
    setIsOnboardingOpen(false);
    handleNavigate('dashboard');
    showToast(`Workspace "${result.brandProfile.name}" is ready!`);
  };

  const handleSkipOnboarding = () => {
    try {
      localStorage.setItem(`serpely_onboarding_completed_${currentUser.email}`, 'true');
    } catch {}
    setIsOnboardingOpen(false);
    handleNavigate('dashboard');
    showToast('Onboarding skipped. Update brand details anytime in Settings.');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('serpely_authenticated_user');
      localStorage.removeItem('serpely_auth_token');
      localStorage.removeItem('serpely_active_role');
    } catch {}
    setIsAuthScreenOpen(true);
    if (typeof window !== 'undefined') {
      window.history.pushState({ isLogin: true }, '', '/login');
    }
    showToast('Signed out of workspace.');
  };

  const handleOpenLogin = () => {
    setIsAuthScreenOpen(true);
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.history.pushState({ isLogin: true }, '', '/login');
    }
  };

  const handleCloseLogin = () => {
    setIsAuthScreenOpen(false);
    const targetPath = VIEW_TO_PATH[activeView] || '/dashboard';
    if (typeof window !== 'undefined' && window.location.pathname === '/login') {
      window.history.pushState({ view: activeView }, '', targetPath);
    }
  };

  const applyServerState = (serverState: any) => {
    if (!serverState) return;
    if (serverState.brandProfile) {
      setBrandProfile(serverState.brandProfile);
    }
    if (serverState.agents) setAgents(serverState.agents);
    if (serverState.approvals) setApprovals(serverState.approvals);
    if (serverState.geoScore) setGeoScore(serverState.geoScore);
    if (serverState.campaigns) setCampaigns(serverState.campaigns);
    if (serverState.contentList) setContentList(serverState.contentList);
    if (serverState.socialPosts) setSocialPosts(serverState.socialPosts);
    if (serverState.leads) setLeads(serverState.leads);
    if (serverState.communityMessages) setCommunityMessages(serverState.communityMessages);
    if (serverState.automations) setAutomations(serverState.automations);
    if (serverState.integrations) setIntegrations(serverState.integrations);
    if (serverState.memories) setMemories(serverState.memories);
    if (serverState.connectedPages) setConnectedPages(serverState.connectedPages);
    if (serverState.pagePosts) setPagePosts(serverState.pagePosts);
    if (serverState.reports) setReports(serverState.reports);
    if (serverState.meetings) setMeetings(serverState.meetings);
  };

  // Load persistent state from server on mount
  useEffect(() => {
    let isMounted = true;
    const params = currentUser?.email ? { userEmail: currentUser.email } : undefined;

    apiClient.get('/api/state', { params })
      .then(res => {
        if (isMounted && res.success && res.data) {
          applyServerState(res.data);
        }
      })
      .catch(() => {
        // Fallback to local state if offline or network error
      })
      .finally(() => {
        if (isMounted) setIsHydrating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser?.email]);

  const persistPartialState = async (partial: Record<string, unknown>) => {
    try {
      await apiClient.put('/api/state', partial);
    } catch {
      // ignore network error
    }
  };

  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;
  const newLeadsCount = leads.filter(l => l.status === 'new').length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleApprove = async (id: string) => {
    const item = approvals.find(a => a.id === id);
    const nextApprovals = approvals.map(a =>
      a.id === id ? { ...a, status: 'approved' as const } : a
    );
    setApprovals(nextApprovals);

    // 1. Transition matching LinkedIn/Facebook Page post to published
    const nextPagePosts = pagePosts.map(post => {
      if (
        post.approvalId === id ||
        post.id === item?.linkedPagePostId ||
        post.id === id
      ) {
        return {
          ...post,
          status: 'published' as const,
          publishedAt: 'Just now',
          analytics: post.analytics || {
            impressions: 14280,
            reach: 11420,
            clicks: 685,
            ctr: 4.8,
            reactions: 284,
            commentsCount: 38,
            shares: 54,
            engagementRate: 6.7
          },
          commentInsights: post.commentInsights || {
            positivePercent: 65,
            curiousQuestionsPercent: 28,
            objectionPercent: 7,
            topQuestions: [
              `How fast does ${post.keyword} affect AI citation rankings across Perplexity and ChatGPT?`,
              `Can we deploy ${post.keyword} schema updates without modifying existing page templates?`
            ],
            sampleComments: [
              {
                author: 'Rachel Lin',
                roleOrHandle: 'VP of Marketing @ CloudPulse',
                text: `Just reviewed the visual card on ${post.keyword}—super actionable. How fast do RAG engines pick up the updated schema?`,
                sentiment: 'question' as const,
                timestamp: 'Just now'
              },
              {
                author: 'Devon Brooks',
                roleOrHandle: 'Head of SEO @ VectorFlow',
                text: `This aligns 100% with what we are seeing in Google AI Overviews this month.`,
                sentiment: 'positive' as const,
                timestamp: '2m ago'
              }
            ],
            recommendedFollowUpKeyword: `${post.keyword} Schema Implementation Guide`,
            aiResearchTakeaway: `Live post published via Approval Gate. Initial audience engagement shows strong interest in step-by-step implementation templates for ${post.keyword}.`
          }
        };
      }
      return post;
    });
    setPagePosts(nextPagePosts);

    // 2. Transition matching Content Studio item to published
    const nextContentList = contentList.map(c =>
      c.title === item?.title ? { ...c, status: 'published' as const } : c
    );
    setContentList(nextContentList);

    persistPartialState({
      approvals: nextApprovals,
      pagePosts: nextPagePosts,
      contentList: nextContentList
    });

    // Call live publishing endpoint if applicable
    if (item?.platform) {
      try {
        await fetch('/api/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: item.platform,
            text: item.preview,
            visualUrl: item.visualUrl,
            keyword: item.keyword
          })
        });
      } catch (e) {
        console.error('Publish API call error:', e);
      }
    }

    showToast(
      `Approved & Published: "${item?.title || 'Post'}" dispatched to ${item?.platform || 'target channel'}.`
    );
  };

  const handleReject = (id: string) => {
    const item = approvals.find(a => a.id === id);
    const nextApprovals = approvals.map(a =>
      a.id === id ? { ...a, status: 'rejected' as const } : a
    );
    setApprovals(nextApprovals);
    persistPartialState({ approvals: nextApprovals });
    showToast(`Rejected: "${item?.title || 'Item'}" sent back for agent revision.`);
  };

  const handleSubmitToApproval = (item: ContentItem) => {
    const newApproval: ApprovalItem = {
      id: `ap-${Date.now()}`,
      title: item.title,
      agent: item.authorAgent,
      contentType: item.type as any,
      platform: item.platform,
      riskLevel: 'medium',
      status: 'pending',
      submittedAt: 'Just now',
      preview: item.body,
      riskReason: 'Public social distribution requires brand safety review.'
    };
    const nextApprovals = [newApproval, ...approvals];
    setApprovals(nextApprovals);
    persistPartialState({ approvals: nextApprovals });
    showToast(`Submitted "${item.title}" to Human Approval Gate.`);
  };

  const handleResetWorkspace = async () => {
    try {
      const res = await fetch('/api/state/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.state) applyServerState(data.state);
        showToast('Workspace reset to default seed data.');
      }
    } catch {
      showToast('Failed to reset workspace.');
    }
  };

  // Keyboard shortcut listener (⌘K for Search, ⌘J for Ask AI)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView onNavigate={handleNavigate} onOpenCommand={() => setCommandOpen(true)} />;
      case 'dashboard':
        return (
          <DashboardView
            agents={agents}
            approvals={approvals}
            campaigns={campaigns}
            socialPosts={socialPosts}
            onNavigate={handleNavigate}
            onOpenCommand={() => setCommandOpen(true)}
            onApproveItem={handleApprove}
          />
        );
      case 'agents':
        return (
          <AgentsView
            agents={agents}
            onOpenCommand={() => setCommandOpen(true)}
            onNavigate={handleNavigate}
            onStateSynced={applyServerState}
          />
        );
      case 'marketing-hub':
        return (
          <MarketingHubView
            brandProfile={brandProfile}
            memoriesList={memories}
            campaignsList={campaigns}
            contentList={contentList}
            onUpdateBrandProfile={nextProfile => {
              setBrandProfile(nextProfile);
              persistPartialState({ brandProfile: nextProfile });
            }}
            onStateSynced={applyServerState}
          />
        );
      case 'campaigns':
        return (
          <CampaignsView
            campaigns={campaigns}
            onOpenCommand={() => setCommandOpen(true)}
            onNavigate={handleNavigate}
            onStateSynced={applyServerState}
            onUpdateCampaigns={nextCampaigns => {
              setCampaigns(nextCampaigns);
              persistPartialState({ campaigns: nextCampaigns });
              showToast('Campaign workflow state saved.');
            }}
          />
        );
      case 'content':
        return (
          <ContentView
            contentList={contentList}
            onOpenCommand={() => setCommandOpen(true)}
            onSubmitToApproval={handleSubmitToApproval}
            onUpdateContentList={nextContent => {
              setContentList(nextContent);
              persistPartialState({ contentList: nextContent });
            }}
            brandName={brandProfile.name}
            onNavigate={handleNavigate}
            onStateSynced={applyServerState}
          />
        );
      case 'social':
        return (
          <SocialView
            onOpenCommand={() => setCommandOpen(true)}
            onNavigate={handleNavigate}
            connectedPages={connectedPages}
            pagePosts={pagePosts}
            socialPosts={socialPosts}
            approvals={approvals}
            brandProfile={brandProfile}
            currentUser={currentUser}
            onUpdateConnectedPages={nextPages => {
              setConnectedPages(nextPages);
              persistPartialState({ connectedPages: nextPages });
            }}
            onUpdatePagePosts={nextPosts => {
              setPagePosts(nextPosts);
              persistPartialState({ pagePosts: nextPosts });
            }}
            onUpdateSocialPosts={(nextSocialPosts: SocialPost[]) => {
              setSocialPosts(nextSocialPosts);
              persistPartialState({ socialPosts: nextSocialPosts });
            }}
            onApproveItem={handleApprove}
            onSubmitApproval={(newApp: ApprovalItem) => {
              const nextApprovals = [newApp, ...approvals];
              setApprovals(nextApprovals);
              persistPartialState({ approvals: nextApprovals });
              showToast(`Submitted "${newApp.title}" to Human Approval Gate.`);
            }}
          />
        );
      case 'seo':
        return (
          <SeoView
            geoScore={geoScore}
            onUpdateGeoScore={nextGeo => {
              setGeoScore(nextGeo);
              persistPartialState({ geoScore: nextGeo });
            }}
            brandName={brandProfile.name}
            brandWebsite={brandProfile.website}
          />
        );
      case 'email':
        return (
          <EmailView
            brandProfile={brandProfile}
            onOpenCommand={() => setCommandOpen(true)}
            onNavigate={handleNavigate}
            onSubmitApproval={(newApp: ApprovalItem) => {
              const nextApprovals = [newApp, ...approvals];
              setApprovals(nextApprovals);
              persistPartialState({ approvals: nextApprovals });
              showToast(`Submitted "${newApp.title}" to Human Approval Gate.`);
            }}
          />
        );
      case 'leads':
        return (
          <LeadsView
            onNavigate={handleNavigate}
            onOpenCommand={() => setCommandOpen(true)}
            leadsList={leads}
            brandName={brandProfile.name}
            onShowToast={showToast}
            onUpdateLeads={nextLeads => {
              setLeads(nextLeads);
              persistPartialState({ leads: nextLeads });
            }}
            onStateSynced={state => {
              applyServerState(state);
            }}
          />
        );
      case 'meetings':
        return (
          <MeetingsView
            meetingsList={meetings}
            leadsList={leads}
            brandName={brandProfile.name}
            onUpdateMeetings={nextMeetings => {
              setMeetings(nextMeetings);
              persistPartialState({ meetings: nextMeetings });
            }}
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        );
      case 'community':
        return (
          <CommunityView
            onNavigate={handleNavigate}
            onOpenCommand={() => setCommandOpen(true)}
            messagesList={communityMessages}
            onUpdateMessages={nextMsgs => {
              setCommunityMessages(nextMsgs);
              persistPartialState({ communityMessages: nextMsgs });
            }}
            brandName={brandProfile.name}
            onStateSynced={state => {
              applyServerState(state);
            }}
            onShowToast={showToast}
            onSubmitApproval={(newApp: ApprovalItem) => {
              const nextApprovals = [newApp, ...approvals];
              setApprovals(nextApprovals);
              persistPartialState({ approvals: nextApprovals });
              showToast('Submitted reply to Human Approval Gate.');
            }}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            onNavigate={handleNavigate}
            onOpenCommand={() => setCommandOpen(true)}
            pagePosts={pagePosts}
            onUpdatePagePosts={nextPosts => {
              setPagePosts(nextPosts);
              persistPartialState({ pagePosts: nextPosts });
            }}
            leadsList={leads}
            onUpdateLeads={nextLeads => {
              setLeads(nextLeads);
              persistPartialState({ leads: nextLeads });
            }}
            geoScore={geoScore}
            brandProfile={brandProfile}
            onShowToast={showToast}
          />
        );
      case 'approvals':
        return (
          <ApprovalsView
            approvals={approvals}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        );
      case 'automation':
        return (
          <AutomationView
            automationsList={automations}
            onUpdateAutomations={nextAut => {
              setAutomations(nextAut);
              persistPartialState({ automations: nextAut });
            }}
            onStateSynced={state => {
              applyServerState(state);
              showToast('Competitor Radar webhook processed & counter-play queued.');
            }}
          />
        );
      case 'reports':
        return (
          <ReportsView
            reportsList={reports}
            onUpdateReports={nextReps => {
              setReports(nextReps);
              persistPartialState({ reports: nextReps });
            }}
            brandName={brandProfile.name}
            geoScore={geoScore.overallScore}
          />
        );
      case 'integrations':
        return (
          <IntegrationsView
            integrationsList={integrations}
            onUpdateIntegrations={nextInts => {
              setIntegrations(nextInts);
              persistPartialState({ integrations: nextInts });
            }}
            onStateSynced={applyServerState}
            onNavigate={handleNavigate}
            currentUser={currentUser}
          />
        );
      case 'settings':
        return (
          <SettingsView
            brandProfile={brandProfile}
            onUpdateBrandProfile={nextProfile => {
              setBrandProfile(nextProfile);
              persistPartialState({ brandProfile: nextProfile });
              showToast(`Updated workspace brand profile to "${nextProfile.name}".`);
            }}
            onResetWorkspace={handleResetWorkspace}
            currentRole={currentUser.role}
            onSwitchRole={handleSwitchRole}
            onOpenLogin={handleOpenLogin}
            appTheme={appTheme}
            onToggleTheme={handleToggleTheme}
          />
        );
      default:
        return (
          <DashboardView
            agents={agents}
            approvals={approvals}
            campaigns={campaigns}
            socialPosts={socialPosts}
            onNavigate={handleNavigate}
            onOpenCommand={() => setCommandOpen(true)}
            onApproveItem={handleApprove}
          />
        );
    }
  };

  // When authentication or onboarding screen is open, render directly with ZERO dashboard mounting or flicker
  if (isAuthScreenOpen) {
    let hasSavedSession = false;
    try {
      hasSavedSession = Boolean(localStorage.getItem('serpely_authenticated_user'));
    } catch {}

    return (
      <LoginView
        currentRole={currentUser.role}
        initialMode={authInitialMode}
        appTheme={appTheme}
        canCancel={hasSavedSession}
        onToggleTheme={handleToggleTheme}
        onLogin={handleLogin}
        onCancel={handleCloseLogin}
      />
    );
  }

  if (isOnboardingOpen) {
    return (
      <OnboardingView
        user={currentUser}
        brandProfile={brandProfile}
        appTheme={appTheme}
        onToggleTheme={handleToggleTheme}
        onComplete={handleCompleteOnboarding}
        onSkip={handleSkipOnboarding}
      />
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-950 font-sans text-neutral-100 lg:p-3 lg:gap-3">
      {/* Desktop Floating Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <Sidebar
          activeView={activeView}
          onSelectView={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          pendingApprovalsCount={pendingApprovalsCount}
          newLeadsCount={newLeadsCount}
          brandName={brandProfile.name}
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onOpenLogin={handleOpenLogin}
        />
      </div>

      {/* Animated Mobile Drawer Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-sm p-2"
          >
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="relative flex w-72 flex-col h-full"
            >
              <Sidebar
                activeView={activeView}
                onSelectView={v => {
                  handleNavigate(v);
                  setMobileSidebarOpen(false);
                }}
                collapsed={false}
                onToggleCollapse={() => setMobileSidebarOpen(false)}
                pendingApprovalsCount={pendingApprovalsCount}
                newLeadsCount={newLeadsCount}
                brandName={brandProfile.name}
                currentUser={currentUser}
                onSwitchRole={handleSwitchRole}
                onOpenLogin={handleOpenLogin}
              />
            </motion.div>
            <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Framed Bento Workspace Area */}
      <div className="flex flex-1 flex-col overflow-hidden lg:rounded-2xl lg:border lg:border-neutral-800/90 bg-neutral-900/40 shadow-xs">
        <TopBar
          activeView={activeView}
          onOpenCommand={() => setCommandOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onSelectView={handleNavigate}
          pendingApprovalsCount={pendingApprovalsCount}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          brandName={brandProfile.name}
          geoScore={geoScore.overallScore}
          geoDelta={geoScore.change30Days}
          appTheme={appTheme}
          onToggleTheme={handleToggleTheme}
          currentUser={currentUser}
          onSwitchRole={handleSwitchRole}
          onOpenLogin={handleOpenLogin}
          onLogout={handleLogout}
        />

        {/* Viewer Read-Only Notice Bar */}
        {currentUser.role === 'viewer' && (
          <div className="bg-purple-950/70 border-b border-purple-500/30 px-5 py-2 text-xs flex items-center justify-between text-purple-200 shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
              <span>
                <strong>Viewer Authority (Read-Only Analytics):</strong> Workspace modification, ad budget sign-offs, and asset publishing are locked.
              </span>
            </div>
            <button
              onClick={() => handleSwitchRole('owner')}
              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-semibold text-[11px] border border-purple-500/30 transition-colors"
            >
              Switch to Owner (Full Access)
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          {isHydrating ? (
            <div className="w-full p-6 md:p-8">
              <DashboardSkeleton />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] as const }}
                className="w-full p-6 md:p-8"
              >
                <ErrorBoundary fallbackTitle={`Error rendering ${activeView} view`}>
                  {renderActiveView()}
                </ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Global Omnipresent Search Modal (⌘K) */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
        onOpenAskAI={initialPrompt => {
          setSearchOpen(false);
          setCommandOpen(true);
        }}
        brandName={brandProfile.name}
      />

      {/* AI Command Center Slide-out (⌘J) */}
      <CommandCenter
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={handleNavigate}
        brandName={brandProfile.name}
        onStateSynced={state => {
          applyServerState(state);
          showToast('Orchestrator pipeline executed & synced with Approval Gate.');
        }}
        onApproveItem={title => {
          showToast(`Action approved: "${title}" executed.`);
        }}
      />

      {/* Celebratory Spring Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key={toastMessage}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="preserve-theme fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-500/40 bg-neutral-900 px-4 py-3 text-xs font-medium text-emerald-200 shadow-2xl flex items-center gap-2.5"
          >
            <motion.span
              initial={{ scale: 0.4, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shrink-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </motion.span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
