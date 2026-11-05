import React, { useState, useEffect } from 'react';
import {
  Webhook,
  ShoppingBag,
  BookOpen,
  Zap,
  Check,
  Copy,
  RefreshCw,
  Send,
  ShieldCheck,
  Eye,
  EyeOff,
  Play,
  ArrowRight,
  ExternalLink,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Code2,
  Trash2,
  Layers,
  Share2,
  Facebook,
  Linkedin,
  Instagram,
  Twitter,
  Youtube
} from 'lucide-react';
import {
  SocialPagePlatform,
  WebhookHubConfig,
  WebhookLogEntry,
  PageSocialPost
} from '../../types';

interface WebhookHubConfigResponse {
  config: WebhookHubConfig;
  endpoints: {
    unifiedHub: string;
    shopify: string;
    wordpress: string;
    n8n: string;
    make: string;
  };
  stats: {
    totalLogs: number;
    totalQueuedPosts: number;
  };
}

import { ThreadsIcon, BlueskyIcon, TikTokIcon, PinterestIcon } from '../social/SocialPlatformIcons';

interface WebhookHubStudioProps {
  onPostQueued?: () => void;
  onClose?: () => void;
}

const PLATFORM_ICONS: Record<SocialPagePlatform, React.ReactNode> = {
  LinkedIn: <Linkedin className="h-3.5 w-3.5 text-blue-400" />,
  Facebook: <Facebook className="h-3.5 w-3.5 text-blue-500" />,
  Instagram: <Instagram className="h-3.5 w-3.5 text-pink-400" />,
  X: <Twitter className="h-3.5 w-3.5 text-neutral-300" />,
  YouTube: <Youtube className="h-3.5 w-3.5 text-red-500" />,
  Threads: <ThreadsIcon className="h-3.5 w-3.5 text-white" />,
  Bluesky: <BlueskyIcon className="h-3.5 w-3.5 text-sky-400" />,
  TikTok: <TikTokIcon className="h-3.5 w-3.5 text-rose-400" />,
  Pinterest: <PinterestIcon className="h-3.5 w-3.5 text-rose-500" />
};

