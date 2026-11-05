import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Link2,
  X,
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
  Youtube,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Share2,
  Sliders,
  Film,
  Clock,
  Send,
  Calendar,
  Radio,
  RotateCcw,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  YouTubeVideoProject,
  SocialChannelAccount,
  ViewId,
  ApprovalItem,
  ConnectedSocialPage,
  PageSocialPost,
  BrandProfile,
  SocialPagePlatform,
  ScheduledSocialPost
} from '../../types';
import { AuthUser } from '../../data/rbac-data';
import {
  mockYouTubeVideos,
  mockChannelAccounts,
  mockConnectedSocialPages,
  mockPageSocialPosts,
  mockApprovals
} from '../../data/mock-data';
import { EmptyState } from '../common/EmptyState';
import { ThreadsIcon, BlueskyIcon, TikTokIcon, PinterestIcon } from '../social/SocialPlatformIcons';
import { YouTubeVideoStudio } from '../social/YouTubeVideoStudio';
import { VideoMutationStudio } from '../social/VideoMutationStudio';
import { PlatformSocialWorkspace } from '../social/PlatformSocialWorkspace';
import { OmnipostComposerModal } from '../social/OmnipostComposerModal';

interface SocialViewProps {
  onOpenCommand?: () => void;
  onNavigate?: (view: ViewId) => void;
  onSubmitApproval?: (item: ApprovalItem) => void;
  connectedPages?: ConnectedSocialPage[];
  pagePosts?: PageSocialPost[];
  approvals?: ApprovalItem[];
  socialPosts?: any[];
  onUpdateConnectedPages?: (pages: ConnectedSocialPage[]) => void;
  onUpdatePagePosts?: (posts: PageSocialPost[]) => void;
  onUpdateSocialPosts?: (posts: any[]) => void;
  onApproveItem?: (approvalId: string) => void;
  brandProfile?: BrandProfile;
  currentUser?: AuthUser;
}

type SocialTab =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'x'
  | 'threads'
  | 'bluesky'
  | 'tiktok'
  | 'pinterest'
  | 'youtube'
  | 'mutation';

