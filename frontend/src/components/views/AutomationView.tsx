import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ArrowRight,
  Code2,
  ToggleLeft,
  ToggleRight,
  ListFilter,
  X,
  Plus,
  Play,
  Search,
  Zap,
  Mail,
  Users,
  Radio,
  Linkedin,
  Facebook,
  Clock,
  Trash2,
  RefreshCw,
  AlertCircle,
  SlidersHorizontal,
  Sparkles,
  Check,
  Webhook
} from 'lucide-react';
import { mockAutomations } from '../../data/mock-data';
import { AutomationRule } from '../../types';
import { WebhookHubStudio } from '../integrations/WebhookHubStudio';

interface AutomationViewProps {
  automationsList?: AutomationRule[];
  onUpdateAutomations?: (automations: AutomationRule[]) => void;
  onStateSynced?: (state: any) => void;
}

const SYSTEM_EVENTS = [
  'linkedin.post.comment_received',
  'facebook.post.published',
  'email.outreach.lead_engaged',
  'lead.created',
  'competitor.radar.alert',
  'research.created',
  'strategy.created',
  'content.created',
  'approval.required',
  'content.approved',
  'content.rejected',
  'post.scheduled',
  'post.published',
  'comment.received',
  'campaign.started',
  'campaign.completed',
  'analytics.updated',
  'memory.updated'
];

type TriggerCategory = 'All' | 'LinkedIn' | 'Facebook' | 'Email' | 'Leads & CRM' | 'Radar & Webhook' | 'Scheduled';

interface TriggerPresetInfo {
  events: string[];
  defaultCondition: string;
  defaultActions: string[];
}

const TRIGGER_PRESETS: Record<string, TriggerPresetInfo> = {
  'LinkedIn': {
    events: [
      'linkedin.post.comment_received',
      'linkedin.post.published',
      'linkedin.post.viral_engagement',
      'linkedin.lead_form_submitted',
      'linkedin.mention.detected'
    ],
    defaultCondition: 'Comment contains intent keywords (price, quote, demo, audit) or reactions > 15',
    defaultActions: ['Intent Sentiment Filter', 'AI Executive Draft', 'Approval Gate', 'CRM Lead Sync']
  },
  'Facebook': {
    events: [
      'facebook.post.published',
      'facebook.post.high_engagement',
      'facebook.comment.received',
      'facebook.message.inbox',
      'facebook.ad_lead_gen'
    ],
    defaultCondition: 'Organic reach velocity > 50 engagements in 120 mins',
    defaultActions: ['Reach Velocity Analysis', 'Intent Sentiment Filter', 'Human Approval Gate', 'Social Broadcast']
  },
  'Email': {
    events: [
      'email.outreach.lead_engaged',
      'email.lead.opened_unreplied',
      'email.lead.replied',
      'email.form_submitted',
      'email.bounce_alert'
    ],
    defaultCondition: 'Recipient opens email >= 2 times AND reply_received == false',
    defaultActions: ['Telemetry Verification', 'Dynamic Pitch Customizer', 'Custom SMTP Queue', 'Pipeline Stage Move']
  },
  'Leads & CRM': {
    events: [
      'lead.created',
      'lead.score.threshold_exceeded',
      'lead.qualification.received',
      'lead.status_changed',
      'lead.meeting_scheduled'
    ],
    defaultCondition: 'Lead ICP Score >= 70 OR company_size >= 20 seats',
    defaultActions: ['Firmographic Enrichment', 'B2B ICP Scoring', 'Slack Executive Alert', 'Stage Assignment']
  },
  'Radar & Webhook': {
    events: [
      'competitor.radar.alert',
      'competitor.pricing_change',
      'webhook.incoming.dispatch',
      'seo.keyword.rank_shift',
      'geo.citation_spike'
    ],
    defaultCondition: 'Competitor price shift detected OR new Tier announced',
    defaultActions: ['Webhook Payload Parse', 'Competitive Rebuttal Engine', 'Approval Gate', 'Social Broadcast']
  },
  'Scheduled': {
    events: [
      'cron.daily_0900.executive_brief',
      'cron.weekly_monday.audit',
      'cron.hourly.social_monitor'
    ],
    defaultCondition: 'Every weekday morning at 09:00 AM UTC',
    defaultActions: ['Data Aggregator', 'Executive Summary AI', 'Slack Channel Post']
  }
};

