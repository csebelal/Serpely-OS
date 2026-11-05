import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Mail,
  Database,
  Video,
  Share2,
  AlertCircle,
  Lock,
  Info,
  X,
  Trash2,
  Terminal,
  Webhook
} from 'lucide-react';
import { mockIntegrations } from '../../data/mock-data';
import { IntegrationItem, ViewId, ConnectedSocialPage } from '../../types';
import { AuthUser } from '../../data/rbac-data';
import { loginWithFacebookSdk, exchangeFacebookToken } from '../../services/facebook-sdk';
import { McpServerStudio } from '../integrations/McpServerStudio';
import { WebhookHubStudio } from '../integrations/WebhookHubStudio';
import { MessagingStudio } from '../integrations/MessagingStudio';
import { ThreadsIcon, BlueskyIcon, TikTokIcon, SlackIcon, DiscordIcon } from '../social/SocialPlatformIcons';

interface IntegrationsViewProps {
  integrationsList?: IntegrationItem[];
  onUpdateIntegrations?: (integrations: IntegrationItem[]) => void;
  onStateSynced?: (state: any) => void;
  onNavigate?: (view: ViewId) => void;
  currentUser?: AuthUser;
}

type ProviderKey = 'facebook' | 'linkedin' | 'google' | 'hubspot' | 'smtp' | 'gemini' | 'elevenlabs' | 'heygen' | 'threads' | 'bluesky' | 'tiktok';

interface LiveStatusResponse {
  callbackUrls: {
    current: string;
    development: string;
    production: string;
  };
  connectedPages?: ConnectedSocialPage[];
  facebook: {
    configured: boolean;
    mode: 'live' | 'sandbox';
    appIdMasked: string | null;
    hasClientSecret: boolean;
    hasPageToken: boolean;
    connected: boolean;
    pageId: string | null;
    pageName: string | null;
    pageHandle: string | null;
    followersCount: number | null;
    adAccountId: string | null;
    lastSyncedAt: string | null;
  };
  linkedin: {
    configured: boolean;
    mode: 'live' | 'sandbox';
    clientIdMasked: string | null;
    hasClientSecret: boolean;
    hasAccessToken: boolean;
    connected: boolean;
    pageId: string | null;
    authorUrn: string | null;
    pageName: string | null;
    pageHandle: string | null;
    followersCount: number | null;
    lastSyncedAt: string | null;
  };
  google: {
    configured: boolean;
    mode: 'live' | 'sandbox';
    clientIdMasked: string | null;
    hasClientSecret: boolean;
    apiKeyMasked: string | null;
    hasAccessToken: boolean;
    connected: boolean;
    channelId: string | null;
    channelName: string | null;
    channelHandle: string | null;
    subscribersCount: number | null;
    adsCustomerId: string | null;
    lastSyncedAt: string | null;
  };
  hubspot: {
    configured: boolean;
    mode: 'live' | 'sandbox';
    clientIdMasked: string | null;
    hasClientSecret: boolean;
    tokenMasked: string | null;
    connected: boolean;
    portalId: string | null;
    accountName: string | null;
    contactsCount: number | null;
    lastSyncedAt: string | null;
  };
  smtp: {
    configured: boolean;
    mode: 'live' | 'sandbox';
    verified: boolean;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    passMasked: string | null;
    fromName: string;
    fromEmail: string;
    replyTo: string;
    lastVerifiedAt: string | null;
  };
  gemini?: {
    configured: boolean;
    mode: 'live' | 'sandbox';
    apiKeyMasked: string | null;
    connected: boolean;
    lastSyncedAt: string | null;
  };
  elevenlabs?: {
    configured: boolean;
    mode: 'live' | 'sandbox';
    apiKeyMasked: string | null;
    connected: boolean;
    lastSyncedAt: string | null;
  };
  heygen?: {
    configured: boolean;
    mode: 'live' | 'sandbox';
    apiKeyMasked: string | null;
    connected: boolean;
    lastSyncedAt: string | null;
  };
}

