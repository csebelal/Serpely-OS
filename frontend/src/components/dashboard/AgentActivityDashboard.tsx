import React, { useState, useEffect, useMemo } from 'react';
import {
  Cpu,
  Play,
  Pause,
  RefreshCw,
  ArrowUpRight
} from 'lucide-react';
import { AgentInfo, AgentId, ViewId } from '../../types';

interface AgentLiveTelemetry {
  agentId: AgentId;
  operationalStatus: 'active' | 'waiting_approval' | 'idle';
  currentTask: string;
  progress: number;
  queuedTasks: number;
  utilizationPercent: number;
  completedToday: number;
  latencyMs: number;
}

interface AgentActivityDashboardProps {
  agents: AgentInfo[];
  pendingApprovalsCount?: number;
  onNavigate?: (view: ViewId) => void;
  onOpenCommand?: () => void;
}

const INITIAL_TELEMETRY: Record<string, Omit<AgentLiveTelemetry, 'agentId'>> = {
  orchestrator: {
    operationalStatus: 'active',
    currentTask: 'Routing keyword brief "Perplexity Entity Citations"',
    progress: 82,
    queuedTasks: 6,
    utilizationPercent: 88,
    completedToday: 142,
    latencyMs: 390
  },
  research: {
    operationalStatus: 'active',
    currentTask: 'Mining LinkedIn & Facebook comment questions for GEO',
    progress: 68,
    queuedTasks: 5,
    utilizationPercent: 91,
    completedToday: 84,
    latencyMs: 1120
  },
  strategy: {
    operationalStatus: 'active',
    currentTask: 'Allocating Q4 content slots toward Commercial Intent',
    progress: 54,
    queuedTasks: 3,
    utilizationPercent: 72,
    completedToday: 39,
    latencyMs: 860
  },
  content: {
    operationalStatus: 'active',
    currentTask: 'Drafting pillar & social variations for "LLM Shield"',
    progress: 76,
    queuedTasks: 7,
    utilizationPercent: 94,
    completedToday: 118,
    latencyMs: 740
  },
  social: {
    operationalStatus: 'waiting_approval',
    currentTask: 'Awaiting Approval Gate sign-off for LinkedIn broadcast',
    progress: 100,
    queuedTasks: 5,
    utilizationPercent: 79,
    completedToday: 92,
    latencyMs: 510
  },
  community: {
    operationalStatus: 'active',
    currentTask: 'Classifying inbound Facebook & LinkedIn comments',
    progress: 63,
    queuedTasks: 4,
    utilizationPercent: 76,
    completedToday: 110,
    latencyMs: 480
  },
  leads: {
    operationalStatus: 'active',
    currentTask: 'Scoring enterprise buying signals from FinPulse VP',
    progress: 85,
    queuedTasks: 3,
    utilizationPercent: 81,
    completedToday: 64,
    latencyMs: 430
  },
  ads: {
    operationalStatus: 'waiting_approval',
    currentTask: 'Paused at Gate: Meta Ads $450/day benchmark campaign',
    progress: 100,
    queuedTasks: 2,
    utilizationPercent: 62,
    completedToday: 31,
    latencyMs: 810
  },
  seo: {
    operationalStatus: 'active',
    currentTask: 'Auditing GEO Score across Perplexity & ChatGPT Search',
    progress: 71,
    queuedTasks: 6,
    utilizationPercent: 89,
    completedToday: 95,
    latencyMs: 940
  },
  email: {
    operationalStatus: 'idle',
    currentTask: 'Lifecycle sequence armed for Enterprise trial cohort',
    progress: 100,
    queuedTasks: 1,
    utilizationPercent: 45,
    completedToday: 48,
    latencyMs: 660
  },
  analytics: {
    operationalStatus: 'active',
    currentTask: 'Correlating LinkedIn & Facebook CTR with keyword inputs',
    progress: 88,
    queuedTasks: 4,
    utilizationPercent: 86,
    completedToday: 77,
    latencyMs: 1180
  },
  memory: {
    operationalStatus: 'idle',
    currentTask: 'Indexed winning stat-spotlight hook pattern (+1.4% CTR)',
    progress: 100,
    queuedTasks: 2,
    utilizationPercent: 52,
    completedToday: 129,
    latencyMs: 310
  }
};