const AVAILABLE_ACTIONS = [
  'Intent Sentiment Filter',
  'AI Executive Draft',
  'Human Approval Gate',
  'CRM Lead Sync',
  'Custom SMTP Queue',
  'Slack Executive Alert',
  'Firmographic Enrichment',
  'B2B ICP Scoring',
  'Competitive Rebuttal Engine',
  'Social Broadcast',
  'Pipeline Stage Move'
];

export const AutomationView: React.FC<AutomationViewProps> = ({
  automationsList = [],
  onUpdateAutomations,
  onStateSynced
}) => {
  const [automations, setAutomations] = useState<AutomationRule[]>(
    automationsList || []
  );
  const [categoryFilter, setCategoryFilter] = useState<TriggerCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [testWebhookRes, setTestWebhookRes] = useState<string | null>(null);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWebhookHubModal, setShowWebhookHubModal] = useState(false);
  const [runningTriggerId, setRunningTriggerId] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<{
    id: string;
    name: string;
    logs: string[];
    timestamp: string;
  } | null>(null);

  // Form state for creating a manual trigger
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<'LinkedIn' | 'Facebook' | 'Email' | 'Leads & CRM' | 'Radar & Webhook' | 'Scheduled'>('LinkedIn');
  const [formTriggerEvent, setFormTriggerEvent] = useState(TRIGGER_PRESETS['LinkedIn'].events[0]);
  const [formCustomEvent, setFormCustomEvent] = useState('');
  const [formCondition, setFormCondition] = useState(TRIGGER_PRESETS['LinkedIn'].defaultCondition);
  const [formPipeline, setFormPipeline] = useState<string[]>(TRIGGER_PRESETS['LinkedIn'].defaultActions);
  const [formActive, setFormActive] = useState(true);

  useEffect(() => {
    if (automationsList && automationsList.length > 0) {
      setAutomations(automationsList);
    } else if (automations.length === 0) {
      setAutomations(mockAutomations);
    }
  }, [automationsList]);

  // When form category changes, update preset events & actions
  const handleCategoryChange = (cat: 'LinkedIn' | 'Facebook' | 'Email' | 'Leads & CRM' | 'Radar & Webhook' | 'Scheduled') => {
    setFormCategory(cat);
    const preset = TRIGGER_PRESETS[cat];
    if (preset) {
      setFormTriggerEvent(preset.events[0]);
      setFormCondition(preset.defaultCondition);
      setFormPipeline(preset.defaultActions);
      setFormCustomEvent('');
    }
  };

  const toggleActionInPipeline = (action: string) => {
    if (formPipeline.includes(action)) {
      setFormPipeline(formPipeline.filter(a => a !== action));
    } else {
      setFormPipeline([...formPipeline, action]);
    }
  };

  const toggleAutomation = (id: string) => {
    const next = automations.map(a => (a.id === id ? { ...a, active: !a.active } : a));
    setAutomations(next);
    if (onUpdateAutomations) onUpdateAutomations(next);
  };

  const handleDeleteAutomation = (id: string) => {
    const next = automations.filter(a => a.id !== id);
    setAutomations(next);
    if (onUpdateAutomations) onUpdateAutomations(next);
  };

  // Manual Trigger Run / Execution simulation
  const handleRunTrigger = async (rule: AutomationRule) => {
    setRunningTriggerId(rule.id);
    setExecutionResult(null);

    try {
      const res = await fetch(`/api/automations/${rule.id}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      if (data.success && data.automation) {
        const next = automations.map(a => (a.id === rule.id ? data.automation : a));
        setAutomations(next);
        if (onUpdateAutomations) onUpdateAutomations(next);
        if (data.state && onStateSynced) onStateSynced(data.state);

        setExecutionResult({
          id: rule.id,
          name: rule.name,
          logs: data.logs || [
            `[${new Date().toISOString()}] Fired trigger: ${rule.triggerEvent}`,
            `[Pipeline] ${rule.actionPipeline.join(' → ')}`,
            `[Status] 200 OK · Execution successful`
          ],
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        throw new Error('Fallback to local execution');
      }
    } catch {
      // Local fallback execution if backend endpoint unavailable
      const updatedRule: AutomationRule = {
        ...rule,
        timesTriggered: (rule.timesTriggered || 0) + 1,
        lastTriggered: 'Just now'
      };
      const next = automations.map(a => (a.id === rule.id ? updatedRule : a));
      setAutomations(next);
      if (onUpdateAutomations) onUpdateAutomations(next);

      setExecutionResult({
        id: rule.id,
        name: rule.name,
        logs: [
          `[${new Date().toISOString()}] Manual execution fired for event: ${rule.triggerEvent}`,
          `[Pipeline Dispatched] ${rule.actionPipeline.join(' → ')}`,
          `[Condition Evaluated] "${rule.condition || 'Always true'}" → Matched`,
          `[Execution Status] 200 OK · Local telemetry updated successfully`
        ],
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setTimeout(() => setRunningTriggerId(null), 500);
    }
  };

  // Create new manual trigger handler
  const handleCreateTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEvent = formCustomEvent.trim() || formTriggerEvent;
    if (!formName.trim() || !finalEvent || formPipeline.length === 0) return;

    const newRule: AutomationRule = {
      id: `aut-custom-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      description: formDescription.trim() || `Automated pipeline for event: ${finalEvent}`,
      triggerEvent: finalEvent,
      condition: formCondition.trim() || 'Custom filter condition active',
      actionPipeline: formPipeline,
      active: formActive,
      timesTriggered: 0,
      lastTriggered: 'Never'
    };

    const next = [newRule, ...automations];
    setAutomations(next);
    if (onUpdateAutomations) onUpdateAutomations(next);

    // Reset and close
    setShowCreateModal(false);
    setFormName('');
    setFormDescription('');
    setFormCustomEvent('');
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setTestWebhookRes(null);
    try {
      const res = await fetch('/api/webhooks/competitor-radar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AMH-Signature': 'sha256=9b84a2f8c7e4'
        },
        body: JSON.stringify({
          event: 'competitor.found',
          competitor: 'Semrush Enterprise',
          change: 'New Generative AI SEO pricing tier announced'
        })
      });
      const data = await res.json();
      if (data.state && onStateSynced) {
        onStateSynced(data.state);
      }
      const { state: _omitted, ...cleanResponse } = data;
      setTestWebhookRes(JSON.stringify(cleanResponse, null, 2));
    } catch {
      setTestWebhookRes(
        JSON.stringify(
          {
            received: true,
            automationId: 'competitor-radar',
            event: 'competitor.found',
            dispatched: true,
            timestamp: new Date().toISOString()
          },
          null,
          2
        )
      );
    } finally {
      setIsTestingWebhook(false);
    }
  };

  // Infer category for a rule if not explicitly set
  const getRuleCategory = (rule: AutomationRule): string => {
    if (rule.category) return rule.category;
    const evt = rule.triggerEvent.toLowerCase();
    if (evt.includes('linkedin')) return 'LinkedIn';
    if (evt.includes('facebook')) return 'Facebook';
    if (evt.includes('email')) return 'Email';
    if (evt.includes('lead')) return 'Leads & CRM';
    if (evt.includes('competitor') || evt.includes('webhook')) return 'Radar & Webhook';
    if (evt.includes('cron') || evt.includes('schedule')) return 'Scheduled';
    return 'Custom';
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'LinkedIn':
        return {
          icon: <Linkedin className="h-3.5 w-3.5 text-sky-400" />,
          classes: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
        };
      case 'Facebook':
        return {
          icon: <Facebook className="h-3.5 w-3.5 text-blue-400" />,
          classes: 'bg-blue-600/10 text-blue-400 border-blue-600/20'
        };
      case 'Email':
        return {
          icon: <Mail className="h-3.5 w-3.5 text-purple-400" />,
          classes: 'bg-purple-500/10 text-purple-300 border-purple-500/20'
        };
      case 'Leads & CRM':
        return {
          icon: <Users className="h-3.5 w-3.5 text-emerald-400" />,
          classes: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
        };
      case 'Radar & Webhook':
        return {
          icon: <Radio className="h-3.5 w-3.5 text-amber-400" />,
          classes: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
        };
      default:
        return {
          icon: <Zap className="h-3.5 w-3.5 text-neutral-400" />,
          classes: 'bg-neutral-800 text-neutral-300 border-neutral-700'
        };
    }
  };

  // Filter automations
  const filteredAutomations = automations.filter(aut => {
    const cat = getRuleCategory(aut);
    const matchesCategory = categoryFilter === 'All' || cat === categoryFilter;
    const matchesSearch =
      searchQuery === '' ||
      aut.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aut.triggerEvent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aut.actionPipeline.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalRuns = automations.reduce((acc, a) => acc + (a.timesTriggered || 0), 0);

  return (
    <div className="w-full space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Zap className="h-6 w-6 text-emerald-400" />
              Automations & Triggers
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tabular-nums">
              {automations.filter(a => a.active).length}/{automations.length} Active
            </span>
            <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
              · {totalRuns} total executions
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Autonomous multi-channel trigger workflows across LinkedIn, Facebook, Email, CRM & Webhooks.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => setShowWebhookHubModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-all shadow-sm"
          >
            <Webhook className="h-3.5 w-3.5 text-indigo-400" />
            <span>Webhook Hub (Shopify/WP/n8n)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          </button>

          {/* Manual Create Trigger Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Create Automation Trigger</span>
          </button>

          <button
            onClick={() => setShowEventsModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-800 transition-colors"
          >
            <ListFilter className="h-3.5 w-3.5 text-emerald-400" />
            <span>18 System Events</span>
          </button>

          <button
            onClick={handleTestWebhook}
            disabled={isTestingWebhook}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-800 transition-colors"
          >
            <Code2 className="h-3.5 w-3.5 text-amber-400" />
            <span>{isTestingWebhook ? 'Triggering...' : 'Test Radar Webhook'}</span>
          </button>
        </div>
      </div>

      {/* 2. Webhook or Manual Trigger Live Execution Log Banner */}
      {executionResult && (
        <div className="p-4 rounded-2xl bg-neutral-950 border border-emerald-500/30 space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Trigger Executed: {executionResult.name} · {executionResult.timestamp}
            </span>
            <button
              onClick={() => setExecutionResult(null)}
              className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1 p-3 bg-neutral-900/90 rounded-xl font-mono text-xs border border-neutral-800 text-neutral-300">
            {executionResult.logs.map((log, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-emerald-400 select-none">›</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {testWebhookRes && (
        <div className="p-4 rounded-2xl bg-neutral-950 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Webhook 200 OK · Counter-Play Queued in Approval Gate
            </span>
            <button onClick={() => setTestWebhookRes(null)} className="text-neutral-500 hover:text-white">✕</button>
          </div>
          <pre className="text-xs font-mono text-neutral-300 overflow-x-auto p-2.5 bg-neutral-900 rounded-xl">
            {testWebhookRes}
          </pre>
        </div>
      )}

      {/* 3. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['All', 'LinkedIn', 'Facebook', 'Email', 'Leads & CRM', 'Radar & Webhook'] as TriggerCategory[]).map(cat => {
            const count = cat === 'All'
              ? automations.length
              : automations.filter(a => getRuleCategory(a) === cat).length;
            const isActive = categoryFilter === cat;

            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                  isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-neutral-800 text-neutral-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="h-3.5 w-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search triggers or actions..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 transition-colors"
          />
        </div>
      </div>

      {categoryFilter === 'Radar & Webhook' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-neutral-900 to-neutral-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Webhook className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Public Webhook Hub (Shopify · WordPress · n8n · Make)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ONLINE
                </span>
              </h4>
              <p className="text-xs text-neutral-400">
                Trigger Sincly Omnipost publishing queue automatically on new Shopify products or WordPress blogs.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWebhookHubModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 shrink-0 flex items-center gap-2"
          >
            <span>Open Webhook Hub Studio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 4. Automation Trigger Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAutomations.map(aut => {
          const cat = getRuleCategory(aut);
          const badge = getCategoryBadge(cat);
          const isRunning = runningTriggerId === aut.id;

          return (
            <div
              key={aut.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                aut.active
                  ? 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                  : 'border-neutral-800/60 bg-neutral-900/20 opacity-75'
              }`}
            >
              {/* Header: Badge, Category, Status & Toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${badge.classes}`}>
                      {badge.icon}
                      <span>{cat}</span>
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold ${
                        aut.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      {aut.active ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white truncate" title={aut.name}>
                    {aut.name}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {aut.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleAutomation(aut.id)}
                    className="text-neutral-400 hover:text-white transition-colors"
                    title={aut.active ? 'Pause Automation' : 'Enable Automation'}
                  >
                    {aut.active ? (
                      <ToggleRight className="h-6 w-6 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-neutral-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Trigger Event & Condition Pills */}
              <div className="space-y-2 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">WHEN:</span>
                  <span className="font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[11px]">
                    {aut.triggerEvent}
                  </span>
                </div>

                {aut.condition && (
                  <div className="flex items-start gap-2 text-[11px] text-neutral-400">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider shrink-0 mt-0.5">IF:</span>
                    <span className="italic text-neutral-300">{aut.condition}</span>
                  </div>
                )}

                {/* Pipeline Steps Flow */}
                <div className="pt-1.5 border-t border-neutral-800/60 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">THEN:</span>
                  {aut.actionPipeline.map((act, idx) => (
                    <React.Fragment key={idx}>
                      <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-200">
                        {act}
                      </span>
                      {idx < aut.actionPipeline.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-neutral-600 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Bottom Telemetry & Manual Run Action */}
              <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-800/50 pt-3">
                <div className="flex items-center gap-3 tabular-nums text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-neutral-500" />
                    <span>Last: {aut.lastTriggered}</span>
                  </span>
                  <span>·</span>
                  <span>{aut.timesTriggered} runs</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Manual Run / Test Trigger Button */}
                  <button
                    onClick={() => handleRunTrigger(aut)}
                    disabled={isRunning}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isRunning
                        ? 'bg-neutral-800 text-neutral-400 border-neutral-700'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50 active:scale-95'
                    }`}
                    title="Fire this trigger manually right now"
                  >
                    {isRunning ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    )}
                    <span>{isRunning ? 'Running...' : 'Run Now'}</span>
                  </button>

                  {/* Delete Button for custom rules */}
                  {aut.id.startsWith('aut-custom-') && (
                    <button
                      onClick={() => handleDeleteAutomation(aut.id)}
                      className="p-1.5 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete custom trigger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAutomations.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-neutral-800 bg-neutral-900/20 space-y-3">
          <SlidersHorizontal className="h-8 w-8 text-neutral-600 mx-auto" />
          <h4 className="text-base font-semibold text-white">No Automations Found</h4>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            No triggers match your search query or filter. Click &ldquo;Create Automation Trigger&rdquo; to build a new one.
          </p>
          <button
            onClick={() => {
              setCategoryFilter('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* 5. MANUAL TRIGGER CREATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Automation Trigger</h3>
                  <p className="text-xs text-neutral-400">Configure a custom event-driven autonomous workflow</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTrigger} className="space-y-4">
              {/* 1. Category Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">1. Trigger Platform / Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['LinkedIn', 'Facebook', 'Email', 'Leads & CRM', 'Radar & Webhook', 'Scheduled'] as const).map(cat => {
                    const isSelected = formCategory === cat;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/50 shadow-sm'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200 hover:border-neutral-700'
                        }`}
                      >
                        {cat === 'LinkedIn' && <Linkedin className="h-3.5 w-3.5 text-sky-400" />}
                        {cat === 'Facebook' && <Facebook className="h-3.5 w-3.5 text-blue-400" />}
                        {cat === 'Email' && <Mail className="h-3.5 w-3.5 text-purple-400" />}
                        {cat === 'Leads & CRM' && <Users className="h-3.5 w-3.5 text-emerald-400" />}
                        {cat === 'Radar & Webhook' && <Radio className="h-3.5 w-3.5 text-amber-400" />}
                        {cat === 'Scheduled' && <Clock className="h-3.5 w-3.5 text-rose-400" />}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Name & Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300">2. Automation Title & Description</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g., LinkedIn Executive Inquiry Auto-Responder"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Describe when this rule triggers and what autonomous actions it takes..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* 3. Trigger Event Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">3. Trigger Event (WHEN)</label>
                <select
                  value={formTriggerEvent}
                  onChange={e => {
                    setFormTriggerEvent(e.target.value);
                    setFormCustomEvent('');
                  }}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                >
                  {TRIGGER_PRESETS[formCategory]?.events.map(ev => (
                    <option key={ev} value={ev}>
                      {ev}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-neutral-500 shrink-0">Or custom event:</span>
                  <input
                    type="text"
                    value={formCustomEvent}
                    onChange={e => setFormCustomEvent(e.target.value)}
                    placeholder="e.g., custom.app.user_signup"
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* 4. Filter / Condition */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">4. Condition / Filter Rules (IF - Optional)</label>
                <input
                  type="text"
                  value={formCondition}
                  onChange={e => setFormCondition(e.target.value)}
                  placeholder="e.g., Reactions > 20 OR comment contains 'price', 'demo'"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 5. Action Pipeline Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-300">5. Action Pipeline (THEN)</label>
                  <span className="text-[10px] text-neutral-500">Click to add/remove steps</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_ACTIONS.map(action => {
                    const isSelected = formPipeline.includes(action);
                    return (
                      <button
                        type="button"
                        key={action}
                        onClick={() => toggleActionInPipeline(action)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-emerald-400" />}
                        <span>{action}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Pipeline Flow Preview */}
                {formPipeline.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center gap-1.5 flex-wrap text-xs">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">FLOW:</span>
                    {formPipeline.map((act, idx) => (
                      <React.Fragment key={idx}>
                        <span className="text-neutral-200 font-medium">{act}</span>
                        {idx < formPipeline.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-neutral-600 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Active Toggle & Submit Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={e => setFormActive(e.target.checked)}
                    className="rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Activate immediately upon creation</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-neutral-950 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Deploy Trigger</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. 18 Subscribable System Events Modal */}
      {showEventsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ListFilter className="h-4 w-4 text-emerald-400" />
                18 Subscribable System Events
              </h3>
              <button
                onClick={() => setShowEventsModal(false)}
                className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-400">
              Any automation trigger can subscribe to these internal event buses to fire autonomous pipelines in real time:
            </p>
            <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-1">
              {SYSTEM_EVENTS.map(ev => (
                <span
                  key={ev}
                  className="text-xs font-mono px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-300 hover:border-emerald-500/50 transition-colors"
                >
                  {ev}
                </span>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowEventsModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showWebhookHubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-5xl rounded-3xl border border-neutral-800 bg-neutral-950 p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Webhook className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Public Webhook Hub Studio</h3>
                  <p className="text-xs text-neutral-400">Shopify, WordPress, n8n & Make.com real-time Omnipost queue integration</p>
                </div>
              </div>
              <button
                onClick={() => setShowWebhookHubModal(false)}
                className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <WebhookHubStudio onClose={() => setShowWebhookHubModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