const defaultCleanIntegrations: IntegrationItem[] = [
  { id: 'int-gemini', name: 'Google Gemini 2.5 Pro', category: 'ai', status: 'connected', description: 'Core LLM Engine for autonomous marketing orchestration', icon: 'Sparkles', lastSync: 'Active System Engine' },
  { id: 'int-linkedin', name: 'LinkedIn Marketing Platform', category: 'social', status: 'disconnected', description: 'Publish and schedule executive content and company updates', icon: 'Linkedin', lastSync: 'Never' },
  { id: 'int-meta', name: 'Meta (Facebook & Instagram)', category: 'social', status: 'disconnected', description: 'Publish feeds, reels, and stories with Graph API', icon: 'Facebook', lastSync: 'Never' },
  { id: 'int-google', name: 'Google / YouTube & Ads', category: 'analytics', status: 'disconnected', description: 'Track YouTube channel analytics and PPC search campaigns', icon: 'Youtube', lastSync: 'Never' },
  { id: 'int-hubspot', name: 'HubSpot CRM', category: 'crm', status: 'disconnected', description: 'Synchronize leads, contacts, and deal pipelines', icon: 'Layers', lastSync: 'Never' },
  { id: 'int-smtp', name: 'Custom SMTP Mailer', category: 'email', status: 'disconnected', description: 'Send automated email drip campaigns with custom SMTP', icon: 'Mail', lastSync: 'Never' },
  { id: 'int-elevenlabs', name: 'ElevenLabs Voice AI', category: 'ai', status: 'disconnected', description: 'Synthesize studio-quality voiceovers and audio podcasts', icon: 'Mic', lastSync: 'Never' },
  { id: 'int-heygen', name: 'HeyGen Video Avatars', category: 'ai', status: 'disconnected', description: 'Render photorealistic AI spokesperson video avatars', icon: 'Video', lastSync: 'Never' }
];

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  integrationsList = defaultCleanIntegrations,
  onUpdateIntegrations,
  onStateSynced,
  onNavigate,
  currentUser
}) => {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(integrationsList);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [bannerMessage, setBannerMessage] = useState<{
    text: string;
    type: 'success' | 'warning' | 'error';
  } | null>(null);
  const [liveStatus, setLiveStatus] = useState<LiveStatusResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [verifyingProvider, setVerifyingProvider] = useState<string | null>(null);
  const [syncingHubSpot, setSyncingHubSpot] = useState<boolean>(false);

  // Active Credential Modal State
  const [activeModalProvider, setActiveModalProvider] = useState<ProviderKey | null>(null);
  const [isSavingCreds, setIsSavingCreds] = useState<boolean>(false);

  // Form states for modal (OAuth 2.0 App credentials & API keys)
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiImageApiKey, setGeminiImageApiKey] = useState('');
  const [elevenlabsApiKey, setElevenlabsApiKey] = useState('');
  const [heygenApiKey, setHeygenApiKey] = useState('');
  const [fbClientId, setFbClientId] = useState('');
  const [fbClientSecret, setFbClientSecret] = useState('');

  const [liClientId, setLiClientId] = useState('');
  const [liClientSecret, setLiClientSecret] = useState('');
  const [liPersonalClientId, setLiPersonalClientId] = useState('');
  const [liPersonalClientSecret, setLiPersonalClientSecret] = useState('');

  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');

  const [hsClientId, setHsClientId] = useState('');
  const [hsClientSecret, setHsClientSecret] = useState('');

  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('Serpely Growth OS');
  const [smtpFromEmail, setSmtpFromEmail] = useState('');

  // Threads, Bluesky & TikTok Scheduling Connectors States
  const [threadsToken, setThreadsToken] = useState('');
  const [threadsUserId, setThreadsUserId] = useState('');
  const [bskyHandle, setBskyHandle] = useState('techsheba.bsky.social');
  const [bskyAppPassword, setBskyAppPassword] = useState('');
  const [bskyPdsUrl, setBskyPdsUrl] = useState('https://bsky.social');
  const [tiktokToken, setTiktokToken] = useState('');
  const [testingConnector, setTestingConnector] = useState(false);

  const handleTestConnector = async (provider: 'threads' | 'bluesky' | 'tiktok') => {
    setTestingConnector(true);
    try {
      let body: any = {};
      if (provider === 'threads') {
        body = { accessToken: threadsToken, userId: threadsUserId };
      } else if (provider === 'bluesky') {
        body = { identifier: bskyHandle, appPassword: bskyAppPassword, pdsService: bskyPdsUrl };
      } else if (provider === 'tiktok') {
        body = { accessToken: tiktokToken };
      }

      const res = await fetch(`/api/social/connectors/${provider}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.ok) {
        showBanner(`[${data.platform || provider}] ${data.message}`, 'success');
      } else {
        showBanner(`[${data.platform || provider}] ${data.message}`, 'warning');
      }
    } catch (err: any) {
      showBanner(`Connector test failed: ${err.message}`, 'error');
    } finally {
      setTestingConnector(false);
    }
  };

  useEffect(() => {
    setIntegrations(integrationsList);
  }, [integrationsList]);

  const showBanner = (text: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setBannerMessage({ text, type });
    setTimeout(() => {
      setBannerMessage(prev => (prev?.text === text ? null : prev));
    }, 6000);
  };

  const fetchLiveStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/integrations/live-status');
      if (res.ok) {
        const data: LiveStatusResponse = await res.json();
        setLiveStatus(data);
        if (data.smtp) {
          if (data.smtp.host && data.smtp.host !== 'smtp.yourdomain.com') {
            setSmtpHost(data.smtp.host);
          }
          if (data.smtp.port) setSmtpPort(String(data.smtp.port));
          setSmtpSecure(Boolean(data.smtp.secure));
          if (data.smtp.user) setSmtpUser(data.smtp.user);
          if (data.smtp.fromName) setSmtpFromName(data.smtp.fromName);
          if (data.smtp.fromEmail) setSmtpFromEmail(data.smtp.fromEmail);
        }
      }
    } catch {
      // ignore network error
    }
  }, []);

  useEffect(() => {
    fetchLiveStatus();
  }, [fetchLiveStatus]);

  // Listen for OAuth 2.0 Popup completion
  useEffect(() => {
    const handleAuthData = (data: any) => {
      if (data?.type === 'OAUTH_AUTH_SUCCESS') {
        const provider = data.provider || 'Account';
        const pageName = data.pageName || provider;
        showBanner(
          `${provider} (${pageName}) connected live via OAuth 2.0! Exited Dev/Sandbox Mode.`,
          'success'
        );
        fetchLiveStatus();
        fetch('/api/state')
          .then(r => (r.ok ? r.json() : null))
          .then(state => {
            if (state && onStateSynced) onStateSynced(state);
          })
          .catch(() => {});
        setActiveModalProvider(null);
      } else if (data?.type === 'OAUTH_AUTH_ERROR') {
        const provider = data.provider || 'Provider';
        const desc = data.errorDescription || data.error || 'Authentication rejected';
        showBanner(`${provider} connection failed: ${desc}`, 'error');
      }
    };

    const handleMessage = (event: MessageEvent) => {
      handleAuthData(event.data);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'serpely_oauth_event' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          handleAuthData(parsed);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchLiveStatus, onStateSynced]);

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  // Launch OAuth 2.0 Popup for a Provider (with Hybrid JS SDK for Facebook)
  const handleLaunchOAuthPopup = async (
    provider: 'facebook' | 'linkedin' | 'google' | 'hubspot',
    mode: 'personal' | 'company' = 'personal'
  ) => {
    const userEmail = currentUser?.email || '';
    const endpointMap: Record<typeof provider, string> = {
      facebook: '/api/auth/facebook/url',
      linkedin: `/api/auth/linkedin/url?mode=${mode}&userEmail=${encodeURIComponent(userEmail)}`,
      google: '/api/auth/google/url',
      hubspot: '/api/auth/hubspot/url'
    };

    try {
      const sep = endpointMap[provider].includes('?') ? '&' : '?';
      const res = await fetch(
        `${endpointMap[provider]}${sep}origin=${encodeURIComponent(window.location.origin)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.requiresCredentials) {
          setActiveModalProvider(provider);
          showBanner(
            data.message ||
              `Enter your ${provider.toUpperCase()} Client ID & Secret below to launch live OAuth 2.0.`,
            'warning'
          );
          return;
        }

        // For Facebook: Hybrid Meta JS SDK popup first
        if (provider === 'facebook' && data.appId) {
          showBanner('Launching Meta Secure Login dialog...', 'success');
          const sdkRes = await loginWithFacebookSdk(data.appId);
          if (sdkRes.ok && sdkRes.accessToken) {
            showBanner('Authenticating with Meta & scraping pages...', 'success');
            const exchangeRes = await exchangeFacebookToken(sdkRes.accessToken, sdkRes.userID);
            if (exchangeRes.ok) {
              await fetchLiveStatus();
              showBanner(
                `Successfully connected Facebook! Scraped ${exchangeRes.scrapedCount || 1} managed page(s).`,
                'success'
              );
              return;
            }
          }
          if (sdkRes.reason === 'user_cancelled') {
            showBanner('Facebook login was cancelled by user.', 'warning');
            return;
          }
          showBanner('Opening standard OAuth popup window...', 'warning');
        }

        if (data.url && !data.sandboxMode) {
          const popup = window.open(data.url, 'oauth_popup', 'width=640,height=740');
          if (popup) {
            showBanner(
              `Opened ${provider.toUpperCase()} OAuth 2.0 authorization popup. Complete login in the popup window.`,
              'success'
            );
            return;
          } else {
            showBanner(
              'Popup blocked by browser. Please allow popups for this site and click again.',
              'warning'
            );
            return;
          }
        }
      }
    } catch (err: any) {
      showBanner(`OAuth initialization error: ${err?.message || 'Check connection'}`, 'error');
    }
  };

  // Save Credentials & Optionally Launch OAuth Popup immediately
  const handleSaveCredentials = async (
    provider: ProviderKey,
    launchOAuthAfterSave: boolean = false
  ) => {
    setIsSavingCreds(true);
    let configPayload: Record<string, any> = {};

    if (provider === 'gemini') {
      configPayload = {
        apiKey: geminiApiKey.trim() || undefined,
        geminiApiKey: geminiApiKey.trim() || undefined,
        geminiImageApiKey: geminiImageApiKey.trim() || undefined
      };
    } else if (provider === 'elevenlabs') {
      configPayload = {
        apiKey: elevenlabsApiKey.trim() || undefined
      };
    } else if (provider === 'heygen') {
      configPayload = {
        apiKey: heygenApiKey.trim() || undefined
      };
    } else if (provider === 'facebook') {
      configPayload = {
        clientId: fbClientId.trim() || undefined,
        clientSecret: fbClientSecret.trim() || undefined
      };
    } else if (provider === 'linkedin') {
      configPayload = {
        clientId: liClientId.trim() || undefined,
        clientSecret: liClientSecret.trim() || undefined,
        personalClientId: liPersonalClientId.trim() || undefined,
        personalClientSecret: liPersonalClientSecret.trim() || undefined
      };
    } else if (provider === 'google') {
      configPayload = {
        clientId: googleClientId.trim() || undefined,
        clientSecret: googleClientSecret.trim() || undefined
      };
    } else if (provider === 'hubspot') {
      configPayload = {
        clientId: hsClientId.trim() || undefined,
        clientSecret: hsClientSecret.trim() || undefined
      };
    } else if (provider === 'smtp') {
      configPayload = {
        host: smtpHost,
        port: Number(smtpPort || 587),
        secure: smtpSecure || Number(smtpPort) === 465,
        user: smtpUser,
        pass: smtpPass,
        fromName: smtpFromName,
        fromEmail: smtpFromEmail || smtpUser,
        replyTo: smtpFromEmail || smtpUser
      };
    }

    try {
      const res = await fetch('/api/integrations/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, config: configPayload })
      });
      const data = await res.json();
      if (data.liveStatus) setLiveStatus(data.liveStatus);
      if (data.state) {
        if (data.state.integrations) setIntegrations(data.state.integrations);
        if (onStateSynced) onStateSynced(data.state);
      }

      showBanner(
        data.message || `${provider.toUpperCase()} credentials saved.`,
        data.liveVerified ? 'success' : 'warning'
      );

      if (
        launchOAuthAfterSave &&
        (provider === 'facebook' ||
          provider === 'linkedin' ||
          provider === 'google' ||
          provider === 'hubspot')
      ) {
        await handleLaunchOAuthPopup(provider);
      } else if (data.liveVerified) {
        setActiveModalProvider(null);
      }
    } catch (err: any) {
      showBanner(`Failed saving credentials: ${err?.message || 'Error'}`, 'error');
    } finally {
      setIsSavingCreds(false);
    }
  };

  // Remove / Disconnect Provider Credentials and Clean from .env
  const handleRemoveCredentials = async (provider: ProviderKey) => {
    setIsSavingCreds(true);
    try {
      const res = await fetch('/api/integrations/credentials/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();
      if (data.liveStatus) setLiveStatus(data.liveStatus);
      if (data.state) {
        if (data.state.integrations) setIntegrations(data.state.integrations);
        if (onStateSynced) onStateSynced(data.state);
      }
      if (provider === 'gemini') {
        setGeminiApiKey('');
      } else if (provider === 'elevenlabs') {
        setElevenlabsApiKey('');
      } else if (provider === 'heygen') {
        setHeygenApiKey('');
      } else if (provider === 'facebook') {
        setFbClientId('');
        setFbClientSecret('');
      } else if (provider === 'linkedin') {
        setLiClientId('');
        setLiClientSecret('');
        setLiPersonalClientId('');
        setLiPersonalClientSecret('');
      } else if (provider === 'google') {
        setGoogleClientId('');
        setGoogleClientSecret('');
      } else if (provider === 'hubspot') {
        setHsClientId('');
        setHsClientSecret('');
      } else if (provider === 'smtp') {
        setSmtpHost('');
        setSmtpUser('');
        setSmtpPass('');
      }
      showBanner(
        data.message || `${provider.toUpperCase()} credentials removed from .env & database.`,
        'success'
      );
      setActiveModalProvider(null);
    } catch (err: any) {
      showBanner(`Failed to remove credentials: ${err?.message || 'Error'}`, 'error');
    } finally {
      setIsSavingCreds(false);
    }
  };

  // Verify Live API Connection on Demand
  const handleVerifyLive = async (provider: string, itemName?: string) => {
    setVerifyingProvider(provider);
    try {
      const res = await fetch('/api/integrations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await res.json();
      if (data.liveStatus) setLiveStatus(data.liveStatus);

      if (data.requiresCredentials) {
        const provLower = provider.toLowerCase();
        if (provLower.includes('facebook') || provLower.includes('meta')) {
          setActiveModalProvider('facebook');
        } else if (provLower.includes('linkedin')) {
          setActiveModalProvider('linkedin');
        } else if (provLower.includes('youtube') || provLower.includes('google')) {
          setActiveModalProvider('google');
        } else if (provLower.includes('hubspot')) {
          setActiveModalProvider('hubspot');
        } else if (
          provLower.includes('smtp') ||
          provLower.includes('email') ||
          provLower.includes('resend')
        ) {
          setActiveModalProvider('smtp');
        }
        showBanner(data.message, 'warning');
      } else if (data.success) {
        showBanner(data.message || `${itemName || provider} verified live!`, 'success');
      } else {
        showBanner(data.message || `Verification failed for ${itemName || provider}`, 'error');
      }
    } catch (err: any) {
      showBanner(`Verification error: ${err?.message || 'Network error'}`, 'error');
    } finally {
      setVerifyingProvider(null);
    }
  };

  // Switch Active Scraped Page Target
  const handleSelectActivePage = async (pageId: string) => {
    try {
      const res = await fetch('/api/social/pages/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId })
      });
      if (res.ok) {
        const data = await res.json();
        showBanner(`Active target switched to: ${data.activePage?.pageName || 'Selected Page'}`, 'success');
        fetchLiveStatus();
        fetch('/api/state')
          .then(r => (r.ok ? r.json() : null))
          .then(state => {
            if (state && onStateSynced) onStateSynced(state);
          })
          .catch(() => {});
      }
    } catch (err: any) {
      showBanner(`Failed to switch active page: ${err?.message || 'Error'}`, 'error');
    }
  };

  // Sync Contacts from Live HubSpot CRM
  const handleSyncHubSpotContacts = async () => {
    setSyncingHubSpot(true);
    try {
      const res = await fetch('/api/integrations/hubspot-sync', { method: 'POST' });
      const data = await res.json();
      if (data.requiresCredentials) {
        setActiveModalProvider('hubspot');
        showBanner(data.message, 'warning');
      } else if (data.success) {
        if (data.state && onStateSynced) onStateSynced(data.state);
        fetchLiveStatus();
        showBanner(data.message, 'success');
      } else {
        showBanner(data.message || 'HubSpot sync error', 'error');
      }
    } catch (err: any) {
      showBanner(`HubSpot sync failed: ${err?.message || 'Error'}`, 'error');
    } finally {
      setSyncingHubSpot(false);
    }
  };

  const categories = [
    'All',
    'AI Provider',
    'Social',
    'Slack & Discord',
    'Advertising',
    'Analytics',
    'Productivity',
    'Automation',
    'CRM',
    'MCP',
    'Webhook Hub'
  ];

  const filteredIntegrations = integrations.filter(item => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    return true;
  });

  const handleToggleConnection = (item: IntegrationItem) => {
    const nameLower = item.name.toLowerCase();
    // If clicking connect on a priority platform that isn't configured yet, open its live credential modal!
    if (item.status !== 'connected') {
      if (nameLower.includes('facebook') || nameLower.includes('meta')) {
        if (!liveStatus?.facebook?.configured) {
          setActiveModalProvider('facebook');
          return;
        }
      } else if (nameLower.includes('linkedin')) {
        if (!liveStatus?.linkedin?.configured) {
          setActiveModalProvider('linkedin');
          return;
        }
      } else if (nameLower.includes('youtube') || nameLower.includes('google ads')) {
        if (!liveStatus?.google?.configured) {
          setActiveModalProvider('google');
          return;
        }
      } else if (nameLower.includes('hubspot')) {
        if (!liveStatus?.hubspot?.configured) {
          setActiveModalProvider('hubspot');
          return;
        }
      } else if (nameLower.includes('resend') || nameLower.includes('smtp')) {
        if (!liveStatus?.smtp?.configured) {
          setActiveModalProvider('smtp');
          return;
        }
      } else if (nameLower.includes('elevenlabs')) {
        setActiveModalProvider('elevenlabs');
        return;
      } else if (nameLower.includes('heygen')) {
        setActiveModalProvider('heygen');
        return;
      }
    }

    const next = integrations.map(int => {
      if (int.id !== item.id) return int;
      const nextStatus: IntegrationItem['status'] =
        int.status === 'connected' ? 'disconnected' : 'connected';
      return {
        ...int,
        status: nextStatus,
        lastSync: nextStatus === 'connected' ? 'Just now' : int.lastSync
      };
    });
    setIntegrations(next);
    if (onUpdateIntegrations) onUpdateIntegrations(next);
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const mockCount = integrations.filter(i => i.status === 'mock-mode').length;

  const livePlatformsCount = [
    liveStatus?.facebook?.configured,
    liveStatus?.linkedin?.configured,
    liveStatus?.google?.configured,
    liveStatus?.hubspot?.configured,
    liveStatus?.smtp?.configured
  ].filter(Boolean).length;

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Integrations
            </h2>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 tabular-nums">
              {livePlatformsCount}/5 Priority Live Channels Configured · {connectedCount} Active
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCategoryFilter('Webhook Hub')}
            className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-medium flex items-center gap-2 transition-all ${
              categoryFilter === 'Webhook Hub'
                ? 'bg-indigo-600 text-white border-indigo-400 font-bold shadow-lg shadow-indigo-600/25'
                : 'bg-neutral-900 hover:bg-neutral-800 text-indigo-300 border-neutral-700'
            }`}
          >
            <Webhook className="h-3.5 w-3.5" />
            <span>Webhook Hub (n8n · Make · Shopify · WP)</span>
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          </button>

          <button
            onClick={() => setCategoryFilter('MCP')}
            className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-medium flex items-center gap-2 transition-all ${
              categoryFilter === 'MCP'
                ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/20'
                : 'bg-neutral-900 hover:bg-neutral-800 text-emerald-300 border-neutral-700'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Claude & Cursor MCP</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => {
              setActiveModalProvider('facebook');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-500/10"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>+ Connect Live Credentials</span>
          </button>
        </div>
      </div>

      {/* Status Notification Banner */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : bannerMessage.type === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {bannerMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            )}
            <span className="leading-relaxed">{bannerMessage.text}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-neutral-400 hover:text-white shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* PRIORITY LIVE PLATFORMS (ONE-CLICK OAUTH 2.0 & DIRECT TOKENS)     */}
      {/* ================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Connect Priority Live Platforms</span>
          </h3>
          {onNavigate && (
            <button
              onClick={() => onNavigate('social')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Go to Social Publishing Studio →</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* CARD 1: FACEBOOK PAGE & META ADS */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold text-sm flex items-center justify-center">
                    FB
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Facebook Page & Meta Ads</h4>
                    <div className="text-[11px] text-neutral-400">Meta Graph API v19.0 · OAuth 2.0</div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                    liveStatus?.facebook?.mode === 'live'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {liveStatus?.facebook?.mode === 'live' ? 'CONNECTED' : 'NOT CONNECTED'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Connection Status:</span>
                  <span className={`font-semibold ${liveStatus?.facebook?.mode === 'live' ? 'text-emerald-400' : 'text-neutral-400'}`}>
                    {liveStatus?.facebook?.mode === 'live' ? 'Active & Ready' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Connected Page:</span>
                  <span className="font-medium text-white truncate max-w-[190px]">
                    {liveStatus?.facebook?.pageName || 'None (Click Login with Facebook)'}
                  </span>
                </div>

                {/* Scraped Facebook Pages List & Selector */}
                {(() => {
                  const fbPages = (liveStatus?.connectedPages || []).filter(p => p.platform === 'Facebook');
                  if (fbPages.length === 0) return null;
                  return (
                    <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                      <div className="text-[10px] font-mono uppercase text-neutral-400 font-semibold flex items-center justify-between">
                        <span>Scraped Pages ({fbPages.length})</span>
                        <span className="text-emerald-400 font-normal">Click to switch</span>
                      </div>
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {fbPages.map(pg => {
                          const isActive = pg.isSelected || liveStatus?.facebook?.pageId === pg.externalPageId;
                          return (
                            <button
                              key={pg.id}
                              onClick={() => handleSelectActivePage(pg.id)}
                              className={`w-full text-left p-1.5 rounded-lg text-[11px] flex items-center justify-between gap-2 border transition-all ${
                                isActive
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-white font-semibold'
                                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                              }`}
                            >
                              <div className="truncate min-w-0">
                                <span className="truncate block">{pg.pageName}</span>
                                <span className="text-[9px] font-mono text-neutral-400">
                                  {(pg.followersCount || 0).toLocaleString()} followers
                                </span>
                              </div>
                              {isActive ? (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-neutral-950 font-bold shrink-0">
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="text-[9px] text-neutral-400 hover:text-emerald-400 shrink-0">
                                  Select
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-800/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLaunchOAuthPopup('facebook')}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>
                    {liveStatus?.facebook?.mode === 'live'
                      ? 'Re-Authenticate Facebook OAuth'
                      : 'Login with Facebook'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setActiveModalProvider('facebook');
                  }}
                  className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
                  title="Configure Meta App ID & Client Secret"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={() => handleVerifyLive('facebook', 'Facebook Graph API')}
                disabled={verifyingProvider === 'facebook'}
                className="w-full py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw
                  className={`h-3 w-3 text-emerald-400 ${
                    verifyingProvider === 'facebook' ? 'animate-spin' : ''
                  }`}
                />
                <span>Verify Live Graph API Connection</span>
              </button>
            </div>
          </div>

          {/* CARD 2: LINKEDIN COMPANY PAGE & PROFILE */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 flex flex-col justify-between space-y-4 hover:border-sky-500/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-sky-600/20 border border-sky-500/40 text-sky-400 font-bold text-sm flex items-center justify-center">
                    in
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">LinkedIn Page & UGC API</h4>
                    <div className="text-[11px] text-neutral-400">LinkedIn v2 API · OAuth 2.0</div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                    liveStatus?.linkedin?.mode === 'live'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {liveStatus?.linkedin?.mode === 'live' ? 'CONNECTED' : 'NOT CONNECTED'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Connection Status:</span>
                  <span className={`font-semibold ${liveStatus?.linkedin?.mode === 'live' ? 'text-emerald-400' : 'text-neutral-400'}`}>
                    {liveStatus?.linkedin?.mode === 'live' ? 'Active & Ready' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Connected Account:</span>
                  <span className="font-medium text-white truncate max-w-[190px]">
                    {liveStatus?.linkedin?.pageName || 'None (Choose Profile or Page)'}
                  </span>
                </div>

                {/* Scraped LinkedIn Pages List & Selector */}
                {(() => {
                  const liPages = (liveStatus?.connectedPages || []).filter(p => p.platform === 'LinkedIn');
                  if (liPages.length === 0) return null;
                  return (
                    <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                      <div className="text-[10px] font-mono uppercase text-neutral-400 font-semibold flex items-center justify-between">
                        <span>Scraped Accounts ({liPages.length})</span>
                        <span className="text-emerald-400 font-normal">Click to switch</span>
                      </div>
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {liPages.map(pg => {
                          const isActive = pg.isSelected || (liveStatus?.linkedin?.authorUrn === pg.externalPageId || liveStatus?.linkedin?.pageId === pg.externalPageId);
                          return (
                            <button
                              key={pg.id}
                              onClick={() => handleSelectActivePage(pg.id)}
                              className={`w-full text-left p-1.5 rounded-lg text-[11px] flex items-center justify-between gap-2 border transition-all ${
                                isActive
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-white font-semibold'
                                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                              }`}
                            >
                              <div className="truncate min-w-0">
                                <span className="truncate block">{pg.pageName}</span>
                                <span className="text-[9px] font-mono text-neutral-400">
                                  {pg.category || 'Profile'}
                                </span>
                              </div>
                              {isActive ? (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-neutral-950 font-bold shrink-0">
                                  ACTIVE
                                </span>
                              ) : (
                                <span className="text-[9px] text-neutral-400 hover:text-emerald-400 shrink-0">
                                  Select
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-800/80">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleLaunchOAuthPopup('linkedin', 'personal')}
                  className="py-2 px-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  title="Connect your personal LinkedIn profile (w_member_social)"
                >
                  <Share2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Personal Profile</span>
                </button>
                <button
                  onClick={() => handleLaunchOAuthPopup('linkedin', 'company')}
                  className="py-2 px-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-sky-300 border border-neutral-700/80 hover:border-sky-500/50 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Connect LinkedIn Company / Organization Page"
                >
                  <Share2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Company Page</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVerifyLive('linkedin', 'LinkedIn API v2')}
                  disabled={verifyingProvider === 'linkedin'}
                  className="flex-1 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw
                    className={`h-3 w-3 text-emerald-400 ${
                      verifyingProvider === 'linkedin' ? 'animate-spin' : ''
                    }`}
                  />
                  <span>Verify Live Connection</span>
                </button>
                <button
                  onClick={() => {
                    setActiveModalProvider('linkedin');
                  }}
                  className="py-1.5 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
                  title="Configure LinkedIn Client ID & Secret"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* CARD 3: YOUTUBE DATA API v3 & GOOGLE ADS */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 flex flex-col justify-between space-y-4 hover:border-rose-500/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 font-bold text-sm flex items-center justify-center">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">YouTube & Google Ads</h4>
                    <div className="text-[11px] text-neutral-400">YouTube Data API v3 · Google OAuth</div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                    liveStatus?.google?.mode === 'live'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {liveStatus?.google?.mode === 'live' ? 'CONNECTED' : 'NOT CONNECTED'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Connection Status:</span>
                  <span className={`font-semibold ${liveStatus?.google?.mode === 'live' ? 'text-emerald-400' : 'text-neutral-400'}`}>
                    {liveStatus?.google?.mode === 'live' ? 'Active & Ready' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Connected Channel:</span>
                  <span className="font-medium text-white truncate max-w-[170px]">
                    {liveStatus?.google?.channelName || 'None (Click Google OAuth)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-800/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLaunchOAuthPopup('google')}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Google OAuth Popup</span>
                </button>
                <button
                  onClick={() => {
                    setActiveModalProvider('google');
                  }}
                  className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
                  title="Configure Google Cloud OAuth Client ID & Secret"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={() => handleVerifyLive('google', 'YouTube Data API v3')}
                disabled={verifyingProvider === 'google'}
                className="w-full py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw
                  className={`h-3 w-3 text-emerald-400 ${
                    verifyingProvider === 'google' ? 'animate-spin' : ''
                  }`}
                />
                <span>Verify YouTube & Google Ads Live</span>
              </button>
            </div>
          </div>

          {/* CARD 4: HUBSPOT CRM LIVE CONNECTION */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm flex items-center justify-center">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">HubSpot CRM Live</h4>
                    <div className="text-[11px] text-neutral-400">CRM Contacts v3 · Private App / OAuth</div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                    liveStatus?.hubspot?.mode === 'live'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {liveStatus?.hubspot?.mode === 'live' ? 'CONNECTED' : 'NOT CONNECTED'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Connection Status:</span>
                  <span className={`font-semibold ${liveStatus?.hubspot?.mode === 'live' ? 'text-emerald-400' : 'text-neutral-400'}`}>
                    {liveStatus?.hubspot?.mode === 'live' ? 'Active & Synced' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Connected Portal:</span>
                  <span className="font-medium text-white truncate max-w-[170px]">
                    {liveStatus?.hubspot?.accountName || 'None (Click HubSpot OAuth)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-800/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLaunchOAuthPopup('hubspot')}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>HubSpot OAuth 2.0 Popup</span>
                </button>
                <button
                  onClick={() => {
                    setActiveModalProvider('hubspot');
                  }}
                  className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
                  title="Configure HubSpot App Client ID & Secret"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={handleSyncHubSpotContacts}
                disabled={syncingHubSpot}
                className="w-full py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw
                  className={`h-3 w-3 text-emerald-400 ${syncingHubSpot ? 'animate-spin' : ''}`}
                />
                <span>Sync Live Contacts with HubSpot CRM</span>
              </button>
            </div>
          </div>

          {/* CARD 5: BUSINESS EMAIL SMTP SERVER */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all md:col-span-2 lg:col-span-2">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Business Email SMTP Server (Gmail / Google Workspace / Resend / Custom SMTP)
                    </h4>
                    <div className="text-[11px] text-neutral-400">
                      Live Nodemailer TLS Handshake · Powers Email Studio & Lead Sequences
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border self-start sm:self-auto ${
                    liveStatus?.smtp?.mode === 'live'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }`}
                >
                  {liveStatus?.smtp?.mode === 'live' ? 'CONFIGURED' : 'NOT CONFIGURED'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs">
                <div>
                  <div className="text-neutral-400 text-[10px] uppercase">Service Status</div>
                  <div className={`font-semibold mt-0.5 ${liveStatus?.smtp?.mode === 'live' ? 'text-emerald-400' : 'text-neutral-400'}`}>
                    {liveStatus?.smtp?.mode === 'live' ? 'Active & Ready' : 'Disconnected'}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[10px] uppercase">Sender Account</div>
                  <div className="text-white truncate font-medium mt-0.5">
                    {liveStatus?.smtp?.user || 'None configured'}
                  </div>
                </div>
                <div>
                  <div className="text-neutral-400 text-[10px] uppercase">Email Delivery</div>
                  <div className="text-neutral-300 font-medium mt-0.5">
                    {liveStatus?.smtp?.verified
                      ? 'TLS Handshake Verified'
                      : liveStatus?.smtp?.user
                      ? 'Credentials Saved'
                      : 'Setup Required'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-neutral-800/80">
              <button
                onClick={() => setActiveModalProvider('smtp')}
                className="flex-1 py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Configure Live SMTP Host & App Password</span>
              </button>
              <button
                onClick={() => handleVerifyLive('smtp', 'SMTP Email Server')}
                disabled={verifyingProvider === 'smtp'}
                className="py-2 px-4 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 text-emerald-400 ${
                    verifyingProvider === 'smtp' ? 'animate-spin' : ''
                  }`}
                />
                <span>Test Live TLS Handshake</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. ALL ECOSYSTEM INTEGRATIONS DIRECTORY                           */}
      {/* ================================================================= */}
      <div className="pt-4 border-t border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-white">All Ecosystem Connectors</h3>
            <span className="text-xs text-neutral-400">
              ({connectedCount} Connected · {mockCount} Sandbox)
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  categoryFilter === cat
                    ? 'bg-neutral-800 text-emerald-400'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {categoryFilter === 'MCP' ? (
          <McpServerStudio />
        ) : categoryFilter === 'Webhook Hub' ? (
          <WebhookHubStudio onPostQueued={fetchLiveStatus} />
        ) : categoryFilter === 'Slack & Discord' ? (
          <MessagingStudio />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map(int => {
            const nameLower = int.name.toLowerCase();
            const isConfigurable =
              nameLower.includes('gemini') ||
              nameLower.includes('facebook') ||
              nameLower.includes('meta') ||
              nameLower.includes('linkedin') ||
              nameLower.includes('youtube') ||
              nameLower.includes('google') ||
              nameLower.includes('hubspot') ||
              nameLower.includes('resend') ||
              nameLower.includes('smtp') ||
              nameLower.includes('threads') ||
              nameLower.includes('bluesky') ||
              nameLower.includes('bsky') ||
              nameLower.includes('tiktok') ||
              nameLower.includes('n8n') ||
              nameLower.includes('make') ||
              nameLower.includes('shopify') ||
              nameLower.includes('wordpress') ||
              nameLower.includes('webhook');

            return (
              <div
                key={int.id}
                className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4 hover:border-neutral-700 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-medium">
                      <strong className="text-emerald-400">{int.category}</strong> · {int.authMethod}
                    </span>

                    <span
                      className={`text-[10px] uppercase px-2 py-0.5 rounded-md font-bold ${
                        int.status === 'connected'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : int.status === 'mock-mode'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {int.status.replace('-', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{int.name}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                      {int.description}
                    </p>
                    {int.lastSync && (
                      <div className="text-[11px] font-mono text-neutral-500 mt-1">
                        Sync: {int.lastSync}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center gap-2">
                  <button
                    onClick={() => handleVerifyLive(int.name, int.name)}
                    className="flex-1 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="h-3 w-3 text-emerald-400" />
                    <span>Verify</span>
                  </button>
                  {isConfigurable && (
                    <>
                      <button
                        onClick={() => {
                          if (nameLower.includes('n8n') || nameLower.includes('make') || nameLower.includes('shopify') || nameLower.includes('wordpress') || nameLower.includes('webhook')) {
                            setCategoryFilter('Webhook Hub');
                          } else if (nameLower.includes('gemini')) {
                            setActiveModalProvider('gemini');
                          } else if (nameLower.includes('threads')) {
                            setActiveModalProvider('threads');
                          } else if (nameLower.includes('bluesky') || nameLower.includes('bsky')) {
                            setActiveModalProvider('bluesky');
                          } else if (nameLower.includes('tiktok')) {
                            setActiveModalProvider('tiktok');
                          } else if (nameLower.includes('facebook') || nameLower.includes('meta')) {
                            setActiveModalProvider('facebook');
                          } else if (nameLower.includes('linkedin')) {
                            setActiveModalProvider('linkedin');
                          } else if (nameLower.includes('youtube') || nameLower.includes('google')) {
                            setActiveModalProvider('google');
                          } else if (nameLower.includes('hubspot')) {
                            setActiveModalProvider('hubspot');
                          } else {
                            setActiveModalProvider('smtp');
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-emerald-400 text-xs font-semibold flex items-center gap-1"
                        title="Configure Live Credentials"
                      >
                        <KeyRound className="h-3 w-3" />
                        <span>Keys</span>
                      </button>

                      {int.status === 'connected' && (
                        <button
                          onClick={() => {
                            let prov: ProviderKey = 'facebook';
                            if (nameLower.includes('gemini')) prov = 'gemini';
                            else if (nameLower.includes('linkedin')) prov = 'linkedin';
                            else if (nameLower.includes('youtube') || nameLower.includes('google')) prov = 'google';
                            else if (nameLower.includes('hubspot')) prov = 'hubspot';
                            else if (nameLower.includes('smtp') || nameLower.includes('email') || nameLower.includes('resend')) prov = 'smtp';
                            if (window.confirm(`Remove ${prov.toUpperCase()} credentials from .env and disconnect?`)) {
                              handleRemoveCredentials(prov);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-neutral-900 hover:bg-red-500/10 border border-neutral-800 hover:border-red-500/30 text-neutral-400 hover:text-red-400 transition-colors"
                          title="Remove Credentials & Disconnect"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => handleToggleConnection(int)}
                    className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                    title={int.status === 'connected' ? 'Disconnect' : 'Connect'}
                  >
                    {int.status === 'connected' ? (
                      <ToggleRight className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-neutral-500" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

      {/* ================================================================= */}
      {/* LIVE CREDENTIAL VAULT & OAUTH 2.0 SETUP MODAL                     */}
      {/* ================================================================= */}
      {activeModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-5 shadow-2xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {activeModalProvider === 'gemini' &&
                      'Connect Live Google Gemini API Key'}
                    {activeModalProvider === 'elevenlabs' &&
                      'Connect Live ElevenLabs Voice AI Credentials'}
                    {activeModalProvider === 'heygen' &&
                      'Connect Live HeyGen AI Avatar Video Credentials'}
                    {activeModalProvider === 'facebook' &&
                      'Connect Live Facebook Page & Meta Ads Credentials'}
                    {activeModalProvider === 'linkedin' &&
                      'Connect Live LinkedIn Company Page & Profile Credentials'}
                    {activeModalProvider === 'google' &&
                      'Connect Live YouTube Data API v3 & Google Ads Credentials'}
                    {activeModalProvider === 'hubspot' &&
                      'Connect Live HubSpot CRM Credentials'}
                    {activeModalProvider === 'smtp' &&
                      'Configure Live Business Email SMTP Server'}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Stored securely in your workspace SQL database. Exits Sandbox / Dev Mode immediately.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalProvider(null)}
                className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Provider Switcher Pills inside Modal */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
              {(
                [
                  { id: 'gemini', label: 'Google Gemini AI' },
                  { id: 'elevenlabs', label: 'ElevenLabs (Voice TTS)' },
                  { id: 'heygen', label: 'HeyGen (AI Avatar)' },
                  { id: 'facebook', label: 'Facebook / Meta' },
                  { id: 'linkedin', label: 'LinkedIn Page' },
                  { id: 'google', label: 'YouTube & Google Ads' },
                  { id: 'hubspot', label: 'HubSpot CRM' },
                  { id: 'smtp', label: 'SMTP Email' }
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveModalProvider(tab.id)}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-colors ${
                    activeModalProvider === tab.id
                      ? 'bg-emerald-500 text-neutral-950'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Callback URL Copy Bar (For OAuth Providers) */}
            {activeModalProvider !== 'smtp' && activeModalProvider !== 'gemini' && activeModalProvider !== 'elevenlabs' && activeModalProvider !== 'heygen' && (
              <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-400">
                    OAuth 2.0 Redirect / Callback URL (Paste in Developer Portal):
                  </span>
                  <button
                    onClick={() =>
                      handleCopyText(
                        `${window.location.origin}/auth/callback`,
                        'modal-callback'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-[11px] flex items-center gap-1"
                  >
                    {copiedKey === 'modal-callback' ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Callback URL</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-neutral-300 bg-neutral-950 p-2 rounded border border-neutral-800 select-all truncate">
                  {window.location.origin}/auth/callback
                </div>
              </div>
            )}

            {/* 0. GEMINI FORM */}
            {activeModalProvider === 'gemini' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Primary Google Gemini API Key (Text & Multi-Agent)
                    </label>
                    <input
                      type="password"
                      value={geminiApiKey}
                      onChange={e => setGeminiApiKey(e.target.value)}
                      placeholder={liveStatus?.gemini?.configured ? '•••••••••••••••••••••••• (Configured in .env)' : 'Paste Gemini API Key (e.g. AIzaSy...)'}
                      className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between text-neutral-400 text-[11px] pt-1">
                    <span>Powers AI Studio, post copy generation, research, and captions.</span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Get API Key</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-purple-500/30 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-purple-300 font-semibold">
                        Gemini Dedicated Image API Key (AI Image Studio)
                      </label>
                      <span className="text-[10px] text-purple-400 font-mono">GEMINI_IMAGE_API_KEY</span>
                    </div>
                    <input
                      type="password"
                      value={geminiImageApiKey}
                      onChange={e => setGeminiImageApiKey(e.target.value)}
                      placeholder="Paste dedicated Gemini Image API Key (keeps image quota separate)"
                      className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="text-neutral-400 text-[11px]">
                    Dedicated key exclusively used for generating creative AI images from post captions without draining text quota.
                  </div>
                </div>
              </div>
            )}

            {/* 6. THREADS FORM */}
            {activeModalProvider === 'threads' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-neutral-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <ThreadsIcon className="h-4 w-4" />
                    <span>Meta Threads Direct Scheduling Connector</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Connects directly to Meta's Threads Graph API v1.0. Allows automated container creation, scheduled post queues, and media publishing.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Threads User Access Token
                    </label>
                    <input
                      type="password"
                      value={threadsToken}
                      onChange={e => setThreadsToken(e.target.value)}
                      placeholder="THQ... or Meta User Access Token with threads_content_publish"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Threads User ID (optional)
                    </label>
                    <input
                      type="text"
                      value={threadsUserId}
                      onChange={e => setThreadsUserId(e.target.value)}
                      placeholder="e.g. 17841400000000000 or leave blank for 'me'"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={testingConnector}
                    onClick={() => handleTestConnector('threads')}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${testingConnector ? 'animate-spin' : ''}`} />
                    <span>Test & Verify Threads Connector</span>
                  </button>
                </div>
              </div>
            )}

            {/* 7. BLUESKY FORM */}
            {activeModalProvider === 'bluesky' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-800/40 text-sky-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <BlueskyIcon className="h-4 w-4 text-sky-400" />
                    <span>Bluesky AT Protocol (XRPC) Scheduling Connector</span>
                  </div>
                  <p className="text-[11px] text-sky-300/80">
                    Connects directly to the decentralized Authenticated Transfer (AT) Protocol. Auto-generates UTF-8 rich-text link & hashtag facets for chronological and algorithmic feeds.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Bluesky Handle / Identifier
                    </label>
                    <input
                      type="text"
                      value={bskyHandle}
                      onChange={e => setBskyHandle(e.target.value)}
                      placeholder="e.g. techsheba.bsky.social"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      App Password (com.atproto.server.createSession)
                    </label>
                    <input
                      type="password"
                      value={bskyAppPassword}
                      onChange={e => setBskyAppPassword(e.target.value)}
                      placeholder="xxxx-xxxx-xxxx-xxxx (Generate in Settings -> App Passwords)"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      PDS Service URL
                    </label>
                    <input
                      type="text"
                      value={bskyPdsUrl}
                      onChange={e => setBskyPdsUrl(e.target.value)}
                      placeholder="https://bsky.social"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={testingConnector}
                    onClick={() => handleTestConnector('bluesky')}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-sky-400 ${testingConnector ? 'animate-spin' : ''}`} />
                    <span>Test & Verify ATProto Connector</span>
                  </button>
                </div>
              </div>
            )}

            {/* 8. TIKTOK FORM */}
            {activeModalProvider === 'tiktok' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 text-rose-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <TikTokIcon className="h-4 w-4 text-rose-400" />
                    <span>TikTok Content Posting API v2 Scheduling Connector</span>
                  </div>
                  <p className="text-[11px] text-rose-300/80">
                    Connects to TikTok's Direct Post API. Schedules short-form viral videos, mutations, and scripts directly to creator profiles.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      TikTok Creator Access Token
                    </label>
                    <input
                      type="password"
                      value={tiktokToken}
                      onChange={e => setTiktokToken(e.target.value)}
                      placeholder="act.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={testingConnector}
                    onClick={() => handleTestConnector('tiktok')}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-rose-400 ${testingConnector ? 'animate-spin' : ''}`} />
                    <span>Test & Verify TikTok Connector</span>
                  </button>
                </div>
              </div>
            )}

            {/* ELEVENLABS FORM */}
            {activeModalProvider === 'elevenlabs' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      ElevenLabs API Key (ELEVENLABS_API_KEY)
                    </label>
                    <input
                      type="password"
                      value={elevenlabsApiKey}
                      onChange={e => setElevenlabsApiKey(e.target.value)}
                      placeholder={liveStatus?.elevenlabs?.configured ? '•••••••••••••••••••••••• (Configured in .env)' : 'Paste your ElevenLabs API Key (sk_...)'}
                      className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between text-neutral-400 text-[11px] pt-1">
                    <span>Powers AI Voiceover narration in YouTube Studio & Video Mutation Studio.</span>
                    <a
                      href="https://elevenlabs.io/app/settings/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Get ElevenLabs Key</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-2">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Curated Voice Models:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['Adam (Host)', 'Rachel (Executive)', 'Antoni (Dynamic)', 'Bella (Storyteller)', 'Arnold (Analyst)', 'Josh (Founder)'].map(v => (
                      <div key={v} className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[11px] flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. THREADS FORM */}
            {activeModalProvider === 'threads' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-neutral-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <ThreadsIcon className="h-4 w-4" />
                    <span>Meta Threads Direct Scheduling Connector</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Connects directly to Meta's Threads Graph API v1.0. Allows automated container creation, scheduled post queues, and media publishing.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Threads User Access Token
                    </label>
                    <input
                      type="password"
                      value={threadsToken}
                      onChange={e => setThreadsToken(e.target.value)}
                      placeholder="THQ... or Meta User Access Token with threads_content_publish"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Threads User ID (optional)
                    </label>
                    <input
                      type="text"
                      value={threadsUserId}
                      onChange={e => setThreadsUserId(e.target.value)}
                      placeholder="e.g. 17841400000000000 or leave blank for 'me'"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={testingConnector}
                    onClick={() => handleTestConnector('threads')}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${testingConnector ? 'animate-spin' : ''}`} />
                    <span>Test & Verify Threads Connector</span>
                  </button>
                </div>
              </div>
            )}

            {/* 7. BLUESKY FORM */}
            {activeModalProvider === 'bluesky' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-800/40 text-sky-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <BlueskyIcon className="h-4 w-4 text-sky-400" />
                    <span>Bluesky AT Protocol (XRPC) Scheduling Connector</span>
                  </div>
                  <p className="text-[11px] text-sky-300/80">
                    Connects directly to the decentralized Authenticated Transfer (AT) Protocol. Auto-generates UTF-8 rich-text link & hashtag facets for chronological and algorithmic feeds.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Bluesky Handle / Identifier
                    </label>
                    <input
                      type="text"
                      value={bskyHandle}
                      onChange={e => setBskyHandle(e.target.value)}
                      placeholder="e.g. techsheba.bsky.social"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      App Password (com.atproto.server.createSession)
                    </label>
                    <input
                      type="password"
                      value={bskyAppPassword}
                      onChange={e => setBskyAppPassword(e.target.value)}
                      placeholder="xxxx-xxxx-xxxx-xxxx (Generate in Settings -> App Passwords)"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      PDS Service URL
                    </label>
                    <input
                      type="text"
                      value={bskyPdsUrl}
                      onChange={e => setBskyPdsUrl(e.target.value)}
                      placeholder="https://bsky.social"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={testingConnector}
                    onClick={() => handleTestConnector('bluesky')}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-sky-400 ${testingConnector ? 'animate-spin' : ''}`} />
                    <span>Test & Verify ATProto Connector</span>
                  </button>
                </div>
              </div>
            )}

            {/* 8. TIKTOK FORM */}
            {activeModalProvider === 'tiktok' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 text-rose-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <TikTokIcon className="h-4 w-4 text-rose-400" />
                    <span>TikTok Content Posting API v2 Scheduling Connector</span>
                  </div>
                  <p className="text-[11px] text-rose-300/80">
                    Connects to TikTok's Direct Post API. Schedules short-form viral videos, mutations, and scripts directly to creator profiles.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      TikTok Creator Access Token
                    </label>
                    <input
                      type="password"
                      value={tiktokToken}
                      onChange={e => setTiktokToken(e.target.value)}
                      placeholder="act.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={testingConnector}
                    onClick={() => handleTestConnector('tiktok')}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-rose-400 ${testingConnector ? 'animate-spin' : ''}`} />
                    <span>Test & Verify TikTok Connector</span>
                  </button>
                </div>
              </div>
            )}

            {/* HEYGEN FORM */}
            {activeModalProvider === 'heygen' && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      HeyGen API Key (HEYGEN_API_KEY)
                    </label>
                    <input
                      type="password"
                      value={heygenApiKey}
                      onChange={e => setHeygenApiKey(e.target.value)}
                      placeholder={liveStatus?.heygen?.configured ? '•••••••••••••••••••••••• (Configured in .env)' : 'Paste your HeyGen API Key'}
                      className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between text-neutral-400 text-[11px] pt-1">
                    <span>Powers AI Face-Avatar video rendering with neural lip-sync and studio backdrops.</span>
                    <a
                      href="https://app.heygen.com/settings?nav=API"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Get HeyGen Key</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-2">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Curated Neural Avatars:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['Tyler (Executive)', 'Angela (Anchor)', 'Dexter (Educator)', 'Monica (B2B)', 'Ethan (Founder)'].map(a => (
                      <div key={a} className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[11px] flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. THREADS FORM */}
            {activeModalProvider === 'threads' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-neutral-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <ThreadsIcon className="h-4 w-4" />
                    <span>Meta Threads Direct Scheduling Connector</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Connects directly to Meta's Threads Graph API v1.0. Allows automated container creation, scheduled post queues, and media publishing.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Threads User Access Token
                    </label>
                    <input
                      type="password"
                      value={threadsToken}
                      onChange={e => setThreadsToken(e.target.value)}
                      placeholder="THQ... or Meta User Access Token with threads_content_publish"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Threads User ID (optional)
                    </label>
                    <input
                      type="text"
                      value={threadsUserId}
                      onChange={e => setThreadsUserId(e.target.value)}
                      placeholder="e.g. 17841400000000000 or leave blank for 'me'"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={testingConnector}
                    onClick={() => handleTestConnector('threads')}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${testingConnector ? 'animate-spin' : ''}`} />
                    <span>Test & Verify Threads Connector</span>
                  </button>
                </div>
              </div>
            )}

            {/* 7. BLUESKY FORM */}
            {activeModalProvider === 'bluesky' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-800/40 text-sky-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <BlueskyIcon className="h-4 w-4 text-sky-400" />
                    <span>Bluesky AT Protocol (XRPC) Scheduling Connector</span>
                  </div>
                  <p className="text-[11px] text-sky-300/80">
                    Connects directly to the decentralized Authenticated Transfer (AT) Protocol. Auto-generates UTF-8 rich-text link & hashtag facets for chronological and algorithmic feeds.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Bluesky Handle / Identifier
                    </label>
                    <input
                      type="text"
                      value={bskyHandle}
                      onChange={e => setBskyHandle(e.target.value)}
                      placeholder="e.g. techsheba.bsky.social"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      App Password (com.atproto.server.createSession)
                    </label>
                    <input
                      type="password"
                      value={bskyAppPassword}
                      onChange={e => setBskyAppPassword(e.target.value)}
                      placeholder="xxxx-xxxx-xxxx-xxxx (Generate in Settings -> App Passwords)"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      PDS Service URL
                    </label>
                    <input
                      type="text"
                      value={bskyPdsUrl}
                      onChange={e => setBskyPdsUrl(e.target.value)}
                      placeholder="https://bsky.social"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={testingConnector}
                    onClick={() => handleTestConnector('bluesky')}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-sky-400 ${testingConnector ? 'animate-spin' : ''}`} />
                    <span>Test & Verify ATProto Connector</span>
                  </button>
                </div>
              </div>
            )}

            {/* 8. TIKTOK FORM */}
            {activeModalProvider === 'tiktok' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 text-rose-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <TikTokIcon className="h-4 w-4 text-rose-400" />
                    <span>TikTok Content Posting API v2 Scheduling Connector</span>
                  </div>
                  <p className="text-[11px] text-rose-300/80">
                    Connects to TikTok's Direct Post API. Schedules short-form viral videos, mutations, and scripts directly to creator profiles.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      TikTok Creator Access Token
                    </label>
                    <input
                      type="password"
                      value={tiktokToken}
                      onChange={e => setTiktokToken(e.target.value)}
                      placeholder="act.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={testingConnector}
                    onClick={() => handleTestConnector('tiktok')}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-rose-400 ${testingConnector ? 'animate-spin' : ''}`} />
                    <span>Test & Verify TikTok Connector</span>
                  </button>
                </div>
              </div>
            )}

            {/* 1. FACEBOOK FORM */}
            {activeModalProvider === 'facebook' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Meta App ID (Client ID)
                    </label>
                    <input
                      type="text"
                      value={fbClientId}
                      onChange={e => setFbClientId(e.target.value)}
                      placeholder={
                        liveStatus?.facebook?.appIdMasked || 'e.g. 1825154928198680'
                      }
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Meta App Secret (Client Secret)
                    </label>
                    <input
                      type="password"
                      value={fbClientSecret}
                      onChange={e => setFbClientSecret(e.target.value)}
                      placeholder={
                        liveStatus?.facebook?.hasClientSecret
                          ? '•••••••••••••••• (Saved)'
                          : 'Enter Meta App Secret from Basic Settings'
                      }
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Find these in <span className="text-neutral-200">developers.facebook.com</span> → App Dashboard → App Settings → Basic. Add the Redirect URI above under Facebook Login → Settings.
                  </p>
                </div>
              </div>
            )}

            {/* 2. LINKEDIN FORM */}
            {activeModalProvider === 'linkedin' && (
              <div className="space-y-4 text-xs">
                {/* LinkedIn Policy Explanatory Callout */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <span>💡 LinkedIn Platform Policy Note</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    LinkedIn does not allow <strong>Community Management API</strong> (Company Pages) and <strong>Share on LinkedIn</strong> (Personal Profiles) on the same app. For personal profiles, simply create a 2nd free app on <a href="https://www.linkedin.com/developers/apps/new" target="_blank" rel="noreferrer" className="text-cyan-400 font-bold underline hover:text-cyan-300">LinkedIn Developers</a> with <strong>Share on LinkedIn</strong> enabled!
                  </p>
                </div>

                {/* Section A: Company / Organization App */}
                <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-200 text-xs">1. Company Page App (Community Management API)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">Company Pages</span>
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] font-medium mb-1">
                      Company App Client ID
                    </label>
                    <input
                      type="text"
                      value={liClientId}
                      onChange={e => setLiClientId(e.target.value)}
                      placeholder={
                        liveStatus?.linkedin?.clientIdMasked || 'e.g. 8646lnb8jy77gv'
                      }
                      className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] font-medium mb-1">
                      Company App Client Secret
                    </label>
                    <input
                      type="password"
                      value={liClientSecret}
                      onChange={e => setLiClientSecret(e.target.value)}
                      placeholder={
                        liveStatus?.linkedin?.hasClientSecret
                          ? '•••••••••••••••• (Saved)'
                          : 'WPL_AP1.xxxxxxxxxxxx'
                      }
                      className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Section B: Personal Profile App */}
                <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-400 text-xs">2. Personal Profile App (Share on LinkedIn + OpenID)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">Personal Profiles</span>
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] font-medium mb-1">
                      Personal App Client ID (From your 2nd LinkedIn App)
                    </label>
                    <input
                      type="text"
                      value={liPersonalClientId}
                      onChange={e => setLiPersonalClientId(e.target.value)}
                      placeholder={
                        liveStatus?.linkedin?.personalClientIdMasked || 'e.g. 86xxxxxxxxxxxx'
                      }
                      className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[11px] font-medium mb-1">
                      Personal App Client Secret
                    </label>
                    <input
                      type="password"
                      value={liPersonalClientSecret}
                      onChange={e => setLiPersonalClientSecret(e.target.value)}
                      placeholder={
                        liveStatus?.linkedin?.hasPersonalClientSecret
                          ? '•••••••••••••••• (Saved)'
                          : 'WPL_AP1.xxxxxxxxxxxx'
                      }
                      className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Add redirect URL in your 2nd app: <code className="text-cyan-400 bg-neutral-950 px-1.5 py-0.5 rounded">{liveStatus?.callbackUrls?.current || `${window.location.origin}/auth/callback`}</code>
                  </p>
                </div>
              </div>
            )}

            {/* 3. GOOGLE / YOUTUBE & GOOGLE ADS FORM */}
            {activeModalProvider === 'google' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Google Cloud OAuth 2.0 Client ID
                    </label>
                    <input
                      type="text"
                      value={googleClientId}
                      onChange={e => setGoogleClientId(e.target.value)}
                      placeholder={
                        liveStatus?.google?.clientIdMasked ||
                        '123456789-abcdef.apps.googleusercontent.com'
                      }
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Google Cloud OAuth 2.0 Client Secret
                    </label>
                    <input
                      type="password"
                      value={googleClientSecret}
                      onChange={e => setGoogleClientSecret(e.target.value)}
                      placeholder={
                        liveStatus?.google?.hasClientSecret
                          ? '•••••••••••••••• (Saved)'
                          : 'GOCSPX-xxxxxxxxxxxxxxxx'
                      }
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Find these in <span className="text-neutral-200">console.cloud.google.com</span> → APIs & Services → Credentials → OAuth 2.0 Client IDs.
                  </p>
                </div>
              </div>
            )}

            {/* 4. HUBSPOT CRM FORM */}
            {activeModalProvider === 'hubspot' && (
              <div className="space-y-4 text-xs">
                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      HubSpot App Client ID
                    </label>
                    <input
                      type="text"
                      value={hsClientId}
                      onChange={e => setHsClientId(e.target.value)}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      HubSpot App Client Secret
                    </label>
                    <input
                      type="password"
                      value={hsClientSecret}
                      onChange={e => setHsClientSecret(e.target.value)}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Find these in <span className="text-neutral-200">app.hubspot.com/developer</span> → Manage Apps → Auth tab. Add the Redirect URI above.
                  </p>
                </div>
              </div>
            )}

            {/* 5. BUSINESS EMAIL SMTP FORM */}
            {activeModalProvider === 'smtp' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-neutral-300 font-semibold mb-1">
                      SMTP Host (e.g. smtp.gmail.com, smtp.resend.com, smtp.office365.com)
                    </label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={e => setSmtpHost(e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      SMTP Port (587 or 465)
                    </label>
                    <input
                      type="number"
                      value={smtpPort}
                      onChange={e => setSmtpPort(e.target.value)}
                      placeholder="587"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      SMTP Username / Business Email
                    </label>
                    <input
                      type="email"
                      value={smtpUser}
                      onChange={e => setSmtpUser(e.target.value)}
                      placeholder="csebelal9@gmail.com"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      SMTP Password / Google 16-Digit App Password
                    </label>
                    <input
                      type="password"
                      value={smtpPass}
                      onChange={e => setSmtpPass(e.target.value)}
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Sender Display Name
                    </label>
                    <input
                      type="text"
                      value={smtpFromName}
                      onChange={e => setSmtpFromName(e.target.value)}
                      placeholder="Serpely Growth Team"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      From Email Address
                    </label>
                    <input
                      type="email"
                      value={smtpFromEmail}
                      onChange={e => setSmtpFromEmail(e.target.value)}
                      placeholder={smtpUser || 'hello@yourdomain.com'}
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. THREADS FORM */}
            {activeModalProvider === 'threads' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-neutral-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <ThreadsIcon className="h-4 w-4" />
                    <span>Meta Threads Direct Scheduling Connector</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Connects directly to Meta's Threads Graph API v1.0. Allows automated container creation, scheduled post queues, and media publishing.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Threads User Access Token
                    </label>
                    <input
                      type="password"
                      value={threadsToken}
                      onChange={e => setThreadsToken(e.target.value)}
                      placeholder="THQ... or Meta User Access Token with threads_content_publish"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Threads User ID (optional)
                    </label>
                    <input
                      type="text"
                      value={threadsUserId}
                      onChange={e => setThreadsUserId(e.target.value)}
                      placeholder="e.g. 17841400000000000 or leave blank for 'me'"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={testingConnector}
                    onClick={() => handleTestConnector('threads')}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${testingConnector ? 'animate-spin' : ''}`} />
                    <span>Test & Verify Threads Connector</span>
                  </button>
                </div>
              </div>
            )}

            {/* 7. BLUESKY FORM */}
            {activeModalProvider === 'bluesky' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-800/40 text-sky-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <BlueskyIcon className="h-4 w-4 text-sky-400" />
                    <span>Bluesky AT Protocol (XRPC) Scheduling Connector</span>
                  </div>
                  <p className="text-[11px] text-sky-300/80">
                    Connects directly to the decentralized Authenticated Transfer (AT) Protocol. Auto-generates UTF-8 rich-text link & hashtag facets for chronological and algorithmic feeds.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      Bluesky Handle / Identifier
                    </label>
                    <input
                      type="text"
                      value={bskyHandle}
                      onChange={e => setBskyHandle(e.target.value)}
                      placeholder="e.g. techsheba.bsky.social"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      App Password (com.atproto.server.createSession)
                    </label>
                    <input
                      type="password"
                      value={bskyAppPassword}
                      onChange={e => setBskyAppPassword(e.target.value)}
                      placeholder="xxxx-xxxx-xxxx-xxxx (Generate in Settings -> App Passwords)"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      PDS Service URL
                    </label>
                    <input
                      type="text"
                      value={bskyPdsUrl}
                      onChange={e => setBskyPdsUrl(e.target.value)}
                      placeholder="https://bsky.social"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={testingConnector}
                    onClick={() => handleTestConnector('bluesky')}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-sky-400 ${testingConnector ? 'animate-spin' : ''}`} />
                    <span>Test & Verify ATProto Connector</span>
                  </button>
                </div>
              </div>
            )}

            {/* 8. TIKTOK FORM */}
            {activeModalProvider === 'tiktok' && (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 text-rose-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <TikTokIcon className="h-4 w-4 text-rose-400" />
                    <span>TikTok Content Posting API v2 Scheduling Connector</span>
                  </div>
                  <p className="text-[11px] text-rose-300/80">
                    Connects to TikTok's Direct Post API. Schedules short-form viral videos, mutations, and scripts directly to creator profiles.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">
                      TikTok Creator Access Token
                    </label>
                    <input
                      type="password"
                      value={tiktokToken}
                      onChange={e => setTiktokToken(e.target.value)}
                      placeholder="act.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={testingConnector}
                    onClick={() => handleTestConnector('tiktok')}
                    className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-rose-400 ${testingConnector ? 'animate-spin' : ''}`} />
                    <span>Test & Verify TikTok Connector</span>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to remove ${activeModalProvider.toUpperCase()} credentials from .env and disconnect?`)) {
                    handleRemoveCredentials(activeModalProvider);
                  }
                }}
                disabled={isSavingCreds}
                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                title="Remove credentials from .env and disconnect"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove from .env</span>
              </button>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setActiveModalProvider(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>

                {activeModalProvider !== 'smtp' && activeModalProvider !== 'gemini' ? (
                  <>
                    <button
                      onClick={() => handleSaveCredentials(activeModalProvider, false)}
                      disabled={isSavingCreds}
                      className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
                    >
                      Save to .env
                    </button>
                    <button
                      onClick={() => handleSaveCredentials(activeModalProvider, true)}
                      disabled={isSavingCreds}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>
                        {isSavingCreds
                          ? 'Saving & Launching...'
                          : 'Save & Launch OAuth 2.0 Popup'}
                      </span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleSaveCredentials(activeModalProvider, false)}
                    disabled={isSavingCreds}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {isSavingCreds
                        ? 'Verifying Live Connection...'
                        : 'Save & Verify Live Connection'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