export const AgentActivityDashboard: React.FC<AgentActivityDashboardProps> = ({
  agents,
  onNavigate
}) => {
  const specializedAgents = useMemo(() => {
    return agents.length > 12 ? agents.slice(0, 12) : agents;
  }, [agents]);

  const [telemetryMap, setTelemetryMap] = useState<Record<string, AgentLiveTelemetry>>(() => {
    const initial: Record<string, AgentLiveTelemetry> = {};
    agents.forEach(ag => {
      const preset = INITIAL_TELEMETRY[ag.id] || {
        operationalStatus: ag.status,
        currentTask: `Executing ${ag.role} workflow`,
        progress: 65,
        queuedTasks: 3,
        utilizationPercent: 75,
        completedToday: 54,
        latencyMs: ag.stats.avgLatencyMs
      };
      initial[ag.id] = {
        agentId: ag.id,
        ...preset
      };
    });
    return initial;
  });

  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  const stepTelemetryCycle = () => {
    setTelemetryMap(prev => {
      const next: Record<string, AgentLiveTelemetry> = { ...prev };
      Object.keys(next).forEach(id => {
        const item = { ...next[id] };
        if (item.operationalStatus === 'active') {
          const delta = Math.floor(Math.random() * 14) + 6;
          if (item.progress + delta >= 100) {
            item.progress = 20;
            item.completedToday += 1;
          } else {
            item.progress += delta;
          }
        }
        next[id] = item;
      });
      return next;
    });
  };

  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(stepTelemetryCycle, 3500);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const handleDispatchTaskToAgent = (agent: AgentInfo) => {
    setTelemetryMap(prev => ({
      ...prev,
      [agent.id]: {
        ...prev[agent.id],
        operationalStatus: 'active',
        progress: 25,
        queuedTasks: (prev[agent.id]?.queuedTasks || 2) + 1
      }
    }));
  };

  const filteredAgents = useMemo(() => {
    return specializedAgents.filter(agent => {
      if (departmentFilter !== 'ALL' && agent.department !== departmentFilter) return false;
      return true;
    });
  }, [specializedAgents, departmentFilter]);

  const fleetMetrics = useMemo(() => {
    let activeCount = 0;
    let waitingGateCount = 0;
    let totalQueuedTasks = 0;
    let totalCompletedToday = 0;
    let totalLatency = 0;

    specializedAgents.forEach(ag => {
      const tel = telemetryMap[ag.id];
      const status = tel?.operationalStatus || ag.status;
      if (status === 'active') activeCount++;
      else if (status === 'waiting_approval') waitingGateCount++;
      totalQueuedTasks += tel?.queuedTasks || 2;
      totalCompletedToday += tel?.completedToday || 50;
      totalLatency += tel?.latencyMs || ag.stats.avgLatencyMs;
    });

    return {
      activeCount,
      waitingGateCount,
      totalQueuedTasks,
      totalCompletedToday,
      avgLatency: Math.round(totalLatency / Math.max(1, specializedAgents.length))
    };
  }, [specializedAgents, telemetryMap]);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-5">
      {/* Compact Single-Line Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Live Agent Fleet Telemetry</h3>
          <span className="text-xs text-neutral-400 tabular-nums">
            · {fleetMetrics.activeCount}/{specializedAgents.length} Active · {fleetMetrics.totalQueuedTasks} Queued
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              isLiveStreaming
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            {isLiveStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isLiveStreaming ? 'Live' : 'Paused'}</span>
          </button>

          <button
            onClick={stepTelemetryCycle}
            className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-800 flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
            <span>Step</span>
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('agents')}
              className="px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-emerald-400 text-xs font-semibold border border-neutral-800 flex items-center gap-1"
            >
              <span>All Agents</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Department Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-neutral-950 border border-neutral-800 w-fit">
        {[
          { id: 'ALL', label: 'All 12 Agents' },
          { id: 'RESEARCH', label: 'Research & SEO' },
          { id: 'CONTENT STUDIO', label: 'Content Studio' },
          { id: 'POSTING & COMMUNITY', label: 'Social & Leads' },
          { id: 'GROWTH', label: 'Growth & Memory' }
        ].map(dept => (
          <button
            key={dept.id}
            onClick={() => setDepartmentFilter(dept.id)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              departmentFilter === dept.id
                ? 'bg-neutral-800 text-emerald-300 font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {dept.label}
          </button>
        ))}
      </div>

      {/* Clean 3-Point Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredAgents.map(agent => {
          const tel = telemetryMap[agent.id];
          const status = tel?.operationalStatus || agent.status;
          const progress = tel?.progress ?? 70;
          const queued = tel?.queuedTasks ?? 3;

          return (
            <div
              key={agent.id}
              className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 flex flex-col justify-between space-y-3 hover:border-neutral-700 transition-all"
            >
              {/* 1. Title & Status */}
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-white truncate">{agent.name}</h4>
                <span
                  className={`text-[10px] font-semibold ${
                    status === 'active'
                      ? 'text-emerald-400'
                      : status === 'waiting_approval'
                      ? 'text-amber-400'
                      : 'text-neutral-500'
                  }`}
                >
                  {status === 'active'
                    ? 'Active'
                    : status === 'waiting_approval'
                    ? 'At Gate'
                    : 'Standby'}
                </span>
              </div>

              {/* 2. 1-Line Task & Progress */}
              <div className="space-y-1.5">
                <p className="text-[11px] text-neutral-300 truncate" title={tel?.currentTask || agent.description}>
                  {tel?.currentTask || agent.description}
                </p>
                <div className="h-1 w-full rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    style={{ width: `${progress}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      status === 'waiting_approval'
                        ? 'bg-amber-400'
                        : status === 'active'
                        ? 'bg-emerald-500'
                        : 'bg-neutral-600'
                    }`}
                  />
                </div>
              </div>

              {/* 3. Metric & Action */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400 tabular-nums">
                <span>Queue: <strong className="text-white">{queued}</strong></span>
                {status === 'waiting_approval' && onNavigate ? (
                  <button
                    onClick={() => onNavigate('approvals')}
                    className="text-amber-400 hover:underline font-semibold"
                  >
                    Review →
                  </button>
                ) : (
                  <button
                    onClick={() => handleDispatchTaskToAgent(agent)}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    + Dispatch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