export const SocialView: React.FC<SocialViewProps> = ({
  onOpenCommand,
  onNavigate,
  onSubmitApproval,
  connectedPages: propConnectedPages,
  pagePosts: propPagePosts,
  approvals: propApprovals,
  onUpdateConnectedPages,
  onUpdatePagePosts,
  onApproveItem,
  brandProfile,
  currentUser
}) => {
  // 6 platform & media workspaces: Facebook, Instagram, LinkedIn, X, YouTube Studio, Mutation Studio
  const [activeTab, setActiveTab] = useState<SocialTab>('facebook');

  // Fallback local state if not controlled by AppShell
  const [localConnectedPages, setLocalConnectedPages] = useState<ConnectedSocialPage[]>(
    mockConnectedSocialPages
  );
  const [localPagePosts, setLocalPagePosts] = useState<PageSocialPost[]>(
    mockPageSocialPosts
  );

  const connectedPages = propConnectedPages || localConnectedPages;
  const pagePosts = propPagePosts || localPagePosts;
  const approvals = propApprovals || mockApprovals;

  const updateConnectedPagesList = (pages: ConnectedSocialPage[]) => {
    if (onUpdateConnectedPages) {
      onUpdateConnectedPages(pages);
    } else {
      setLocalConnectedPages(pages);
    }
  };

  // YouTube video & channel state
  const [videos, setVideos] = useState<YouTubeVideoProject[]>(mockYouTubeVideos);
  const [channels] = useState<SocialChannelAccount[]>(mockChannelAccounts);

  // Notification toast
  const [notification, setNotification] = useState<string | null>(null);
  const [showOmnipostModal, setShowOmnipostModal] = useState<boolean>(false);
  const [connectingLinkedIn, setConnectingLinkedIn] = useState<boolean>(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Check if current user has connected their personal LinkedIn account
  const hasPersonalLinkedIn = connectedPages.some(
    p => p.platform === 'LinkedIn' && p.oauthConnected && p.accountType === 'personal'
  );
  const personalLinkedInAccount = connectedPages.find(
    p => p.platform === 'LinkedIn' && p.oauthConnected && p.accountType === 'personal'
  );

  // 1-Click Connect Personal LinkedIn OAuth flow
  const handleConnectPersonalLinkedIn = async () => {
    setConnectingLinkedIn(true);
    try {
      const userEmail = currentUser?.email || '';
      const endpoint = `/api/auth/linkedin/url?mode=personal&userEmail=${encodeURIComponent(userEmail)}&origin=${encodeURIComponent(window.location.origin)}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (data.url && !data.sandboxMode) {
          const popup = window.open(data.url, 'linkedin_oauth_popup', 'width=620,height=720');
          if (popup) {
            showNotification('Opened LinkedIn OAuth 2.0 window. Please authorize Sincly in the popup...');
            return;
          } else {
            alert('Popup was blocked by your browser. Please allow popups for this site and click again.');
          }
        } else if (data.requiresCredentials) {
          if (onNavigate) onNavigate('integrations');
        }
      }
    } catch (err: any) {
      showNotification(`LinkedIn connection error: ${err.message || 'Check connection'}`);
    } finally {
      setConnectingLinkedIn(false);
    }
  };

  // Listen for OAuth 2.0 popup completion
  useEffect(() => {
    const handleAuthData = (data: any) => {
      if (data?.type === 'OAUTH_AUTH_SUCCESS' && data.provider === 'LinkedIn') {
        showNotification(`🎉 Connected LinkedIn: ${data.pageName || 'Personal Profile'}!`);
        fetch(`/api/state?userEmail=${encodeURIComponent(currentUser?.email || '')}`)
          .then(r => (r.ok ? r.json() : null))
          .then(state => {
            if (state?.connectedPages && onUpdateConnectedPages) {
              onUpdateConnectedPages(state.connectedPages);
            }
          })
          .catch(() => {});
      } else if (data?.type === 'OAUTH_AUTH_ERROR' && data.provider === 'LinkedIn') {
        const errorMsg = data.errorDescription || data.error || 'Authorization rejected';
        showNotification(`⚠️ LinkedIn Error: ${errorMsg}`);
      }
    };

    const handleMessage = (e: MessageEvent) => handleAuthData(e.data);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'serpely_oauth_event' && e.newValue) {
        try {
          handleAuthData(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorage);
    };
  }, [currentUser?.email, onUpdateConnectedPages]);

  // Handle batch publication from Omnipost composer modal
  const handleBatchPublish = (batchPosts: PageSocialPost[], mode: 'publish_now' | 'queue' | 'approval') => {
    const updated = [...batchPosts, ...pagePosts];
    if (onUpdatePagePosts) {
      onUpdatePagePosts(updated);
    } else {
      setLocalPagePosts(updated);
    }

    if (mode === 'approval') {
      batchPosts.forEach(post => {
        if (post.approvalId) {
          handleOpenApproval({
            id: post.approvalId,
            title: `[${post.platform}] ${post.content.slice(0, 48)}...`,
            agent: 'social',
            contentType: 'social-post',
            platform: post.platform,
            riskLevel: 'medium',
            status: 'pending',
            campaign: 'Omnipost Broadcast',
            submittedAt: 'Just now',
            preview: post.content,
            riskReason: `Omnipost staged for ${post.platform} broadcast approval.`
          });
        }
      });
      showNotification(`Staged ${batchPosts.length} post(s) into Approval Gate!`);
    } else if (mode === 'queue') {
      showNotification(`Scheduled ${batchPosts.length} post(s) into smart queue slots!`);
    } else {
      showNotification(`Broadcasted ${batchPosts.length} post(s) across selected channels!`);
    }
  };

  const handleUpdateVideo = (updated: YouTubeVideoProject) => {
    setVideos(prev => prev.map(v => (v.id === updated.id ? updated : v)));
  };

  const handleCreateVideo = (newProj: YouTubeVideoProject) => {
    setVideos(prev => [newProj, ...prev]);
  };

  const handleOpenApproval = (item: ApprovalItem) => {
    if (onSubmitApproval) {
      onSubmitApproval(item);
    }
    try {
      fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      }).catch(() => {});
    } catch {
      // Handled via state
    }
  };

  const handleApprovePagePost =
    onApproveItem ||
    ((id: string) => {
      const updated = pagePosts.map(p =>
        p.approvalId === id || p.id === id
          ? { ...p, status: 'published' as const, publishedAt: 'Just now' }
          : p
      );
      (onUpdatePagePosts || setLocalPagePosts)(updated);
    });

  // Calculate platform post counts
  const facebookPostsCount = pagePosts.filter(p => p.platform === 'Facebook').length;
  const instagramPostsCount = pagePosts.filter(p => p.platform === 'Instagram').length;
  const linkedinPostsCount = pagePosts.filter(p => p.platform === 'LinkedIn').length;
  const xPostsCount = pagePosts.filter(p => p.platform === 'X').length;
  const threadsPostsCount = pagePosts.filter(p => p.platform === 'Threads').length;
  const blueskyPostsCount = pagePosts.filter(p => p.platform === 'Bluesky').length;
  const tiktokPostsCount = pagePosts.filter(p => p.platform === 'TikTok').length;
  const pinterestPostsCount = pagePosts.filter(p => p.platform === 'Pinterest').length;

  const facebookAccountsCount = connectedPages.filter(p => p.platform === 'Facebook' && p.oauthConnected).length;
  const instagramAccountsCount = connectedPages.filter(p => p.platform === 'Instagram' && p.oauthConnected).length;
  const linkedinAccountsCount = connectedPages.filter(p => p.platform === 'LinkedIn' && p.oauthConnected).length;
  const xAccountsCount = connectedPages.filter(p => p.platform === 'X' && p.oauthConnected).length;
  const youtubeAccountsCount = connectedPages.filter(p => p.platform === 'YouTube' && p.oauthConnected).length;
  const threadsAccountsCount = connectedPages.filter(p => p.platform === 'Threads' && p.oauthConnected).length;
  const blueskyAccountsCount = connectedPages.filter(p => p.platform === 'Bluesky' && p.oauthConnected).length;
  const tiktokAccountsCount = connectedPages.filter(p => p.platform === 'TikTok' && p.oauthConnected).length;
  const pinterestAccountsCount = connectedPages.filter(p => p.platform === 'Pinterest' && p.oauthConnected).length;

  // Direct Scheduling Connector Queue State & Polling
  const [scheduledQueue, setScheduledQueue] = useState<ScheduledSocialPost[]>([]);
  const [isDispatchingId, setIsDispatchingId] = useState<string | null>(null);
  const [showQueueDrawer, setShowQueueDrawer] = useState<boolean>(true);

  const fetchScheduledQueue = async () => {
    try {
      const res = await fetch('/api/social/scheduling/queue');
      const data = await res.json();
      if (data?.queue) {
        setScheduledQueue(data.queue);
      }
    } catch {
      // Gracefully handled
    }
  };

  useEffect(() => {
    fetchScheduledQueue();
    const interval = setInterval(fetchScheduledQueue, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleDispatchScheduledNow = async (id: string) => {
    setIsDispatchingId(id);
    try {
      const res = await fetch(`/api/social/scheduling/${id}/dispatch`, { method: 'POST' });
      const data = await res.json();
      if (data?.success) {
        showNotification(`Dispatched post live via ${data.platform || 'Direct Connector'}! URL: ${data.externalPostUrl || 'Feed'}`);
        if (data.pagePosts && onUpdatePagePosts) {
          onUpdatePagePosts(data.pagePosts);
        }
        fetchScheduledQueue();
      } else {
        showNotification(`Dispatch failed: ${data.error || 'Connector error'}`);
      }
    } catch (err: any) {
      showNotification(`Dispatch error: ${err.message}`);
    } finally {
      setIsDispatchingId(null);
    }
  };

  const handleCancelScheduled = async (id: string) => {
    try {
      const res = await fetch(`/api/social/scheduling/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data?.success) {
        showNotification('Scheduled post cancelled successfully.');
        fetchScheduledQueue();
      }
    } catch (err: any) {
      showNotification(`Cancel error: ${err.message}`);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Clean Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Social Media Studio
          </h2>
          <span className="text-xs font-semibold text-emerald-400 tabular-nums">
            {connectedPages.filter(p => p.oauthConnected).length} Connected Account{connectedPages.filter(p => p.oauthConnected).length === 1 ? '' : 's'} · {pagePosts.length} Live Posts · {videos.length} Video Projects
          </span>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Connect Personal LinkedIn 1-Click Button */}
          <button
            onClick={handleConnectPersonalLinkedIn}
            disabled={connectingLinkedIn}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer border ${
              hasPersonalLinkedIn
                ? 'bg-[#0a66c2]/15 hover:bg-[#0a66c2]/25 text-[#70b5f9] border-[#0a66c2]/40 shadow-sm'
                : 'bg-[#0a66c2] hover:bg-[#004182] text-white border-transparent shadow-md shadow-[#0a66c2]/25'
            }`}
            title="Connect your personal LinkedIn profile via secure 1-click OAuth"
          >
            <Linkedin className="h-4 w-4 shrink-0" />
            <span>
              {connectingLinkedIn
                ? 'Connecting...'
                : hasPersonalLinkedIn
                ? `Personal: ${personalLinkedInAccount?.pageName?.replace(' (Personal Profile)', '') || 'Connected'}`
                : 'Connect Personal LinkedIn'}
            </span>
            {hasPersonalLinkedIn && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            )}
          </button>

          {/* Master Unified Omnipost Button (Postiz-Style Multi-Platform Broadcast) */}
          <button
            onClick={() => setShowOmnipostModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 hover:opacity-95 text-neutral-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all shrink-0 active:scale-95"
            title="Compose and broadcast across all 5 social networks simultaneously"
          >
            <Share2 className="h-4 w-4" />
            <span>+ New Omnipost</span>
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('integrations')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-neutral-100 text-xs font-semibold border border-neutral-800 hover:border-neutral-700 transition-all shrink-0 active:scale-95 shadow-sm"
              title="Manage and connect social accounts & AI keys in Integrations"
            >
              <Link2 className="h-4 w-4 text-emerald-400" />
              <span>Integrations</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-emerald-400 font-mono">
                {connectedPages.filter(p => p.oauthConnected).length}
              </span>
            </button>
          )}

          {onOpenCommand && (
            <button
              onClick={onOpenCommand}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-800 transition-colors shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>AI Assistant</span>
            </button>
          )}
        </div>
      </div>

      {/* 1-Click Personal LinkedIn Welcome Banner for logged in users */}
      {!hasPersonalLinkedIn && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0a66c2]/15 via-blue-950/20 to-neutral-900 border border-[#0a66c2]/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-[#0a66c2] text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-[#0a66c2]/30">
              <Linkedin className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <span>Connect your Personal LinkedIn Profile</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold font-mono">
                  1-Click Live OAuth
                </span>
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Publish autonomous executive carousels, thought-leadership posts, and sync comment telemetry directly to your personal LinkedIn feed.
              </p>
            </div>
          </div>
          <button
            onClick={handleConnectPersonalLinkedIn}
            disabled={connectingLinkedIn}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold shadow-md shadow-[#0a66c2]/30 transition-all shrink-0 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Linkedin className="h-3.5 w-3.5" />
            <span>{connectingLinkedIn ? 'Opening...' : 'Connect Now'}</span>
          </button>
        </div>
      )}

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-neutral-400 hover:text-neutral-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* DIRECT SCHEDULING CONNECTORS QUEUE & HEALTH BAR (THREADS, BLUESKY, TIKTOK) */}
      {/* ============================================================== */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clock className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Scheduling Connectors Hub
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                {scheduledQueue.filter(q => q.status === 'scheduled').length} Pending in Queue
              </span>
            </div>
          </div>

          {/* Quick Platform Connector Badges */}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
            <span className={`px-2 py-1 rounded-lg bg-neutral-950 border ${threadsAccountsCount > 0 ? 'border-emerald-500/30 text-emerald-300' : 'border-neutral-800 text-neutral-400'} flex items-center gap-1.5`}>
              <ThreadsIcon className="h-3 w-3" />
              <span>Threads: {threadsAccountsCount > 0 ? 'Connected' : 'Disconnected'}</span>
            </span>
            <span className={`px-2 py-1 rounded-lg bg-neutral-950 border ${blueskyAccountsCount > 0 ? 'border-sky-500/30 text-sky-300' : 'border-neutral-800 text-neutral-400'} flex items-center gap-1.5`}>
              <BlueskyIcon className="h-3 w-3 text-sky-400" />
              <span>Bluesky: {blueskyAccountsCount > 0 ? 'Connected' : 'Disconnected'}</span>
            </span>
            <span className={`px-2 py-1 rounded-lg bg-neutral-950 border ${tiktokAccountsCount > 0 ? 'border-rose-500/30 text-rose-300' : 'border-neutral-800 text-neutral-400'} flex items-center gap-1.5`}>
              <TikTokIcon className="h-3 w-3 text-rose-400" />
              <span>TikTok: {tiktokAccountsCount > 0 ? 'Connected' : 'Disconnected'}</span>
            </span>
            <button
              onClick={() => setShowQueueDrawer(!showQueueDrawer)}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            >
              {showQueueDrawer ? 'Hide Queue' : 'Show Queue'}
            </button>
          </div>
        </div>

        {/* Scheduled Posts Queue Cards */}
        {showQueueDrawer && (
          <div className="pt-2 border-t border-neutral-800/80">
            {scheduledQueue.length === 0 ? (
              <EmptyState
                variant="compact"
                icon={Calendar}
                iconColor="#10b981"
                title="Omnichannel Queue Awaiting Content"
                description="No upcoming broadcasts are scheduled in your connector queue. Use the scheduler or Omnipost to queue upcoming content."
                primaryAction={{
                  label: 'Draft Broadcast',
                  onClick: () => setShowOmnipostModal(true)
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {scheduledQueue.map(item => {
                  const isScheduled = item.status === 'scheduled';
                  const isPublishing = item.status === 'publishing' || isDispatchingId === item.id;
                  const isPublished = item.status === 'published';

                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/90 flex flex-col justify-between gap-2 transition-all hover:border-neutral-700"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            {item.platform === 'Threads' && <ThreadsIcon className="h-3.5 w-3.5 text-white" />}
                            {item.platform === 'Bluesky' && <BlueskyIcon className="h-3.5 w-3.5 text-sky-400" />}
                            {item.platform === 'TikTok' && <TikTokIcon className="h-3.5 w-3.5 text-rose-400" />}
                            {item.platform === 'LinkedIn' && <Linkedin className="h-3.5 w-3.5 text-sky-400" />}
                            {item.platform === 'Facebook' && <Facebook className="h-3.5 w-3.5 text-blue-500" />}
                            {item.platform === 'Instagram' && <Instagram className="h-3.5 w-3.5 text-rose-400" />}
                            {item.platform === 'X' && <Twitter className="h-3.5 w-3.5 text-neutral-300" />}
                            {item.platform === 'YouTube' && <Youtube className="h-3.5 w-3.5 text-rose-500" />}
                            <span>{item.platform}</span>
                            <span className="text-[10px] font-mono text-neutral-400 font-normal">
                              {item.pageHandle || `@${item.pageName}`}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                              isPublished
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : isPublishing
                                ? 'bg-sky-500/20 text-sky-300 animate-pulse'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {isPublishing ? 'Dispatching...' : item.status}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-300 line-clamp-2 font-sans">
                          {item.content}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-neutral-400 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-neutral-500" />
                          <span>{item.scheduledTimeFormatted || item.dayOfWeek}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isScheduled && (
                            <button
                              disabled={Boolean(isDispatchingId)}
                              onClick={() => handleDispatchScheduledNow(item.id)}
                              className="px-2 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-bold text-[10px] flex items-center gap-1 transition-colors"
                              title="Immediately execute connector dispatch"
                            >
                              <Send className="h-2.5 w-2.5" />
                              <span>Dispatch Now</span>
                            </button>
                          )}
                          {isPublished && item.externalPostUrl && (
                            <a
                              href={item.externalPostUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-sky-400 text-[10px] flex items-center gap-1 transition-colors"
                            >
                              <span>View Post</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                          {isScheduled && (
                            <button
                              onClick={() => handleCancelScheduled(item.id)}
                              className="px-1.5 py-1 rounded-md text-neutral-500 hover:text-red-400 transition-colors"
                              title="Cancel scheduled post"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 10 TOP TABS: FACEBOOK · INSTAGRAM · LINKEDIN · X · THREADS · BLUESKY · TIKTOK · PINTEREST · YOUTUBE · MUTATION */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 p-1.5 rounded-2xl bg-neutral-900/90 border border-neutral-800">
        {/* 1. FACEBOOK TAB */}
        <button
          onClick={() => setActiveTab('facebook')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'facebook'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
          }`}
        >
          <Facebook className="h-3.5 w-3.5 text-blue-400" />
          <span>Facebook</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'facebook'
                ? 'bg-blue-800/80 text-blue-100'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {facebookPostsCount || facebookAccountsCount}
          </span>
        </button>

        {/* 2. INSTAGRAM TAB */}
        <button
          onClick={() => setActiveTab('instagram')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'instagram'
              ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-rose-600/25'
              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
          }`}
        >
          <Instagram className="h-3.5 w-3.5 text-rose-400" />
          <span>Instagram</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'instagram'
                ? 'bg-rose-900/80 text-rose-100'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {instagramPostsCount || instagramAccountsCount}
          </span>
        </button>

        {/* 3. LINKEDIN TAB */}
        <button
          onClick={() => setActiveTab('linkedin')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'linkedin'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
          }`}
        >
          <Linkedin className="h-3.5 w-3.5 text-sky-400" />
          <span>LinkedIn</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'linkedin'
                ? 'bg-sky-800/80 text-sky-100'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {linkedinPostsCount || linkedinAccountsCount}
          </span>
        </button>

        {/* 4. X (TWITTER) TAB */}
        <button
          onClick={() => setActiveTab('x')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'x'
              ? 'bg-neutral-800 text-white border border-neutral-600 shadow-lg'
              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
          }`}
        >
          <Twitter className="h-3.5 w-3.5 text-neutral-200" />
          <span>X</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'x'
                ? 'bg-neutral-700 text-neutral-200'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {xPostsCount || xAccountsCount}
          </span>
        </button>

        {/* 5. THREADS (META) TAB */}
        <button
          onClick={() => setActiveTab('threads')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'threads'
              ? 'bg-neutral-800 text-white border border-neutral-500 shadow-lg shadow-neutral-900/40'
              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
          }`}
        >
          <ThreadsIcon className={`h-3.5 w-3.5 ${activeTab === 'threads' ? 'text-white' : 'text-neutral-400'}`} />
          <span>Threads</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'threads'
                ? 'bg-neutral-700 text-white'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {threadsPostsCount || threadsAccountsCount}
          </span>
        </button>

        {/* 6. BLUESKY (ATPROTO) TAB */}
        <button
          onClick={() => setActiveTab('bluesky')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'bluesky'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
          }`}
        >
          <BlueskyIcon className="h-3.5 w-3.5 text-sky-300" />
          <span>Bluesky</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'bluesky'
                ? 'bg-sky-800/80 text-sky-100'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {blueskyPostsCount || blueskyAccountsCount}
          </span>
        </button>

        {/* 7. TIKTOK TAB */}
        <button
          onClick={() => setActiveTab('tiktok')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'tiktok'
              ? 'bg-gradient-to-r from-cyan-600 via-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/25'
              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
          }`}
        >
          <TikTokIcon className="h-3.5 w-3.5 text-rose-300" />
          <span>TikTok</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'tiktok'
                ? 'bg-rose-900/80 text-rose-100'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {tiktokPostsCount || tiktokAccountsCount}
          </span>
        </button>

        {/* 8. PINTEREST TAB */}
        <button
          onClick={() => setActiveTab('pinterest')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'pinterest'
              ? 'bg-rose-700 text-white shadow-lg shadow-rose-700/25'
              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
          }`}
        >
          <PinterestIcon className="h-3.5 w-3.5 text-rose-300" />
          <span>Pinterest</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'pinterest'
                ? 'bg-rose-900/80 text-rose-100'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {pinterestPostsCount || pinterestAccountsCount}
          </span>
        </button>

        {/* 8. YOUTUBE STUDIO TAB */}
        <button
          onClick={() => setActiveTab('youtube')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'youtube'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25'
              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
          }`}
        >
          <Youtube className="h-3.5 w-3.5 text-rose-300" />
          <span>YouTube</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'youtube'
                ? 'bg-rose-800/80 text-rose-100'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {videos.length}
          </span>
        </button>

        {/* 9. VIDEO MUTATION STUDIO TAB */}
        <button
          onClick={() => setActiveTab('mutation')}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'mutation'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/25'
              : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60'
          }`}
        >
          <Sliders className="h-3.5 w-3.5 text-cyan-300" />
          <span>Mutation</span>
          <span
            className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'mutation'
                ? 'bg-cyan-800/80 text-cyan-100'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            Auto
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DEDICATED FACEBOOK WORKSPACE                            */}
      {/* ============================================================== */}
      {activeTab === 'facebook' && (
        <PlatformSocialWorkspace
          platform="Facebook"
          connectedPages={connectedPages}
          pagePosts={pagePosts}
          approvals={approvals}
          brandProfile={brandProfile}
          onUpdateConnectedPages={updateConnectedPagesList}
          onUpdatePagePosts={onUpdatePagePosts || setLocalPagePosts}
          onSubmitApproval={handleOpenApproval}
          onApproveItem={handleApprovePagePost}
          onNavigate={onNavigate}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 2: DEDICATED INSTAGRAM WORKSPACE                           */}
      {/* ============================================================== */}
      {activeTab === 'instagram' && (
        <PlatformSocialWorkspace
          platform="Instagram"
          connectedPages={connectedPages}
          pagePosts={pagePosts}
          approvals={approvals}
          brandProfile={brandProfile}
          onUpdateConnectedPages={updateConnectedPagesList}
          onUpdatePagePosts={onUpdatePagePosts || setLocalPagePosts}
          onSubmitApproval={handleOpenApproval}
          onApproveItem={handleApprovePagePost}
          onNavigate={onNavigate}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 3: DEDICATED LINKEDIN WORKSPACE                            */}
      {/* ============================================================== */}
      {activeTab === 'linkedin' && (
        <PlatformSocialWorkspace
          platform="LinkedIn"
          connectedPages={connectedPages}
          pagePosts={pagePosts}
          approvals={approvals}
          brandProfile={brandProfile}
          onUpdateConnectedPages={updateConnectedPagesList}
          onUpdatePagePosts={onUpdatePagePosts || setLocalPagePosts}
          onSubmitApproval={handleOpenApproval}
          onApproveItem={handleApprovePagePost}
          onNavigate={onNavigate}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 4: DEDICATED X (TWITTER) WORKSPACE                         */}
      {/* ============================================================== */}
      {activeTab === 'x' && (
        <PlatformSocialWorkspace
          platform="X"
          connectedPages={connectedPages}
          pagePosts={pagePosts}
          approvals={approvals}
          brandProfile={brandProfile}
          onUpdateConnectedPages={updateConnectedPagesList}
          onUpdatePagePosts={onUpdatePagePosts || setLocalPagePosts}
          onSubmitApproval={handleOpenApproval}
          onApproveItem={handleApprovePagePost}
          onNavigate={onNavigate}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 5: DEDICATED THREADS (META) WORKSPACE                     */}
      {/* ============================================================== */}
      {activeTab === 'threads' && (
        <PlatformSocialWorkspace
          platform="Threads"
          connectedPages={connectedPages}
          pagePosts={pagePosts}
          approvals={approvals}
          brandProfile={brandProfile}
          onUpdateConnectedPages={updateConnectedPagesList}
          onUpdatePagePosts={onUpdatePagePosts || setLocalPagePosts}
          onSubmitApproval={handleOpenApproval}
          onApproveItem={handleApprovePagePost}
          onNavigate={onNavigate}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 6: DEDICATED BLUESKY (AT PROTOCOL) WORKSPACE               */}
      {/* ============================================================== */}
      {activeTab === 'bluesky' && (
        <PlatformSocialWorkspace
          platform="Bluesky"
          connectedPages={connectedPages}
          pagePosts={pagePosts}
          approvals={approvals}
          brandProfile={brandProfile}
          onUpdateConnectedPages={updateConnectedPagesList}
          onUpdatePagePosts={onUpdatePagePosts || setLocalPagePosts}
          onSubmitApproval={handleOpenApproval}
          onApproveItem={handleApprovePagePost}
          onNavigate={onNavigate}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 7: DEDICATED TIKTOK WORKSPACE                              */}
      {/* ============================================================== */}
      {activeTab === 'tiktok' && (
        <PlatformSocialWorkspace
          platform="TikTok"
          connectedPages={connectedPages}
          pagePosts={pagePosts}
          approvals={approvals}
          brandProfile={brandProfile}
          onUpdateConnectedPages={updateConnectedPagesList}
          onUpdatePagePosts={onUpdatePagePosts || setLocalPagePosts}
          onSubmitApproval={handleOpenApproval}
          onApproveItem={handleApprovePagePost}
          onNavigate={onNavigate}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 8: DEDICATED PINTEREST WORKSPACE                           */}
      {/* ============================================================== */}
      {activeTab === 'pinterest' && (
        <PlatformSocialWorkspace
          platform="Pinterest"
          connectedPages={connectedPages}
          pagePosts={pagePosts}
          approvals={approvals}
          brandProfile={brandProfile}
          onUpdateConnectedPages={updateConnectedPagesList}
          onUpdatePagePosts={onUpdatePagePosts || setLocalPagePosts}
          onSubmitApproval={handleOpenApproval}
          onApproveItem={handleApprovePagePost}
          onNavigate={onNavigate}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 5: DEDICATED YOUTUBE STUDIO                                */}
      {/* ============================================================== */}
      {activeTab === 'youtube' && (
        <YouTubeVideoStudio
          videos={videos}
          channels={channels}
          onUpdateVideo={handleUpdateVideo}
          onCreateVideo={handleCreateVideo}
          onOpenApproval={onSubmitApproval || (() => {})}
          onOpenCommand={onOpenCommand || (() => {})}
        />
      )}

      {/* ============================================================== */}
      {/* TAB 6: DEDICATED VIDEO MUTATION STUDIO                         */}
      {/* ============================================================== */}
      {activeTab === 'mutation' && (
        <VideoMutationStudio videos={videos} />
      )}

      {/* ============================================================== */}
      {/* UNIFIED MULTI-PLATFORM OMNIPOST COMPOSER MODAL (POSTIZ PARITY) */}
      {/* ============================================================== */}
      <OmnipostComposerModal
        isOpen={showOmnipostModal}
        onClose={() => setShowOmnipostModal(false)}
        connectedPages={connectedPages}
        brandProfile={brandProfile}
        onPublishBatch={handleBatchPublish}
        onNavigate={onNavigate}
      />
    </div>
  );
};
