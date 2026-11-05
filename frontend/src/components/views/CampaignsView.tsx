import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  CheckCircle2,
  Clock,
  Plus,
  Play,
  ArrowRight,
  FastForward,
  Sparkles,
  Pause,
  Trash2,
  Edit3,
  Save,
  ExternalLink,
  ShieldCheck,
  Bot,
  Layers,
  X
} from 'lucide-react';
import { AgentId, CampaignItem, ViewId } from '../../types';
import { CampaignsEmptyState, FilterResultsEmptyState } from '../common/EmptyState';

interface CampaignsViewProps {
  campaigns: CampaignItem[];
  onOpenCommand: () => void;
  onNavigate?: (view: ViewId) => void;
  onStateSynced?: (state: any) => void;
  onUpdateCampaigns?: (campaigns: CampaignItem[]) => void;
}

interface StageDeliverableRecord {
  stageNumber: number;
  stageTitle: string;
  agent: AgentId;
  deliverableTitle: string;
  deliverableSummary: string;
  deliverableBody: string;
  targetView: ViewId;
  moduleLabel: string;
  executedAt: string;
}

const CAMPAIGN_STAGES: {
  num: number;
  label: string;
  agent: AgentId;
  targetView: ViewId;
  moduleLabel: string;
  defaultSummary: string;
}[] = [
  {
    num: 1,
    label: '1. Strategic Brief',
    agent: 'orchestrator',
    targetView: 'content',
    moduleLabel: 'Content Studio (Campaign Brief)',
    defaultSummary: 'Defines campaign objectives, budget allocation, target ICP, and primary KPI guardrails.'
  },
  {
    num: 2,
    label: '2. Market Research',
    agent: 'research',
    targetView: 'content',
    moduleLabel: 'Content Studio (Research Dossier)',
    defaultSummary: 'Extracts competitor content gaps, buyer pain points, and high-intent search queries.'
  },
  {
    num: 3,
    label: '3. Persona Mapping',
    agent: 'strategy',
    targetView: 'content',
    moduleLabel: 'Content Studio (ICP Matrix)',
    defaultSummary: 'Maps decision-maker angles, value propositions, and objection-handling hooks.'
  },
  {
    num: 4,
    label: '4. Content Studio Drafting',
    agent: 'content',
    targetView: 'content',
    moduleLabel: 'Content Studio (Pillar Article)',
    defaultSummary: 'Drafts long-form SEO pillar articles, executive guides, and case study narratives.'
  },
  {
    num: 5,
    label: '5. SEO & GEO Keyword Audit',
    agent: 'seo',
    targetView: 'seo',
    moduleLabel: 'SEO & GEO Visibility Score',
    defaultSummary: 'Injects JSON-LD schema and optimizes entity citations for ChatGPT, Perplexity, and Google.'
  },
  {
    num: 6,
    label: '6. Multi-Channel Packaging',
    agent: 'social',
    targetView: 'social',
    moduleLabel: 'Social Calendar & Email Sequences',
    defaultSummary: 'Packages branded visual social cards and responsive HTML nurture emails.'
  },
  {
    num: 7,
    label: '7. Human Approval Gate',
    agent: 'orchestrator',
    targetView: 'approvals',
    moduleLabel: 'Human Approval Queue',
    defaultSummary: 'Pauses autonomous execution and routes multi-channel assets to the Approval Queue for sign-off.'
  },
  {
    num: 8,
    label: '8. Active Distribution',
    agent: 'social',
    targetView: 'social',
    moduleLabel: 'Live Multi-Channel Distribution',
    defaultSummary: 'Dispatches approved posts and emails across connected social pages and channels.'
  },
  {
    num: 9,
    label: '9. Attribution & Retrospective',
    agent: 'analytics',
    targetView: 'marketing-hub',
    moduleLabel: 'Knowledge Hub Memory',
    defaultSummary: 'Analyzes pipeline ROI and logs winning hooks & formats into persistent Brand Memory.'
  }
];

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  campaigns,
  onOpenCommand,
  onNavigate,
  onStateSynced,
  onUpdateCampaigns
}) => {
  const [localCampaigns, setLocalCampaigns] = useState<CampaignItem[]>(campaigns);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | undefined>(campaigns[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // AI 1-Click Generator State
  const [aiGoalPrompt, setAiGoalPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Stage Execution & Deliverable Inspector State
  const [inspectedStageNum, setInspectedStageNum] = useState<number>(
    campaigns[0]?.currentStage || 1
  );
  const [runningStageNum, setRunningStageNum] = useState<number | null>(null);
  const [stageDeliverables, setStageDeliverables] = useState<
    Record<string, StageDeliverableRecord>
  >({});

  // Inline Edit Budget & Details State
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState('');
  const [targetKpiDraft, setTargetKpiDraft] = useState('');

  // Manual Creation Modal State
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignTagline, setNewCampaignTagline] = useState('');
  const [newBudget, setNewBudget] = useState('25000');
  const [newChannels, setNewChannels] = useState('LinkedIn, Facebook, Blog, X');

  useEffect(() => {
    setLocalCampaigns(campaigns);
    if (selectedCampaign) {
      const updated = campaigns.find(c => c.id === selectedCampaign.id);
      setSelectedCampaign(updated || campaigns[0]);
    } else {
      setSelectedCampaign(campaigns[0]);
    }
  }, [campaigns]);

  useEffect(() => {
    if (selectedCampaign) {
      setInspectedStageNum(selectedCampaign.currentStage);
      setBudgetDraft(String(selectedCampaign.budget.allocated));
      setTargetKpiDraft(selectedCampaign.primaryMetric.target);
      setIsEditingBudget(false);
    }
  }, [selectedCampaign?.id]);

  const updateList = (next: CampaignItem[]) => {
    setLocalCampaigns(next);
    if (onUpdateCampaigns) onUpdateCampaigns(next);
  };

  const filteredCampaigns = localCampaigns.filter(c => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  const handleAiCreateCampaign = async () => {
    const prompt =
      aiGoalPrompt.trim() ||
      'Launch Q4 Enterprise AI SEO & Autonomous Marketing Platform targeting B2B SaaS Founders';
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/campaigns/ai-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalPrompt: prompt })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else if (data.campaign) {
          updateList([data.campaign, ...localCampaigns]);
        }
        if (data.campaign) {
          setSelectedCampaign(data.campaign);
          setInspectedStageNum(1);
          if (data.stage1Brief) {
            setStageDeliverables(prev => ({
              ...prev,
              [`${data.campaign.id}-1`]: {
                stageNumber: 1,
                stageTitle: 'Strategic Brief',
                agent: 'orchestrator',
                deliverableTitle: `Stage 1 Strategic Brief: ${data.campaign.name}`,
                deliverableSummary:
                  'AI Orchestrator generated the campaign blueprint and saved the Strategic Brief to Content Studio.',
                deliverableBody: data.stage1Brief,
                targetView: 'content',
                moduleLabel: 'Content Studio (Campaign Brief)',
                executedAt: 'Just now'
              }
            }));
          }
        }
        setAiGoalPrompt('');
      }
    } catch (e) {
      console.error('AI campaign create error:', e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCreateCampaign = () => {
    if (!newCampaignName.trim()) return;
    const allocated = Number(newBudget) || 25000;
    const created: CampaignItem = {
      id: `cmp-${Date.now()}`,
      name: newCampaignName.trim(),
      tagline:
        newCampaignTagline.trim() ||
        'Autonomous multi-channel growth sprint across search, social, and paid acquisition.',
      status: 'running',
      currentStage: 1,
      budget: {
        allocated,
        spent: 0
      },
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      primaryMetric: {
        name: 'Qualified Pipeline',
        value: '$0',
        target: `$${(allocated * 5).toLocaleString()}`
      },
      leadAgent: 'orchestrator',
      channels: newChannels
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    };
    const next = [created, ...localCampaigns];
    updateList(next);
    setSelectedCampaign(created);
    setIsCreating(false);
    setNewCampaignName('');
    setNewCampaignTagline('');
  };

  const handleExecuteStage = async (
    cmp: CampaignItem,
    stageNum: number,
    advance: boolean
  ) => {
    setRunningStageNum(stageNum);
    setInspectedStageNum(stageNum);

    try {
      const res = await fetch('/api/campaigns/execute-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: cmp.id,
          stageNumber: stageNum,
          advance
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        } else if (data.campaign) {
          const next = localCampaigns.map(c =>
            c.id === cmp.id ? data.campaign : c
          );
          updateList(next);
        }
        if (data.campaign) {
          setSelectedCampaign(data.campaign);
        }
        setStageDeliverables(prev => ({
          ...prev,
          [`${cmp.id}-${stageNum}`]: {
            stageNumber: stageNum,
            stageTitle: data.stageTitle || `Stage ${stageNum}`,
            agent: (data.agent || 'orchestrator') as AgentId,
            deliverableTitle:
              data.deliverableTitle || `${cmp.name} — Stage ${stageNum} Output`,
            deliverableSummary:
              data.deliverableSummary ||
              `Completed Stage ${stageNum} and dispatched output to ${data.moduleLabel}.`,
            deliverableBody: data.deliverableBody || '',
            targetView: (data.targetView || 'content') as ViewId,
            moduleLabel: data.moduleLabel || 'Content Studio',
            executedAt: 'Just now'
          }
        }));
        setRunningStageNum(null);
        return;
      }
    } catch (e) {
      console.error('Execute stage error:', e);
    }

    // Fallback if offline
    const nextStage = advance ? Math.min(10, stageNum + 1) : stageNum;
    const nextStatus =
      nextStage === 8 ? 'review' : nextStage === 10 && !advance ? 'completed' : 'running';
    const updated: CampaignItem = {
      ...cmp,
      currentStage: nextStage,
      status: nextStatus
    };
    const next = localCampaigns.map(c => (c.id === cmp.id ? updated : c));
    updateList(next);
    setSelectedCampaign(updated);
    setRunningStageNum(null);
  };

  const handleTogglePause = (cmp: CampaignItem) => {
    const nextStatus = cmp.status === 'paused' ? 'running' : 'paused';
    const updated: CampaignItem = { ...cmp, status: nextStatus };
    const next = localCampaigns.map(c => (c.id === cmp.id ? updated : c));
    updateList(next);
    setSelectedCampaign(updated);
  };

  const handleSaveBudgetEdit = () => {
    if (!selectedCampaign) return;
    const allocated = Number(budgetDraft) || selectedCampaign.budget.allocated;
    const updated: CampaignItem = {
      ...selectedCampaign,
      budget: {
        ...selectedCampaign.budget,
        allocated
      },
      primaryMetric: {
        ...selectedCampaign.primaryMetric,
        target: targetKpiDraft.trim() || selectedCampaign.primaryMetric.target
      }
    };
    const next = localCampaigns.map(c => (c.id === updated.id ? updated : c));
    updateList(next);
    setSelectedCampaign(updated);
    setIsEditingBudget(false);
  };

  const handleDeleteCampaign = (cmpId: string) => {
    const next = localCampaigns.filter(c => c.id !== cmpId);
    updateList(next);
    if (selectedCampaign?.id === cmpId && next[0]) {
      setSelectedCampaign(next[0]);
    }
  };

  const activeStageMeta =
    CAMPAIGN_STAGES.find(s => s.num === inspectedStageNum) || CAMPAIGN_STAGES[0];
  const activeStageDeliverable = selectedCampaign
    ? stageDeliverables[`${selectedCampaign.id}-${inspectedStageNum}`]
    : undefined;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Campaigns
          </h2>
          <span className="text-xs font-semibold text-emerald-400 tabular-nums">
            {localCampaigns.length} Campaigns · 10 Stages
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold border border-neutral-700 transition-all shrink-0"
          >
            <Plus className="h-4 w-4 text-emerald-400" />
            <span>Custom Campaign</span>
          </button>
          <button
            onClick={onOpenCommand}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            <span>Command (⌘K)</span>
          </button>
        </div>
      </div>

      {/* AI 1-Click Campaign Blueprint Generator Bar */}
      <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-white shrink-0">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>AI 1-Click Campaign Generator</span>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-2xl">
          <input
            type="text"
            value={aiGoalPrompt}
            onChange={e => setAiGoalPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isAiGenerating && handleAiCreateCampaign()}
            placeholder="Enter campaign goal (e.g., Launch Q4 Enterprise AI SEO Suite)..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleAiCreateCampaign}
            disabled={isAiGenerating}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors"
          >
            {isAiGenerating ? (
              <>
                <div className="h-3.5 w-3.5 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate Campaign</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 3-Column Bento Split: Left Campaign List + Right 2-Col 10-Stage Execution Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Campaign List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Campaigns ({filteredCampaigns.length})
            </span>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
              {['all', 'running', 'review', 'paused'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`text-[10px] uppercase px-2 py-0.5 rounded-lg transition-colors font-semibold ${
                    filterStatus === s
                      ? 'bg-neutral-800 text-emerald-400 font-bold'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredCampaigns.length === 0 ? (
              <FilterResultsEmptyState
                query={filterStatus !== 'all' ? `${filterStatus} campaigns` : undefined}
                onReset={() => setFilterStatus('all')}
              />
            ) : (
              filteredCampaigns.map(cmp => (
                <div
                  key={cmp.id}
                  onClick={() => setSelectedCampaign(cmp)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2.5 ${
                    selectedCampaign?.id === cmp.id
                      ? 'bg-neutral-900 border-emerald-500/40'
                      : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{cmp.name}</h4>
                    <span
                      className={`text-[10px] uppercase px-2 py-0.5 rounded-md font-bold shrink-0 ${
                        cmp.status === 'running'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : cmp.status === 'review'
                          ? 'bg-amber-500/15 text-amber-400'
                          : cmp.status === 'paused'
                          ? 'bg-rose-500/15 text-rose-400'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {cmp.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${(cmp.currentStage / 10) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 tabular-nums">
                    <span className="font-semibold text-white">
                      Stage {cmp.currentStage}/10
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {cmp.primaryMetric.value} / {cmp.primaryMetric.target}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 2 Columns: Active Campaign Detailed 10-Stage Pipeline & Deliverable Inspector */}
        {selectedCampaign && (
          <div className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-5">
            {/* Active Campaign Header + Lifecycle Controls */}
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 border-b border-neutral-800 pb-4">
              <div className="space-y-1">
                <div className="text-xs text-neutral-400 tabular-nums">
                  <strong className="text-emerald-400">Stage {selectedCampaign.currentStage}/10</strong> · Lead: <strong className="text-white uppercase">{selectedCampaign.leadAgent}</strong> · {selectedCampaign.channels.join(' · ')}
                </div>
                <h3 className="text-lg font-bold text-white">{selectedCampaign.name}</h3>
                <p className="text-xs text-neutral-400 line-clamp-1">{selectedCampaign.tagline}</p>
              </div>

              {/* Right Controls & Budget Summary */}
              <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTogglePause(selectedCampaign)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white flex items-center gap-1.5 border border-neutral-700 transition-colors"
                  >
                    {selectedCampaign.status === 'paused' ? (
                      <>
                        <Play className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-3.5 w-3.5 text-amber-400" />
                        <span>Pause</span>
                      </>
                    )}
                  </button>

                  {!isEditingBudget ? (
                    <button
                      onClick={() => setIsEditingBudget(true)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white flex items-center gap-1.5 border border-neutral-700 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Edit Budget</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveBudgetEdit}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>Save</span>
                    </button>
                  )}

                  {localCampaigns.length > 1 && (
                    <button
                      onClick={() => handleDeleteCampaign(selectedCampaign.id)}
                      className="p-1.5 rounded-xl bg-neutral-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-700 transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {!isEditingBudget ? (
                  <div className="text-xs text-neutral-400 sm:text-right space-y-0.5 tabular-nums">
                    <div>
                      Budget:{' '}
                      <strong className="text-white">
                        ${selectedCampaign.budget.spent.toLocaleString()} / $
                        {selectedCampaign.budget.allocated.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      Target KPI:{' '}
                      <strong className="text-emerald-400">
                        {selectedCampaign.primaryMetric.target} {selectedCampaign.primaryMetric.name}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Budget ($)</span>
                      <input
                        type="number"
                        value={budgetDraft}
                        onChange={e => setBudgetDraft(e.target.value)}
                        className="w-24 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-white tabular-nums"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">KPI Target</span>
                      <input
                        type="text"
                        value={targetKpiDraft}
                        onChange={e => setTargetKpiDraft(e.target.value)}
                        className="w-28 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-white tabular-nums"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stage Deliverable & Agent Inspector Banner */}
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Stage {activeStageMeta.num} Inspector: {activeStageMeta.label.replace(/^\d+\.\s*/, '')}</span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-neutral-800 text-emerald-400 font-bold">
                        {activeStageMeta.agent} agent
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Layers className="h-3 w-3 text-emerald-400" />
                      <span>Auto-Dispatch Module: </span>
                      <strong className="text-white">{activeStageMeta.moduleLabel}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleExecuteStage(selectedCampaign, activeStageMeta.num, false)
                    }
                    disabled={runningStageNum !== null}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    {runningStageNum === activeStageMeta.num ? (
                      <>
                        <div className="h-3 w-3 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin" />
                        <span>Running Stage {activeStageMeta.num}...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-neutral-950" />
                        <span>Run Stage {activeStageMeta.num} Agent</span>
                      </>
                    )}
                  </button>

                  {onNavigate && (
                    <button
                      onClick={() => onNavigate(activeStageMeta.targetView)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1 border border-neutral-700 transition-colors"
                    >
                      <span>Open {activeStageMeta.moduleLabel.split(' ')[0]}</span>
                      <ExternalLink className="h-3 w-3 text-emerald-400" />
                    </button>
                  )}
                </div>
              </div>

              {activeStageDeliverable ? (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{activeStageDeliverable.deliverableTitle}</span>
                    </span>
                    <span className="text-[11px] text-emerald-300 font-semibold">
                      Dispatched to {activeStageDeliverable.moduleLabel}
                    </span>
                  </div>
                  <p className="text-neutral-200 leading-relaxed">
                    {activeStageDeliverable.deliverableSummary}
                  </p>
                  {activeStageDeliverable.deliverableBody && (
                    <div className="p-2.5 rounded-lg bg-neutral-950/90 border border-neutral-800 text-[11px] text-neutral-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                      {activeStageDeliverable.deliverableBody}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {activeStageMeta.defaultSummary} Click <strong>Run Stage {activeStageMeta.num} Agent</strong> above or <strong>Run & Advance Stage</strong> below to generate a live deliverable and auto-send it to <strong>{activeStageMeta.moduleLabel}</strong>.
                </p>
              )}
            </div>

            {/* 10-Stage Visual Stepper */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  10-Stage Autonomous Execution Roadmap (Click any stage to inspect or run)
                </h4>
                {selectedCampaign.currentStage <= 10 && (
                  <button
                    onClick={() =>
                      handleExecuteStage(
                        selectedCampaign,
                        selectedCampaign.currentStage,
                        selectedCampaign.currentStage < 10
                      )
                    }
                    disabled={runningStageNum !== null}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <FastForward className="h-3.5 w-3.5" />
                    <span>
                      {runningStageNum === selectedCampaign.currentStage
                        ? `Executing Stage ${selectedCampaign.currentStage}...`
                        : selectedCampaign.currentStage < 10
                        ? `Run Stage ${selectedCampaign.currentStage} & Advance to Stage ${selectedCampaign.currentStage + 1}`
                        : 'Run Final Stage 10 Retrospective'}
                    </span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {CAMPAIGN_STAGES.map(stage => {
                  const stageNum = stage.num;
                  const isCompleted = stageNum < selectedCampaign.currentStage;
                  const isCurrent = stageNum === selectedCampaign.currentStage;
                  const isSelected = stageNum === inspectedStageNum;
                  const isApprovalGate = stageNum === 8;
                  const hasDeliverable = Boolean(
                    stageDeliverables[`${selectedCampaign.id}-${stageNum}`]
                  );

                  return (
                    <div
                      key={stageNum}
                      onClick={() => setInspectedStageNum(stageNum)}
                      className={`cursor-pointer flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'ring-2 ring-emerald-500/50 bg-neutral-900 border-emerald-500/50'
                          : isCurrent
                          ? isApprovalGate
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                            : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                          : isCompleted
                          ? 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                          : 'bg-neutral-950/50 border-neutral-800/50 text-neutral-500 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {runningStageNum === stageNum ? (
                          <div className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shrink-0" />
                        ) : isCompleted || hasDeliverable ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : isCurrent ? (
                          <Play className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-neutral-600 shrink-0" />
                        )}
                        <div className="truncate">
                          <div className="font-bold text-white truncate">{stage.label}</div>
                          <div className="text-[10px] text-neutral-400 truncate">
                            Agent: {stage.agent} → {stage.moduleLabel}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isApprovalGate && isCurrent && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                            GATE
                          </span>
                        )}
                        <span
                          className={`text-[10px] uppercase px-2 py-0.5 rounded-md font-semibold ${
                            isCompleted || hasDeliverable
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : isCurrent
                              ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                              : 'bg-neutral-900 text-neutral-500'
                          }`}
                        >
                          {hasDeliverable
                            ? 'Output Ready'
                            : isCompleted
                            ? 'Done'
                            : isCurrent
                            ? 'Active'
                            : 'Queued'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Quick Links */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Stage 8 automatically routes multi-channel assets to the Approval Gate.</span>
              </div>
              <div className="flex items-center gap-2">
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('approvals')}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-amber-400 border border-amber-500/30 transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Open Approval Queue</span>
                  </button>
                )}
                <button
                  onClick={onOpenCommand}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors flex items-center gap-2"
                >
                  <span>Orchestrate via Command Center</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedCampaign && (
          <div className="lg:col-span-2">
            <CampaignsEmptyState
              onCreateCampaign={() => setIsCreating(true)}
              onOpenCommand={onOpenCommand}
            />
          </div>
        )}
      </div>

      {/* Custom Campaign Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Custom 10-Stage Campaign</h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaignName}
                  onChange={e => setNewCampaignName(e.target.value)}
                  placeholder="e.g., Q4 Enterprise AI Visibility Launch"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">
                  Strategic Tagline / Objective
                </label>
                <input
                  type="text"
                  value={newCampaignTagline}
                  onChange={e => setNewCampaignTagline(e.target.value)}
                  placeholder="e.g., Capture high-intent enterprise buyers across LinkedIn & AI Search"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">
                    Allocated Budget ($ USD)
                  </label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={e => setNewBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">
                    Distribution Channels
                  </label>
                  <input
                    type="text"
                    value={newChannels}
                    onChange={e => setNewChannels(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl border border-neutral-800 text-neutral-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5"
              >
                <Play className="h-3.5 w-3.5 fill-neutral-950" />
                <span>Launch Stage 1</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