export const WebhookHubStudio: React.FC<WebhookHubStudioProps> = ({ onPostQueued }) => {
  const [data, setData] = useState<WebhookHubConfigResponse | null>(null);
  const [logs, setLogs] = useState<WebhookLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'simulator' | 'blueprints' | 'logs'>('endpoints');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);

  // Simulator State
  const [simPreset, setSimPreset] = useState<'shopify' | 'wordpress' | 'n8n' | 'make'>('shopify');
  const [simTitle, setSimTitle] = useState('AirFlex Pro Max Running Shoes');
  const [simDescription, setSimDescription] = useState(
    'Engineered with dual-density responsive nitrogen foam and breathable carbon weave mesh. Built for maximum marathon speed and joint support.'
  );
  const [simPrice, setSimPrice] = useState('$149.00');
  const [simUrl, setSimUrl] = useState('https://store.techsheba.com/products/airflex-pro-max');
  const [simVendorOrAuthor, setSimVendorOrAuthor] = useState('Tech Sheba Athletics');
  const [simTags, setSimTags] = useState('Running, Marathon, Footwear, NewArrival');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    message: string;
    source: string;
    eventType: string;
    queuedCount: number;
    routingMode: string;
    posts: PageSocialPost[];
  } | null>(null);

  // Blueprints Sub-tab
  const [blueprintPlatform, setBlueprintPlatform] = useState<'n8n' | 'make' | 'shopify' | 'wordpress' | 'curl'>('n8n');

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/webhooks/config');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load webhook config:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/webhooks/logs');
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs || []);
      }
    } catch (err) {
      console.error('Failed to load webhook logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchLogs();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleUpdateConfig = async (partialConfig: Partial<WebhookHubConfig>) => {
    if (!data) return;
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/webhooks/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialConfig)
      });
      if (res.ok) {
        const json = await res.json();
        setData(prev => (prev ? { ...prev, config: json.config } : prev));
      }
    } catch (err) {
      console.error('Failed updating config:', err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleRegenerateSecret = () => {
    const newSecret = 'snc_wh_sec_' + Math.random().toString(36).substring(2, 10);
    handleUpdateConfig({ secretToken: newSecret });
  };

  const togglePlatform = (platform: SocialPagePlatform) => {
    if (!data?.config) return;
    const current = data.config.targetPlatforms || [];
    const exists = current.includes(platform);
    const updated = exists ? current.filter(p => p !== platform) : [...current, platform];
    if (updated.length > 0) {
      handleUpdateConfig({ targetPlatforms: updated });
    }
  };

  const handleLoadPreset = (preset: 'shopify' | 'wordpress' | 'n8n' | 'make') => {
    setSimPreset(preset);
    setSimulationResult(null);

    if (preset === 'shopify') {
      setSimTitle('AirFlex Pro Max Running Shoes');
      setSimDescription(
        'Engineered with dual-density responsive nitrogen foam and breathable carbon weave mesh. Built for maximum marathon speed and joint support.'
      );
      setSimPrice('$149.00');
      setSimUrl('https://store.techsheba.com/products/airflex-pro-max');
      setSimVendorOrAuthor('Tech Sheba Athletics');
      setSimTags('Running, Marathon, Footwear, NewArrival');
    } else if (preset === 'wordpress') {
      setSimTitle('10 Essential AI Marketing Strategies for 2027');
      setSimDescription(
        'Autonomous multi-agent orchestration is disrupting manual content cycles. Here is how leading B2B marketing leaders are restructuring their omnichannel publishing queues.'
      );
      setSimPrice('');
      setSimUrl('https://blog.techsheba.com/ai-marketing-strategies-2027');
      setSimVendorOrAuthor('Dr. Sarah Vance · VP Growth AI');
      setSimTags('AIMarketing, Strategy, ThoughtLeadership, Omnipost');
    } else if (preset === 'n8n') {
      setSimTitle('Enterprise Cloud Cost Optimization Report');
      setSimDescription(
        'Our client reduced AWS Kubernetes compute latency by 42% while scaling to 5M monthly active users with zero downtime.'
      );
      setSimPrice('');
      setSimUrl('https://techsheba.com/case-studies/cloud-latency');
      setSimVendorOrAuthor('Cloud Infrastructure Lab');
      setSimTags('CloudCompute, CaseStudy, Devops, Scaling');
    } else if (preset === 'make') {
      setSimTitle('Spring Growth Accelerate Flash Promotion');
      setSimDescription(
        'Limited-time 30% discount on all executive SEO advisory tiers valid through Friday midnight.'
      );
      setSimPrice('$299.00');
      setSimUrl('https://techsheba.com/pricing');
      setSimVendorOrAuthor('Serpely Growth Team');
      setSimTags('FlashSale, Promotion, SEOAdvisory, Growth');
    }
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationResult(null);

    let payload: any = {};
    if (simPreset === 'shopify') {
      payload = {
        title: simTitle,
        body_html: `<p>${simDescription}</p>`,
        vendor: simVendorOrAuthor,
        variants: [{ price: simPrice.replace(/[^0-9.]/g, '') || '99.00' }],
        handle: simTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tags: simTags.split(',').map(s => s.trim())
      };
    } else if (simPreset === 'wordpress') {
      payload = {
        post_title: simTitle,
        post_excerpt: simDescription,
        post_permalink: simUrl,
        post_author_name: simVendorOrAuthor,
        categories: simTags.split(',').map(s => s.trim())
      };
    } else {
      payload = {
        title: simTitle,
        description: simDescription,
        price: simPrice,
        url: simUrl,
        vendor: simVendorOrAuthor,
        tags: simTags.split(',').map(s => s.trim())
      };
    }

    try {
      const res = await fetch('/api/webhooks/test-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: simPreset,
          customPayload: payload
        })
      });
      const json = await res.json();
      if (json.success) {
        setSimulationResult(json);
        await fetchLogs();
        if (onPostQueued) onPostQueued();
      } else {
        alert(json.error || 'Simulation failed');
      }
    } catch (err: any) {
      alert(`Simulation error: ${err?.message || 'Check connection'}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/webhooks/logs/clear', { method: 'POST' });
      setLogs([]);
    } catch (err) {
      console.error('Error clearing logs:', err);
    }
  };

  const config = data?.config;
  const baseUrl = data?.endpoints?.unifiedHub ? new URL(data.endpoints.unifiedHub).origin : 'http://localhost:5000';

  return (
    <div className="w-full space-y-6">
      {/* 1. Top Hero Gateway Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border border-neutral-800 p-5 sm:p-6 shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Webhook className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Public Webhook Hub</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE GATEWAY
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Universal webhook listener connecting <strong className="text-neutral-200">Shopify</strong>, <strong className="text-neutral-200">WordPress</strong>, <strong className="text-neutral-200">n8n</strong> & <strong className="text-neutral-200">Make.com</strong> to Sincly’s Omnipost publishing queue.
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 text-xs text-neutral-400">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                <span>Smart Queue:</span>
                <strong className="text-white capitalize">{config?.routingMode?.replace('_', ' ') || 'Smart Queue'}</strong>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Webhooks Received:</span>
                <strong className="text-white tabular-nums">{logs.length}</strong>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950/60 border border-neutral-800/80">
                <Share2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Active Channels:</span>
                <strong className="text-white tabular-nums">{config?.targetPlatforms?.length || 4} Platforms</strong>
              </div>
            </div>
          </div>

          {/* Quick Trigger Simulator CTA */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('simulator')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Test Simulator (1-Click)</span>
            </button>
            <span className="text-[11px] text-neutral-500 font-mono">
              Listening on {baseUrl}/api/webhooks/*
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-px">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'endpoints'
                ? 'border-indigo-500 text-white bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30'
            }`}
          >
            <Webhook className="h-4 w-4 text-indigo-400" />
            <span>Endpoints & Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'simulator'
                ? 'border-indigo-500 text-white bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Interactive Simulator</span>
            {simulationResult && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('blueprints')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'blueprints'
                ? 'border-indigo-500 text-white bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30'
            }`}
          >
            <Code2 className="h-4 w-4 text-emerald-400" />
            <span>Integration Guides (n8n · Make)</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'logs'
                ? 'border-indigo-500 text-white bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30'
            }`}
          >
            <Clock className="h-4 w-4 text-blue-400" />
            <span>Activity Logs</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 tabular-nums">
              {logs.length}
            </span>
          </button>
        </div>

        <button
          onClick={() => {
            fetchConfig();
            fetchLogs();
          }}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Refresh Hub Telemetry"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* 3. TAB 1: ENDPOINTS & SETTINGS */}
      {activeTab === 'endpoints' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Endpoints Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unified Hub */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5 hover:border-neutral-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Webhook className="h-4 w-4 text-indigo-400" />
                  <span>Unified Omnipost Ingestion Hub</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  POST
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Auto-detects Shopify products, WordPress blogs, or generic automation JSON payloads.
              </p>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 font-mono text-xs text-neutral-300 border border-neutral-800">
                <span className="truncate flex-1 select-all">{data?.endpoints?.unifiedHub || `${baseUrl}/api/webhooks/hub`}</span>
                <button
                  onClick={() => handleCopy(data?.endpoints?.unifiedHub || `${baseUrl}/api/webhooks/hub`, 'unified')}
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  title="Copy URL"
                >
                  {copiedKey === 'unified' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Shopify Dedicated */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5 hover:border-neutral-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-emerald-400" />
                  <span>Shopify Product Creation Listener</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  products/create
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Direct endpoint for Shopify Webhooks. Auto-extracts product title, price, variants, and image.
              </p>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 font-mono text-xs text-neutral-300 border border-neutral-800">
                <span className="truncate flex-1 select-all">{data?.endpoints?.shopify || `${baseUrl}/api/webhooks/shopify`}</span>
                <button
                  onClick={() => handleCopy(data?.endpoints?.shopify || `${baseUrl}/api/webhooks/shopify`, 'shopify')}
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  {copiedKey === 'shopify' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* WordPress Dedicated */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5 hover:border-neutral-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <span>WordPress Blog Publish Listener</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  publish_post
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Extracts post title, summary excerpt, author, permalink, and generates thought leadership cards.
              </p>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 font-mono text-xs text-neutral-300 border border-neutral-800">
                <span className="truncate flex-1 select-all">{data?.endpoints?.wordpress || `${baseUrl}/api/webhooks/wordpress`}</span>
                <button
                  onClick={() => handleCopy(data?.endpoints?.wordpress || `${baseUrl}/api/webhooks/wordpress`, 'wordpress')}
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  {copiedKey === 'wordpress' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* n8n & Make Dedicated */}
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2.5 hover:border-neutral-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>n8n / Make.com Custom Dispatch</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  JSON REST
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Accepts customized JSON nodes from n8n HTTP Request or Make.com scenario modules.
              </p>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 font-mono text-xs text-neutral-300 border border-neutral-800">
                <span className="truncate flex-1 select-all">{data?.endpoints?.n8n || `${baseUrl}/api/webhooks/n8n`}</span>
                <button
                  onClick={() => handleCopy(data?.endpoints?.n8n || `${baseUrl}/api/webhooks/n8n`, 'n8n')}
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  {copiedKey === 'n8n' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Configuration Controls Card */}
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span>Queue Routing & Authorization Security</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Security & Secret */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Webhook Secret Token
                  </label>
                  <p className="text-[11px] text-neutral-500 mb-2">
                    Send via <code className="text-neutral-300">X-Sincly-Webhook-Secret</code> header or <code className="text-neutral-300">?secret=...</code> query param.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showSecret ? 'text' : 'password'}
                        readOnly
                        value={config?.secretToken || 'snc_wh_sec_9a7b3c2d'}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none"
                      />
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-0.5"
                      >
                        {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopy(config?.secretToken || '', 'secret')}
                      className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      {copiedKey === 'secret' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>Copy</span>
                    </button>

                    <button
                      onClick={handleRegenerateSecret}
                      disabled={isSavingConfig}
                      className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      title="Generate new secret token"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800/80">
                  <div>
                    <span className="text-xs font-semibold text-white block">Enforce Secret Token Verification</span>
                    <span className="text-[11px] text-neutral-500">
                      If disabled, public endpoints accept valid Shopify/WP payloads without auth header.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config?.requireSecret || false}
                    onChange={e => handleUpdateConfig({ requireSecret: e.target.checked })}
                    className="accent-indigo-500 h-4 w-4 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Right Column: Routing Destination & Target Platforms */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                    Omnipost Queue Ingestion Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        mode: 'smart_queue',
                        label: 'Smart Queue Slot',
                        desc: 'Postiz-style peak time slots'
                      },
                      {
                        mode: 'approval_gate',
                        label: 'Approval Gate',
                        desc: 'Requires human approval'
                      },
                      {
                        mode: 'instant_publish',
                        label: 'Instant Broadcast',
                        desc: 'Direct live publishing'
                      }
                    ].map(opt => (
                      <button
                        key={opt.mode}
                        onClick={() => handleUpdateConfig({ routingMode: opt.mode as any })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          config?.routingMode === opt.mode
                            ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
                            : 'bg-neutral-950 border-neutral-800/80 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="text-xs font-bold leading-tight">{opt.label}</div>
                        <div className="text-[10px] text-neutral-500 mt-1 leading-tight">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                    Target Social Channels to Generate
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['LinkedIn', 'Facebook', 'Instagram', 'X', 'YouTube'] as SocialPagePlatform[]).map(platform => {
                      const isSelected = (config?.targetPlatforms || []).includes(platform);
                      return (
                        <button
                          key={platform}
                          onClick={() => togglePlatform(platform)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-neutral-800 text-white border-neutral-700 shadow-sm'
                              : 'bg-neutral-950 text-neutral-500 border-neutral-800/80 hover:text-neutral-300'
                          }`}
                        >
                          {PLATFORM_ICONS[platform]}
                          <span>{platform}</span>
                          {isSelected && <Check className="h-3 w-3 text-emerald-400 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: INTERACTIVE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-5">
            {/* Preset Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Play className="h-4 w-4 text-emerald-400" />
                  <span>Incoming Webhook Test Simulator</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Simulate an incoming event from Shopify or WordPress to see omnichannel copy and visual cards queued instantly.
                </p>
              </div>

              {/* Preset Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  onClick={() => handleLoadPreset('shopify')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    simPreset === 'shopify'
                      ? 'bg-emerald-500 text-neutral-950 font-bold'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Shopify Product</span>
                </button>

                <button
                  onClick={() => handleLoadPreset('wordpress')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    simPreset === 'wordpress'
                      ? 'bg-blue-500 text-white font-bold'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>WordPress Blog</span>
                </button>

                <button
                  onClick={() => handleLoadPreset('n8n')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    simPreset === 'n8n'
                      ? 'bg-amber-500 text-neutral-950 font-bold'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>n8n Workflow</span>
                </button>

                <button
                  onClick={() => handleLoadPreset('make')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    simPreset === 'make'
                      ? 'bg-purple-500 text-white font-bold'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Make.com Scenario</span>
                </button>
              </div>
            </div>

            {/* Simulation Form Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  {simPreset === 'shopify' ? 'Product Name' : 'Article / Content Title'}
                </label>
                <input
                  type="text"
                  value={simTitle}
                  onChange={e => setSimTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  {simPreset === 'shopify' ? 'Brand / Vendor' : 'Author / Source'}
                </label>
                <input
                  type="text"
                  value={simVendorOrAuthor}
                  onChange={e => setSimVendorOrAuthor(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  {simPreset === 'shopify' ? 'Product Specifications / Description' : 'Summary Excerpt / Key Takeaways'}
                </label>
                <textarea
                  rows={3}
                  value={simDescription}
                  onChange={e => setSimDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-700 leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Target Destination URL
                </label>
                <input
                  type="text"
                  value={simUrl}
                  onChange={e => setSimUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-700"
                />
              </div>

              <div className="flex gap-3">
                {simPreset === 'shopify' || simPreset === 'make' ? (
                  <div className="w-1/3">
                    <label className="text-xs font-medium text-neutral-300 block mb-1">Price</label>
                    <input
                      type="text"
                      value={simPrice}
                      onChange={e => setSimPrice(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-700"
                    />
                  </div>
                ) : null}
                <div className="flex-1">
                  <label className="text-xs font-medium text-neutral-300 block mb-1">Categories / Tags</label>
                  <input
                    type="text"
                    value={simTags}
                    onChange={e => setSimTags(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-700"
                  />
                </div>
              </div>
            </div>

            {/* Fire Action */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-neutral-500 font-mono">
                Routing: <strong className="text-neutral-300 capitalize">{config?.routingMode?.replace('_', ' ')}</strong> across {config?.targetPlatforms?.join(', ')}
              </span>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating || !simTitle.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSimulating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{isSimulating ? 'Processing Webhook...' : 'Dispatch Test Webhook'}</span>
              </button>
            </div>
          </div>

          {/* Simulation Output / Results Preview */}
          {simulationResult && (
            <div className="p-5 rounded-2xl bg-neutral-950 border border-emerald-500/30 space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400">
                      Webhook Processed Successfully (200 OK)
                    </h4>
                    <p className="text-xs text-neutral-400">
                      {simulationResult.message}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300">
                  {simulationResult.queuedCount} Posts Queued
                </span>
              </div>

              {/* Staged Omnipost Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {simulationResult.posts.map(post => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {PLATFORM_ICONS[post.platform]}
                          <span>{post.platform} Post</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {post.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Visual SVG Card Preview */}
                      {post.visualUrl && (
                        <div className="rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 max-h-40 flex items-center justify-center">
                          <img
                            src={post.visualUrl}
                            alt="Generated Social Visual"
                            className="w-full h-auto object-cover max-h-40"
                          />
                        </div>
                      )}

                      {/* Caption copy */}
                      <pre className="text-xs font-sans text-neutral-300 whitespace-pre-wrap line-clamp-6 leading-relaxed bg-neutral-950/70 p-3 rounded-lg border border-neutral-800/80">
                        {post.content}
                      </pre>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="truncate">{post.createdAt}</span>
                      <button
                        onClick={() => handleCopy(post.content, post.id)}
                        className="text-neutral-400 hover:text-white transition-colors"
                      >
                        {copiedKey === post.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: BLUEPRINTS & GUIDES (n8n & Make) */}
      {activeTab === 'blueprints' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Sub-selector for Guide */}
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            {[
              { id: 'n8n', label: 'n8n Workflow Node', icon: <Zap className="h-3.5 w-3.5 text-amber-400" /> },
              { id: 'make', label: 'Make.com Scenario', icon: <Sparkles className="h-3.5 w-3.5 text-purple-400" /> },
              { id: 'shopify', label: 'Shopify Admin Webhooks', icon: <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" /> },
              { id: 'wordpress', label: 'WordPress Hook (WP Webhooks)', icon: <BookOpen className="h-3.5 w-3.5 text-blue-400" /> },
              { id: 'curl', label: 'cURL Command', icon: <Code2 className="h-3.5 w-3.5 text-neutral-400" /> }
            ].map(bp => (
              <button
                key={bp.id}
                onClick={() => setBlueprintPlatform(bp.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  blueprintPlatform === bp.id
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {bp.icon}
                <span>{bp.label}</span>
              </button>
            ))}
          </div>

          {/* Blueprint Detail */}
          {blueprintPlatform === 'n8n' && (
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>n8n HTTP Request Node Configuration</span>
                </h4>
                <p className="text-xs text-neutral-400">
                  Connect your n8n workflows (Shopify trigger, RSS feed, WordPress node, or database scraper) directly to Sincly.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 space-y-2 relative">
                <button
                  onClick={() =>
                    handleCopy(
                      JSON.stringify(
                        {
                          method: 'POST',
                          url: `${baseUrl}/api/webhooks/hub`,
                          headers: {
                            'Content-Type': 'application/json',
                            'X-Sincly-Webhook-Secret': config?.secretToken || 'snc_wh_sec_9a7b3c2d'
                          },
                          body: {
                            title: '={{$json.title}}',
                            content: '={{$json.description || $json.body}}',
                            url: '={{$json.url || $json.permalink}}',
                            price: '={{$json.price}}',
                            tags: '={{$json.tags}}'
                          }
                        },
                        null,
                        2
                      ),
                      'n8n-snippet'
                    )
                  }
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                  title="Copy Node JSON"
                >
                  {copiedKey === 'n8n-snippet' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <div className="text-neutral-500">// n8n HTTP Request Node Settings</div>
                <div><span className="text-indigo-400">Method:</span> POST</div>
                <div><span className="text-indigo-400">URL:</span> {baseUrl}/api/webhooks/hub</div>
                <div><span className="text-indigo-400">Header:</span> X-Sincly-Webhook-Secret: {config?.secretToken}</div>
                <div><span className="text-indigo-400">Body Content Type:</span> JSON</div>
              </div>
            </div>
          )}

          {blueprintPlatform === 'make' && (
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span>Make.com (Integromat) HTTP Module</span>
                </h4>
                <p className="text-xs text-neutral-400">
                  Use Make's standard "Make a request" HTTP module at the end of any Shopify, WooCommerce, or WordPress scenario.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 space-y-2">
                <div><span className="text-purple-400">URL:</span> {baseUrl}/api/webhooks/hub</div>
                <div><span className="text-purple-400">Method:</span> POST</div>
                <div><span className="text-purple-400">Headers:</span> Content-Type: application/json, X-Sincly-Webhook-Secret: {config?.secretToken}</div>
                <div><span className="text-purple-400">Body Type:</span> Raw (application/json)</div>
              </div>
            </div>
          )}

          {blueprintPlatform === 'shopify' && (
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-emerald-400" />
                  <span>Native Shopify Webhook Setup Guide</span>
                </h4>
                <p className="text-xs text-neutral-400">
                  No third-party plugin needed. Set up real-time publishing straight from Shopify Admin.
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-300 leading-relaxed">
                <li>Log in to your <strong>Shopify Admin</strong> dashboard.</li>
                <li>Go to <strong>Settings</strong> (bottom left) &gt; <strong>Notifications</strong>.</li>
                <li>Scroll down to the <strong>Webhooks</strong> section and click <strong>Create Webhook</strong>.</li>
                <li>Select <strong>Event:</strong> <code className="text-emerald-400 bg-neutral-950 px-1 py-0.5 rounded">Product creation</code> (or Product update).</li>
                <li>Select <strong>Format:</strong> <code className="text-emerald-400 bg-neutral-950 px-1 py-0.5 rounded">JSON</code>.</li>
                <li>Paste URL: <code className="text-emerald-400 bg-neutral-950 px-1.5 py-0.5 rounded font-mono">{baseUrl}/api/webhooks/shopify</code></li>
                <li>Click <strong>Save</strong>. Whenever you publish a new product, Sincly will autonomously queue promotional Omniposts across your connected channels!</li>
              </ol>
            </div>
          )}

          {blueprintPlatform === 'wordpress' && (
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <span>WordPress Post Webhook Setup</span>
                </h4>
                <p className="text-xs text-neutral-400">
                  Hook into WordPress <code className="text-neutral-300">publish_post</code> trigger using the free <strong>WP Webhooks</strong> plugin or functions.php snippet.
                </p>
              </div>

              <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
                <div>
                  <strong>Method 1: Using WP Webhooks Plugin:</strong>
                  <p className="text-neutral-400 mt-0.5">
                    Install WP Webhooks &gt; Send Data &gt; Select "Post created/published" &gt; Add Webhook URL: <code className="text-blue-400 font-mono bg-neutral-950 px-1.5 py-0.5 rounded">{baseUrl}/api/webhooks/wordpress</code>.
                  </p>
                </div>
                <div>
                  <strong>Method 2: Clean functions.php hook:</strong>
                  <pre className="p-3 bg-neutral-950 rounded-xl font-mono text-[11px] text-neutral-300 mt-1 overflow-x-auto border border-neutral-800">
{`add_action('publish_post', function($post_id, $post) {
  wp_remote_post('${baseUrl}/api/webhooks/wordpress', [
    'headers' => ['Content-Type' => 'application/json', 'X-Sincly-Webhook-Secret' => '${config?.secretToken}'],
    'body' => json_encode([
      'post_title' => $post->post_title,
      'post_excerpt' => get_the_excerpt($post_id),
      'permalink' => get_permalink($post_id),
      'post_author_name' => get_the_author_meta('display_name', $post->post_author)
    ])
  ]);
}, 10, 2);`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {blueprintPlatform === 'curl' && (
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-neutral-400" />
                  <span>Instant cURL Shell Snippet</span>
                </h4>
                <p className="text-xs text-neutral-400">
                  Send a test payload from your terminal or CI/CD script.
                </p>
              </div>

              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-emerald-400 overflow-x-auto">
{`curl -X POST ${baseUrl}/api/webhooks/hub \\
  -H "Content-Type: application/json" \\
  -H "X-Sincly-Webhook-Secret: ${config?.secretToken}" \\
  -d '{
    "title": "Autonomous AI Marketing OS Launch",
    "description": "Unified omnipost queue engine for B2B teams.",
    "url": "https://sincly.app",
    "tags": ["AIMarketing", "Omnipost", "Automation"]
  }'`}
                </pre>
                <button
                  onClick={() =>
                    handleCopy(
                      `curl -X POST ${baseUrl}/api/webhooks/hub -H "Content-Type: application/json" -H "X-Sincly-Webhook-Secret: ${config?.secretToken}" -d '{"title":"Autonomous AI Marketing OS Launch","description":"Unified omnipost queue engine for B2B teams.","url":"https://sincly.app","tags":["AIMarketing","Omnipost","Automation"]}'`,
                      'curl-cmd'
                    )
                  }
                  className="absolute right-3 top-3 p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  {copiedKey === 'curl-cmd' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 4: ACTIVITY LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
              Incoming Webhook Audit Trail ({logs.length})
            </span>
            {logs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="text-xs text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-neutral-900/30 border border-neutral-800 text-neutral-500 text-xs">
              No incoming webhooks recorded yet. Use the Simulator or send a POST request to see real-time logs here.
            </div>
          ) : (
            <div className="space-y-2.5">
              {logs.map(log => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-neutral-900/50 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-neutral-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          log.source === 'Shopify'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.source === 'WordPress'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {log.source} · {log.eventType}
                      </span>
                      <strong className="text-white font-medium truncate max-w-sm">
                        {log.title}
                      </strong>
                    </div>
                    <p className="text-neutral-400 text-[11px]">
                      {log.payloadSummary}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-neutral-500 text-[11px] font-mono">
                    <span className="text-emerald-400">200 OK</span>
                    <span>{log.latencyMs}ms</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
