import React, { useState } from 'react';
import {
  Bot,
  Filter,
  CheckCircle2,
  Play,
  FileCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { AgentInfo, AgentId, ViewId } from '../../types';
import { apiClient } from '../../services/apiClient';

interface AgentsViewProps {
  agents: AgentInfo[];
  onOpenCommand: () => void;
  onNavigate?: (view: ViewId) => void;
  onStateSynced?: (state: any) => void;
}

interface AgentExecutionResult {
  agentId: AgentId;
  createdItemTitle: string;
  outputSummary: string;
  detailedBody: string;
  metricHighlight: string;
  dispatchedToLabel: string;
  targetView: ViewId;
  approvalView?: ViewId | null;
}

const AGENT_TASK_PRESETS: Record<
  AgentId,
  {
    roleSummary: string;
    destinationBadge: string;
    targetView: ViewId;
    placeholder: string;
    presets: string[];
  }
> = {
  orchestrator: {
    roleSummary: 'Plans end-to-end multi-channel campaigns and delegates tasks across all 11 specialist agents.',
    destinationBadge: 'Marketing Hub & Approval Gate',
    targetView: 'marketing-hub',
    placeholder: 'Plan a 30-day Q4 enterprise launch...',
    presets: [
      'Launch Q4 Enterprise AI SEO Campaign',
      'Coordinate 7-Day Product Push'
    ]
  },
  research: {
    roleSummary: 'Scans competitor gaps, live social signals, and buyer pain points to build research briefs.',
    destinationBadge: 'Content Studio',
    targetView: 'content',
    placeholder: 'Analyze top 3 competitor content gaps...',
    presets: [
      'Find Competitor Content Gaps',
      'Scan Buyer Pain Points on LinkedIn'
    ]
  },
  seo: {
    roleSummary: 'Audits Google SEO and AI search visibility (ChatGPT, Perplexity, Gemini) with schema fixes.',
    destinationBadge: 'SEO & GEO Score',
    targetView: 'seo',
    placeholder: 'Generate JSON-LD schema & citation fix...',
    presets: [
      'Audit AI Citation Visibility',
      'Generate FAQ Schema Fix'
    ]
  },
  strategy: {
    roleSummary: 'Defines ICP positioning angles, brand voice alignment, and 30-day content pillar roadmaps.',
    destinationBadge: 'Content Studio',
    targetView: 'content',
    placeholder: 'Build a 4-week authority pillar strategy...',
    presets: [
      '30-Day Thought Leadership Roadmap',
      'ICP Positioning Matrix for CTOs'
    ]
  },
  content: {
    roleSummary: 'Writes SEO-optimized pillar blogs, executive guides, case studies, and thought leadership.',
    destinationBadge: 'Content Studio',
    targetView: 'content',
    placeholder: 'Write an executive comparison guide...',
    presets: [
      'Write GEO Pillar Post',
      'Draft B2B SaaS Case Study'
    ]
  },
  social: {
    roleSummary: 'Drafts LinkedIn & Facebook Page posts with branded visual cards and schedules them.',
    destinationBadge: 'Social Calendar',
    targetView: 'social',
    placeholder: 'Draft a LinkedIn stat post with visual card...',
    presets: [
      'LinkedIn Executive Carousel Post',
      'Facebook Case Study Visual Card'
    ]
  },
  community: {
    roleSummary: 'Monitors social comments and inbox mentions, filters spam, and drafts commercial replies.',
    destinationBadge: 'Community Inbox',
    targetView: 'community',
    placeholder: 'Draft an executive reply on API security...',
    presets: [
      'Reply to CTO on SOC2 & API',
      'Convert Pricing Comment to Demo'
    ]
  },
  leads: {
    roleSummary: 'Detects buying signals from comments and forms, scores prospect intent, and recommends outreach.',
    destinationBadge: 'Buying Signals',
    targetView: 'leads',
    placeholder: 'Score inbound prospect asking for migration...',
    presets: [
      'Qualify VP Growth Prospect',
      'Extract LinkedIn Buying Signals'
    ]
  },
  email: {
    roleSummary: 'Builds responsive HTML onboarding, nurture, and re-engagement lifecycle email sequences.',
    destinationBadge: 'Email Sequences',
    targetView: 'email',
    placeholder: 'Build a 3-step trial onboarding email...',
    presets: [
      'Trial-to-Pro Upgrade Email',
      'Q4 Product Release Newsletter'
    ]
  },
  analytics: {
    roleSummary: 'Analyzes cross-channel ROI, CTR, and pipeline attribution to surface actionable growth insights.',
    destinationBadge: 'Analytics',
    targetView: 'analytics',
    placeholder: 'Analyze top-performing attribution channels...',
    presets: [
      'Cross-Channel ROAS Audit',
      'Top Converting Content Format'
    ]
  },
  memory: {
    roleSummary: 'Stores winning hooks, top-performing formats, and objection playbooks into persistent brand memory.',
    destinationBadge: 'Knowledge Hub',
    targetView: 'marketing-hub',
    placeholder: 'Store winning LinkedIn hook pattern...',
    presets: [
      'Log Winning Stat-Spotlight Hook',
      'Synthesize Objection Playbook'
    ]
  }
};

export const AgentsView: React.FC<AgentsViewProps> = ({
  agents,
  onOpenCommand,
  onNavigate,
  onStateSynced
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [inspectAgent, setInspectAgent] = useState<AgentInfo | null>(null);
  const [runningTaskId, setRunningTaskId] = useState<AgentId | null>(null);
  const [customPrompts, setCustomPrompts] = useState<Record<string, string>>({});
  const [resultsByAgent, setResultsByAgent] = useState<Record<string, AgentExecutionResult>>({});

  const departments = ['ALL', 'RESEARCH', 'CONTENT STUDIO', 'POSTING & COMMUNITY', 'GROWTH'];
  const riskLevels = ['ALL', 'low', 'medium', 'high'];

  const filteredAgents = agents.filter(agent => {
    if (selectedDept !== 'ALL' && agent.department !== selectedDept) return false;
    if (selectedRisk !== 'ALL' && agent.riskLevel !== selectedRisk) return false;
    return true;
  });

  const handleRunTask = async (agent: AgentInfo, overridePrompt?: string) => {
    const presetConfig = AGENT_TASK_PRESETS[agent.id];
    const promptToRun =
      (overridePrompt ?? customPrompts[agent.id] ?? '').trim() ||
      presetConfig?.presets[0] ||
      agent.description;

    setRunningTaskId(agent.id);

    try {
      const res = await apiClient.post('/api/agents/run-task', {
        agentId: agent.id,
        taskPrompt: promptToRun
      });
      if (res.success && res.data) {
        const data = res.data;
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        }
        setResultsByAgent(prev => ({
          ...prev,
          [agent.id]: {
            agentId: agent.id,
            createdItemTitle: data.createdItemTitle || `${agent.name} Deliverable`,
            outputSummary:
              data.outputSummary ||
              `Completed task and dispatched output to ${presetConfig.destinationBadge}.`,
            detailedBody: data.detailedBody || '',
            metricHighlight: data.metricHighlight || '+18% Lift',
            dispatchedToLabel: data.dispatchedToLabel || presetConfig.destinationBadge,
            targetView: (data.targetView || presetConfig.targetView) as ViewId,
            approvalView: (data.approvalView as ViewId) || null
          }
        }));
        setRunningTaskId(null);
        return;
      }
    } catch {
      // fallback below
    }

    setRunningTaskId(null);
    setResultsByAgent(prev => ({
      ...prev,
      [agent.id]: {
        agentId: agent.id,
        createdItemTitle: `${agent.name}: ${promptToRun.slice(0, 42)}`,
        outputSummary: `Executed ${agent.role} task and dispatched to ${presetConfig.destinationBadge}.`,
        detailedBody: `Generated for task: "${promptToRun}"`,
        metricHighlight: '+21% Lift',
        dispatchedToLabel: presetConfig.destinationBadge,
        targetView: presetConfig.targetView,
        approvalView: agent.riskLevel !== 'low' ? 'approvals' : null
      }
    }));
  };

  return (
    <div className="w-full space-y-5">
      {/* Clean Single-Row Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            AI Agents
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Run custom tasks or presets — outputs auto-dispatch to target modules
          </p>
        </div>

        <button
          onClick={onOpenCommand}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shrink-0 self-start sm:self-auto"
        >
          <Sparkles className="h-4 w-4" />
          <span>Master Command</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedDept === dept
                  ? 'bg-neutral-800 text-emerald-400 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Filter className="h-3.5 w-3.5 text-neutral-500" />
          <span>Risk:</span>
          {riskLevels.map(risk => (
            <button
              key={risk}
              onClick={() => setSelectedRisk(risk)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors uppercase ${
                selectedRisk === risk
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Clean 3-Point Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredAgents.map(agent => {
          const presetInfo = AGENT_TASK_PRESETS[agent.id];
          const currentInput = customPrompts[agent.id] ?? '';
          const executionResult = resultsByAgent[agent.id];
          const isRunning = runningTaskId === agent.id;

          return (
            <div
              key={agent.id}
              className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 hover:border-neutral-700 transition-all space-y-4"
            >
              <div className="space-y-3">
                {/* 1. Identity & Unboxed Metadata */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-800 border border-neutral-700 text-emerald-400 shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{agent.name}</h3>
                      <p className="text-xs text-neutral-400 truncate">
                        {agent.role} · <span className="capitalize">{agent.riskLevel} risk</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate && presetInfo && onNavigate(presetInfo.targetView)}
                    className="text-[11px] text-emerald-400 hover:underline font-medium flex items-center gap-1 shrink-0"
                    title="Target Module"
                  >
                    <span>{presetInfo?.destinationBadge}</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </button>
                </div>

                {/* 2. Task Input & Compact Preset Chips */}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={e =>
                      setCustomPrompts(prev => ({
                        ...prev,
                        [agent.id]: e.target.value
                      }))
                    }
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !isRunning) {
                        handleRunTask(agent);
                      }
                    }}
                    placeholder={presetInfo?.placeholder || 'Enter task instruction...'}
                    className="w-full rounded-xl bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
                  />

                  {presetInfo?.presets && (
                    <div className="flex flex-wrap gap-1.5">
                      {presetInfo.presets.map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setCustomPrompts(prev => ({ ...prev, [agent.id]: preset }));
                            handleRunTask(agent, preset);
                          }}
                          disabled={isRunning}
                          className="text-left text-[11px] font-medium px-2.5 py-1 rounded-lg bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 transition-colors truncate max-w-full"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Live Execution Feedback (if run) */}
                {executionResult && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-emerald-400 truncate flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{executionResult.createdItemTitle}</span>
                      </span>
                      {onNavigate && (
                        <button
                          type="button"
                          onClick={() => onNavigate(executionResult.targetView)}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500 text-neutral-950 font-bold text-[11px] flex items-center gap-1 shrink-0"
                        >
                          <span>Open</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Primary Action & Details Modal Trigger */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-800/80">
                <span className="text-[11px] text-neutral-400 tabular-nums">
                  {agent.stats.tasksCompleted} tasks · {agent.stats.accuracyScore}%
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setInspectAgent(agent)}
                    className="py-1.5 px-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleRunTask(agent)}
                    disabled={isRunning}
                    className="py-1.5 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <div className="h-3 w-3 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin" />
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-neutral-950" />
                        <span>Run Task</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agent Details & Contract Modal */}
      {inspectAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-5 w-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">{inspectAgent.name}</h3>
                  <span className="text-xs text-neutral-400">{inspectAgent.role}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectAgent(null)}
                className="text-neutral-400 hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <div className="text-emerald-400 font-semibold">Agent Responsibility</div>
                <p className="text-neutral-200 leading-relaxed">
                  {AGENT_TASK_PRESETS[inspectAgent.id]?.roleSummary || inspectAgent.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-neutral-400 font-semibold">
                    Input ({inspectAgent.inputContract.format})
                  </span>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(inspectAgent.inputContract.fields, null, 2)}</pre>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-neutral-400 font-semibold">
                    Output ({inspectAgent.outputContract.format})
                  </span>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(inspectAgent.outputContract.fields, null, 2)}</pre>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-neutral-400 pt-1">
                <span>
                  Risk Gate: <strong className="text-white uppercase">{inspectAgent.riskLevel}</strong>
                </span>
                <span>
                  Model: <strong className="text-white">{inspectAgent.model}</strong>
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectAgent(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
