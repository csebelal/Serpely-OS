import React, { useState, useMemo } from 'react';
import {
  GitBranch,
  Mail,
  Clock,
  Zap,
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  Edit3,
  Send,
  Users,
  ArrowUp,
  ArrowDown,
  Pause,
  Sparkles,
  ShieldAlert,
  Layers,
  Eye,
  Check
} from 'lucide-react';
import {
  EmailSequenceWorkflow,
  SequenceNode,
  SequenceNodeType,
  SequenceStep,
  EmailTemplate,
  EmailContact
} from '../../types';

interface VisualSequenceBuilderProps {
  sequence: EmailSequenceWorkflow;
  templates: EmailTemplate[];
  contacts?: EmailContact[];
  smartTags?: string[];
  activeAppName?: string;
  smtpFromEmail?: string;
  onUpdateSequence: (updated: EmailSequenceWorkflow) => void;
  onEditTemplate: (template: EmailTemplate) => void;
  onSendTestTemplate?: (template: EmailTemplate) => void;
  onOpenApproval: (title: string, details: string) => void;
}

const QUICK_DELAY_PRESETS = [
  { label: 'Immediate (Day 0)', days: 0 },
  { label: 'Wait 1 Day', days: 1 },
  { label: 'Wait 2 Days', days: 2 },
  { label: 'Wait 3 Days', days: 3 },
  { label: 'Wait 5 Days', days: 5 },
  { label: 'Wait 7 Days', days: 7 },
  { label: 'Wait 14 Days', days: 14 }
];

export const VisualSequenceBuilder: React.FC<VisualSequenceBuilderProps> = ({
  sequence,
  templates,
  contacts = [],
  smartTags = ['All Contacts', 'SaaS Onboarding', 'Trial User', 'Feature Updates', 'Pro Plan'],
  activeAppName = 'Serpely GEO OS',
  smtpFromEmail = 'hello@yourdomain.com',
  onUpdateSequence,
  onEditTemplate,
  onSendTestTemplate,
  onOpenApproval
}) => {
  // User-friendly sub-mode: 'guided' (Easy Step-by-Step Timeline + Live Preview) vs 'branching' (Visual Node Graph)
  const [builderMode, setBuilderMode] = useState<'guided' | 'branching'>('guided');

  // Selected step in Guided mode
  const [selectedStepId, setSelectedStepId] = useState<string>(
    sequence.steps[0]?.id || ''
  );

  // Visual graph nodes state
  const [nodes, setNodes] = useState<SequenceNode[]>(sequence.nodes || []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    sequence.nodes?.[0]?.id || null
  );

  // Smart Tag Enrollment State
  const [enrollTag, setEnrollTag] = useState<string>('SaaS Onboarding');
  const [justEnrolledMsg, setJustEnrolledMsg] = useState<string | null>(null);

  // Simulation mode
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedPathChoice, setSimulatedPathChoice] = useState<'true' | 'false'>('true');
  const [activeSimNodeId, setActiveSimNodeId] = useState<string | null>(null);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  // Insert node menu in graph mode
  const [addingAfterNodeId, setAddingAfterNodeId] = useState<string | null>(null);

  // Sync state whenever active sequence changes
  React.useEffect(() => {
    const seqNodes = sequence.nodes || [];
    setNodes(seqNodes);
    setSelectedNodeId(seqNodes[0]?.id || null);
    setSelectedStepId(sequence.steps[0]?.id || '');
    setIsSimulating(false);
    setActiveSimNodeId(null);
    setSimulationLog([]);
  }, [sequence.id]);

  // Compute cumulative timeline day for each step so users immediately see "Day 0", "Day 2", "Day 5"
  const stepsWithCumulativeDay = useMemo(() => {
    let runningDay = 0;
    return sequence.steps.map((step, index) => {
      if (index === 0) {
        runningDay = step.delayDays || 0;
      } else {
        runningDay += step.delayDays || 0;
      }
      return {
        ...step,
        cumulativeDay: runningDay
      };
    });
  }, [sequence.steps]);

  const selectedStep = useMemo(() => {
    return (
      stepsWithCumulativeDay.find((s) => s.id === selectedStepId) ||
      stepsWithCumulativeDay[0] ||
      null
    );
  }, [stepsWithCumulativeDay, selectedStepId]);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null;
  }, [nodes, selectedNodeId]);

  // Matching contacts count for quick enrollment
  const matchingTagContacts = useMemo(() => {
    if (enrollTag === 'All Contacts') return contacts.length;
    return contacts.filter((c) =>
      c.tags.some((t) => t.toLowerCase() === enrollTag.toLowerCase())
    ).length;
  }, [contacts, enrollTag]);

  // Toggle Sequence Active / Paused status
  const handleToggleSequenceStatus = () => {
    const nextStatus = sequence.status === 'active' ? 'paused' : 'active';
    onUpdateSequence({
      ...sequence,
      status: nextStatus
    });
  };

  // Enroll contacts from Smart Tag into this sequence
  const handleEnrollSmartTag = () => {
    const countToAdd = Math.max(matchingTagContacts, 1);
    const updated: EmailSequenceWorkflow = {
      ...sequence,
      status: 'active',
      targetAudience: `${enrollTag} Segment (${activeAppName})`,
      overallMetrics: {
        ...sequence.overallMetrics,
        enrolled: sequence.overallMetrics.enrolled + countToAdd
      },
      steps: sequence.steps.map((s, idx) =>
        idx === 0
          ? {
              ...s,
              stats: {
                ...s.stats,
                sent: s.stats.sent + countToAdd
              }
            }
          : s
      )
    };
    onUpdateSequence(updated);
    setJustEnrolledMsg(`Enrolled ${countToAdd} "${enrollTag}" contact(s) into sequence!`);
    setTimeout(() => setJustEnrolledMsg(null), 3500);
  };

  // Update a Guided Step
  const handleUpdateStep = (updatedStep: SequenceStep) => {
    const nextSteps = sequence.steps.map((s) =>
      s.id === updatedStep.id ? updatedStep : s
    );
    onUpdateSequence({
      ...sequence,
      steps: nextSteps
    });
  };

  // Add a new Email Step in Guided Mode
  const handleAddGuidedStep = (afterStepIndex?: number) => {
    const defaultTpl = templates[0];
    const insertIdx =
      afterStepIndex !== undefined ? afterStepIndex + 1 : sequence.steps.length;
    const newStep: SequenceStep = {
      id: `step-${Date.now()}`,
      stepNumber: insertIdx + 1,
      delayDays: insertIdx === 0 ? 0 : 2,
      templateId: defaultTpl?.id || 'tpl-1',
      subjectLine: defaultTpl?.subjectLine || 'Quick follow-up on your {{app_name}} workspace',
      previewSnippet:
        defaultTpl?.preheader || 'Here is a quick tip to help your team get the most out of {{app_name}}',
      status: 'active',
      stats: { sent: 0, openRate: 52.0, clickRate: 16.5, replyRate: 4.2 }
    };

    const nextSteps = [...sequence.steps];
    nextSteps.splice(insertIdx, 0, newStep);
    const renumbered = nextSteps.map((st, i) => ({
      ...st,
      stepNumber: i + 1
    }));

    onUpdateSequence({
      ...sequence,
      steps: renumbered
    });
    setSelectedStepId(newStep.id);
  };

  // Move a step Up or Down
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sequence.steps.length) return;
    const copy = [...sequence.steps];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    const renumbered = copy.map((st, i) => ({
      ...st,
      stepNumber: i + 1
    }));
    onUpdateSequence({
      ...sequence,
      steps: renumbered
    });
  };

  // Delete a step
  const handleDeleteStep = (stepId: string) => {
    if (sequence.steps.length <= 1) return;
    const filtered = sequence.steps
      .filter((s) => s.id !== stepId)
      .map((st, i) => ({ ...st, stepNumber: i + 1 }));
    onUpdateSequence({
      ...sequence,
      steps: filtered
    });
    if (selectedStepId === stepId) {
      setSelectedStepId(filtered[0]?.id || '');
    }
  };

  // Group nodes into main trunk and branches for Visual Graph mode
  const conditionNode = nodes.find((n) => n.type === 'condition');
  const isBranchNode = (n: SequenceNode) =>
    n.id.includes('7a') ||
    n.id.includes('8a') ||
    n.id.includes('9a') ||
    n.id.includes('7b') ||
    n.id.includes('8b') ||
    n.id.includes('9b') ||
    (n as any).branch === 'true' ||
    (n as any).branch === 'false' ||
    n.id.includes('true') ||
    n.id.includes('false');

  const mainTrunkNodes = conditionNode
    ? nodes.filter((n) => {
        const condIdx = nodes.findIndex((x) => x.id === conditionNode.id);
        const thisIdx = nodes.findIndex((x) => x.id === n.id);
        return !isBranchNode(n) && (thisIdx <= condIdx || condIdx === -1);
      })
    : nodes;

  const trueBranchNodes = conditionNode
    ? nodes.filter(
        (n) =>
          n.id.includes('7a') ||
          n.id.includes('8a') ||
          n.id.includes('9a') ||
          (n as any).branch === 'true' ||
          n.id.includes('true')
      )
    : [];

  const falseBranchNodes = conditionNode
    ? nodes.filter(
        (n) =>
          n.id.includes('7b') ||
          n.id.includes('8b') ||
          n.id.includes('9b') ||
          (n as any).branch === 'false' ||
          n.id.includes('false')
      )
    : [];

  const updateNode = (updated: SequenceNode) => {
    const newNodes = nodes.map((n) => (n.id === updated.id ? updated : n));
    setNodes(newNodes);
    onUpdateSequence({ ...sequence, nodes: newNodes });
  };

  const deleteNode = (id: string) => {
    if (nodes.length <= 2) return;
    const newNodes = nodes.filter((n) => n.id !== id);
    setNodes(newNodes);
    if (selectedNodeId === id) setSelectedNodeId(newNodes[0]?.id || null);
    onUpdateSequence({ ...sequence, nodes: newNodes });
  };

  const insertNode = (afterId: string, type: SequenceNodeType) => {
    const afterIdx = nodes.findIndex((n) => n.id === afterId);
    const newId = `node-${Date.now()}`;
    const isInTrue = trueBranchNodes.some((n) => n.id === afterId);
    const isInFalse = falseBranchNodes.some((n) => n.id === afterId);
    const branchTag = isInTrue ? 'true' : isInFalse ? 'false' : undefined;

    let newNode: SequenceNode;
    if (type === 'email') {
      newNode = {
        id: newId,
        type: 'email',
        title: `Email: ${templates[0]?.name || 'Follow-Up Email'}`,
        subtitle: `Subject: ${templates[0]?.subjectLine || 'Custom Subject'}`,
        templateId: templates[0]?.id,
        status: 'active',
        stats: { entered: 0, completed: 0, dropoffRate: 0 },
        ...(branchTag ? { branch: branchTag } : {})
      } as SequenceNode;
    } else if (type === 'delay') {
      newNode = {
        id: newId,
        type: 'delay',
        title: 'Wait 3 Days',
        subtitle: 'Pause before next email step',
        delayDays: 3,
        status: 'active',
        stats: { entered: 0, completed: 0, dropoffRate: 0 },
        ...(branchTag ? { branch: branchTag } : {})
      } as SequenceNode;
    } else if (type === 'condition') {
      newNode = {
        id: newId,
        type: 'condition',
        title: 'If/Else Branch: Clicked Onboarding Link?',
        subtitle: 'Splits engaged users vs inactive users',
        condition: {
          conditionType: 'link_clicked',
          description: 'Checks if subscriber clicked CTA link in previous email',
          trueNextNodeId: 'node-true-branch',
          falseNextNodeId: 'node-false-branch'
        },
        status: 'active',
        stats: { entered: 0, completed: 0, dropoffRate: 0 }
      };
    } else {
      newNode = {
        id: newId,
        type: 'action',
        title: 'Update Smart Tag / CRM Status',
        subtitle: 'Tag subscriber as Activated User',
        actionType: 'tag_lead',
        status: 'active',
        stats: { entered: 0, completed: 0, dropoffRate: 0 },
        ...(branchTag ? { branch: branchTag } : {})
      } as SequenceNode;
    }

    const newNodes = [...nodes];
    newNodes.splice(afterIdx + 1, 0, newNode);
    setNodes(newNodes);
    setSelectedNodeId(newId);
    setAddingAfterNodeId(null);
    onUpdateSequence({ ...sequence, nodes: newNodes });
  };

  // Run Live Journey Simulation
  const handleStartSimulation = () => {
    setIsSimulating(true);
    setSimulationLog([
      `[Day 0] Enrolled subscriber Sarah @ NeoLedger into "${sequence.name}" via Business SMTP (${smtpFromEmail})`
    ]);

    if (builderMode === 'guided') {
      let idx = 0;
      const orderedSteps = stepsWithCumulativeDay;
      if (orderedSteps.length === 0) {
        setIsSimulating(false);
        return;
      }
      setSelectedStepId(orderedSteps[0].id);
      setActiveSimNodeId(orderedSteps[0].id);

      const timer = setInterval(() => {
        if (idx >= orderedSteps.length) {
          clearInterval(timer);
          setIsSimulating(false);
          setActiveSimNodeId(null);
          setSimulationLog((prev) => [
            ...prev,
            `[Journey Complete] All ${orderedSteps.length} sequence emails delivered via Business SMTP.`
          ]);
          return;
        }
        const st = orderedSteps[idx];
        setSelectedStepId(st.id);
        setActiveSimNodeId(st.id);
        setSimulationLog((prev) => [
          ...prev,
          `[Day ${st.cumulativeDay}] Sent Step #${st.stepNumber}: "${st.subjectLine}" (Open Rate: ${st.stats.openRate}%)`
        ]);
        idx++;
      }, 950);
      return;
    }

    // Branching Graph Simulation
    const simulationSequence = conditionNode
      ? [
          ...mainTrunkNodes.map((n) => n.id),
          ...(simulatedPathChoice === 'true'
            ? trueBranchNodes.map((n) => n.id)
            : falseBranchNodes.map((n) => n.id))
        ]
      : mainTrunkNodes.map((n) => n.id);

    let step = 0;
    setActiveSimNodeId(simulationSequence[0] || null);
    const interval = setInterval(() => {
      step++;
      if (step >= simulationSequence.length) {
        clearInterval(interval);
        setIsSimulating(false);
        setActiveSimNodeId(null);
        setSimulationLog((prev) => [
          ...prev,
          `[Completed] Sequence finished via ${
            conditionNode
              ? simulatedPathChoice === 'true'
                ? 'YES (Engaged Fast-Track)'
                : 'NO (Re-engagement Nurture)'
              : 'primary'
          } path.`
        ]);
        return;
      }

      const activeId = simulationSequence[step];
      const nodeObj = nodes.find((n) => n.id === activeId);
      setActiveSimNodeId(activeId);
      setSelectedNodeId(activeId);

      if (nodeObj?.type === 'email') {
        setSimulationLog((prev) => [
          ...prev,
          `[Email Dispatched] "${nodeObj.title}" sent via ${smtpFromEmail}.`
        ]);
      } else if (nodeObj?.type === 'delay') {
        setSimulationLog((prev) => [
          ...prev,
          `[Wait Timer] Paused ${nodeObj.delayDays} day(s) before next step.`
        ]);
      } else if (nodeObj?.type === 'condition') {
        setSimulationLog((prev) => [
          ...prev,
          `[Branch Check] Link Clicked = ${simulatedPathChoice.toUpperCase()} → Routing subscriber.`
        ]);
      } else if (nodeObj?.type === 'action') {
        setSimulationLog((prev) => [
          ...prev,
          `[Action Executed] ${nodeObj.title}.`
        ]);
      }
    }, 900);
  };

  // Total duration of sequence in days
  const totalSequenceDays = useMemo(() => {
    if (stepsWithCumulativeDay.length === 0) return 0;
    return stepsWithCumulativeDay[stepsWithCumulativeDay.length - 1].cumulativeDay;
  }, [stepsWithCumulativeDay]);

  // Currently inspected template (either from Guided Step or Graph Node)
  const inspectedTemplate = useMemo(() => {
    if (builderMode === 'guided' && selectedStep) {
      return (
        templates.find((t) => t.id === selectedStep.templateId) || templates[0]
      );
    }
    if (builderMode === 'branching' && selectedNode?.type === 'email') {
      return (
        templates.find((t) => t.id === selectedNode.templateId) || templates[0]
      );
    }
    return null;
  }, [builderMode, selectedStep, selectedNode, templates]);

  return (
    <div className="space-y-5">
      {/* ================================================================= */}
      {/* 1. SEQUENCE CONTROL HEADER + 4-METRIC KPI STRIP                   */}
      {/* ================================================================= */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span
                className={
                  sequence.status === 'active'
                    ? 'text-emerald-400 font-bold'
                    : 'text-amber-400 font-bold'
                }
              >
                ● {sequence.status === 'active' ? 'ACTIVE AUTOMATION' : 'PAUSED'}
              </span>
              <span aria-hidden="true" className="text-neutral-600">
                ·
              </span>
              <span className="text-neutral-300">
                Trigger: <strong className="text-white">{sequence.triggerEvent}</strong>
              </span>
              <span aria-hidden="true" className="text-neutral-600">
                ·
              </span>
              <span className="text-neutral-400 tabular-nums">
                {sequence.steps.length} Emails over {totalSequenceDays} Days
              </span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-white">{sequence.name}</h3>
            <p className="text-xs text-neutral-400">{sequence.description}</p>
          </div>

          {/* Right Controls: Mode Switcher, Pause/Resume, Test Simulation */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Toggle: Easy Step-by-Step vs Branching Flow Graph */}
            <div className="flex items-center bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => setBuilderMode('guided')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  builderMode === 'guided'
                    ? 'bg-emerald-500 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Easy Step-by-Step</span>
              </button>
              <button
                type="button"
                onClick={() => setBuilderMode('branching')}
                className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                  builderMode === 'branching'
                    ? 'bg-emerald-500 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <GitBranch className="h-3.5 w-3.5" />
                <span>If/Else Branch Graph</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleToggleSequenceStatus}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                sequence.status === 'active'
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-amber-300 border-neutral-800'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {sequence.status === 'active' ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause Sequence</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Activate Sequence</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleStartSimulation}
              disabled={isSimulating}
              className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Play className="h-3.5 w-3.5 fill-neutral-950" />
              <span>{isSimulating ? 'Simulating Journey...' : 'Simulate Sequence'}</span>
            </button>
          </div>
        </div>

        {/* 4-Column KPI Summary Bar + 1-Click Smart Tag Enrollment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4 border-t border-neutral-800 items-center">
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs tabular-nums">
            <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80">
              <div className="text-[10px] text-neutral-500 uppercase">Enrolled Users</div>
              <div className="text-base font-bold text-white mt-0.5">
                {sequence.overallMetrics.enrolled.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80">
              <div className="text-[10px] text-neutral-500 uppercase">Completed</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {sequence.overallMetrics.completed.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80">
              <div className="text-[10px] text-neutral-500 uppercase">Avg Open Rate</div>
              <div className="text-base font-bold text-white mt-0.5">
                {sequence.overallMetrics.avgOpenRate}%
              </div>
            </div>
            <div className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80">
              <div className="text-[10px] text-neutral-500 uppercase">Avg Click Rate</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {sequence.overallMetrics.avgClickRate}%
              </div>
            </div>
          </div>

          {/* 1-Click Enroll Smart Tag Segment */}
          <div className="lg:col-span-5 p-3 rounded-lg bg-neutral-950/80 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs">
              <div className="font-mono text-[10px] text-emerald-400 uppercase font-semibold">
                1-Click Smart Tag Enrollment
              </div>
              <div className="text-neutral-400 text-[11px]">
                Auto-enroll subscribers by Smart Tag
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={enrollTag}
                onChange={(e) => setEnrollTag(e.target.value)}
                className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs"
              >
                {smartTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleEnrollSmartTag}
                className="px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Enroll ({matchingTagContacts})</span>
              </button>
            </div>
          </div>
        </div>

        {justEnrolledMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{justEnrolledMsg}</span>
          </div>
        )}
      </div>

      {/* Live Simulation Progress Console */}
      {simulationLog.length > 0 && (
        <div className="p-4 rounded-xl bg-neutral-950 border border-emerald-500/30 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-emerald-400 font-bold flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Live Subscriber Sequence Walkthrough
            </span>
            <button
              type="button"
              onClick={() => {
                setSimulationLog([]);
                setIsSimulating(false);
                setActiveSimNodeId(null);
              }}
              className="text-neutral-400 hover:text-white text-[11px]"
            >
              Close Walkthrough ✕
            </button>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] text-neutral-300">
            {simulationLog.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-emerald-400">→</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. MAIN WORKSPACE: LEFT (TIMELINE OR GRAPH) + RIGHT (INSPECTOR)   */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =============================================================== */}
        {/* LEFT 7 COLUMNS: EASY STEP-BY-STEP BUILDER OR BRANCHING GRAPH    */}
        {/* =============================================================== */}
        <div className="lg:col-span-7 rounded-xl border border-neutral-800 bg-neutral-950/80 p-5 space-y-4">
          {builderMode === 'guided' ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">
                    Step-by-Step Email Timeline
                  </span>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Click any step to preview its email, change wait days in 1 click, or reorder steps.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddGuidedStep()}
                  className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Email Step</span>
                </button>
              </div>

              {/* Start Trigger Banner */}
              <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-emerald-400 uppercase font-semibold">
                      Sequence Entry Trigger
                    </div>
                    <div className="font-bold text-white">{sequence.triggerEvent}</div>
                  </div>
                </div>
                <div className="text-right font-mono text-[11px] text-neutral-400">
                  Audience: <span className="text-neutral-200">{sequence.targetAudience}</span>
                </div>
              </div>

              {/* Step Cards List */}
              <div className="space-y-3">
                {stepsWithCumulativeDay.map((step, index) => {
                  const isSelected = selectedStep?.id === step.id;
                  const isSimActive = activeSimNodeId === step.id;
                  const assignedTpl = templates.find((t) => t.id === step.templateId);

                  return (
                    <React.Fragment key={step.id}>
                      {/* Wait / Delay Bar above Step */}
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-neutral-900/40 border border-neutral-800/70 text-xs font-mono">
                        <div className="flex items-center gap-2 text-amber-300">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {index === 0 && step.delayDays === 0
                              ? 'Day 0 · Send Immediately on Enrollment'
                              : `Day ${step.cumulativeDay} · Wait ${step.delayDays} Day${
                                  step.delayDays === 1 ? '' : 's'
                                } after previous step`}
                          </span>
                        </div>

                        {/* Quick 1-Click Delay Day Selector */}
                        <div className="flex items-center gap-1">
                          {[0, 1, 2, 3, 5, 7].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStep({ ...step, delayDays: d });
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                                step.delayDays === d
                                  ? 'bg-amber-500 text-neutral-950 font-bold'
                                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                              }`}
                              title={d === 0 ? 'Send immediately' : `Wait ${d} days`}
                            >
                              {d === 0 ? '0d' : `+${d}d`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Step Card */}
                      <div
                        onClick={() => setSelectedStepId(step.id)}
                        className={`cursor-pointer rounded-xl border p-4 transition-all ${
                          isSimActive
                            ? 'bg-emerald-950/30 border-emerald-400 ring-2 ring-emerald-400/40'
                            : isSelected
                            ? 'bg-neutral-900 border-emerald-400 ring-1 ring-emerald-400/20'
                            : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                              <span className="text-emerald-400 font-bold">
                                STEP {step.stepNumber}
                              </span>
                              <span aria-hidden="true" className="text-neutral-600">
                                ·
                              </span>
                              <span className="text-neutral-300">
                                Day {step.cumulativeDay}
                              </span>
                              <span aria-hidden="true" className="text-neutral-600">
                                ·
                              </span>
                              <span className="text-neutral-400">
                                Template: <strong className="text-neutral-200">{assignedTpl?.name || 'Custom Email'}</strong>
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-white font-mono">
                              Subject: {step.subjectLine}
                            </h4>
                            <p className="text-xs text-neutral-400 line-clamp-2">
                              {step.previewSnippet}
                            </p>

                            {/* Step Performance Metrics */}
                            <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] font-mono tabular-nums text-neutral-400">
                              <span>
                                Sent: <strong className="text-white">{step.stats.sent}</strong>
                              </span>
                              <span>
                                Open Rate:{' '}
                                <strong className="text-emerald-400">{step.stats.openRate}%</strong>
                              </span>
                              <span>
                                Click Rate:{' '}
                                <strong className="text-white">{step.stats.clickRate}%</strong>
                              </span>
                            </div>
                          </div>

                          {/* Quick Step Action Buttons */}
                          <div
                            className="flex sm:flex-col items-center gap-1.5 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={index === 0}
                                onClick={() => handleMoveStep(index, 'up')}
                                className="p-1.5 rounded bg-neutral-950 hover:bg-neutral-800 disabled:opacity-30 text-neutral-300 border border-neutral-800"
                                title="Move Step Up"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={index === stepsWithCumulativeDay.length - 1}
                                onClick={() => handleMoveStep(index, 'down')}
                                className="p-1.5 rounded bg-neutral-950 hover:bg-neutral-800 disabled:opacity-30 text-neutral-300 border border-neutral-800"
                                title="Move Step Down"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={stepsWithCumulativeDay.length <= 1}
                                onClick={() => handleDeleteStep(step.id)}
                                className="p-1.5 rounded bg-neutral-950 hover:bg-red-950/50 disabled:opacity-30 text-neutral-400 hover:text-red-400 border border-neutral-800"
                                title="Delete Step"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {assignedTpl && (
                              <button
                                type="button"
                                onClick={() => onEditTemplate(assignedTpl)}
                                className="w-full px-2.5 py-1.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 whitespace-nowrap"
                              >
                                <Edit3 className="h-3 w-3" />
                                <span>Edit Design</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Insert Step Here Divider */}
                      <div className="flex items-center justify-center py-0.5">
                        <button
                          type="button"
                          onClick={() => handleAddGuidedStep(index)}
                          className="px-3 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-emerald-300 border border-neutral-800 text-[11px] font-mono flex items-center gap-1 transition-colors"
                        >
                          <Plus className="h-3 w-3 text-emerald-400" />
                          <span>Insert Follow-Up Email After Step {step.stepNumber}</span>
                        </button>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </>
          ) : (
            /* ============================================================= */
            /* VISUAL IF/ELSE BRANCHING NODE GRAPH                           */
            /* ============================================================= */
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">
                    Interactive If/Else Branching Flow Graph
                  </span>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Route subscribers into YES (Clicked) or NO (Inactive) tracks automatically.
                  </p>
                </div>

                {/* Simulation Path Toggle */}
                <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono">
                  <span className="text-neutral-400 pl-1.5 text-[11px]">Test Path:</span>
                  <button
                    type="button"
                    onClick={() => setSimulatedPathChoice('true')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                      simulatedPathChoice === 'true'
                        ? 'bg-emerald-500 text-neutral-950'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    YES (Clicked)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulatedPathChoice('false')}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                      simulatedPathChoice === 'false'
                        ? 'bg-amber-500 text-neutral-950'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    NO (Inactive)
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-2 py-2 max-w-xl mx-auto">
                {mainTrunkNodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isSimActive = activeSimNodeId === node.id;
                  const isCondition = node.type === 'condition';

                  return (
                    <React.Fragment key={node.id}>
                      <div
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`cursor-pointer w-full rounded-xl border p-4 transition-all ${
                          isSimActive
                            ? 'bg-emerald-950/30 border-emerald-400 ring-2 ring-emerald-400/40'
                            : isSelected
                            ? 'bg-neutral-900 border-emerald-400 ring-1 ring-emerald-400/20'
                            : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                                node.type === 'trigger'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : node.type === 'email'
                                  ? 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/30'
                                  : node.type === 'delay'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              }`}
                            >
                              {node.type === 'trigger' && <Zap className="h-4 w-4" />}
                              {node.type === 'email' && <Mail className="h-4 w-4" />}
                              {node.type === 'delay' && <Clock className="h-4 w-4" />}
                              {node.type === 'condition' && <GitBranch className="h-4 w-4" />}
                              {node.type === 'action' && <CheckCircle2 className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="text-[10px] font-mono uppercase text-neutral-400">
                                {node.type}
                                {node.delayDays !== undefined ? ` · ${node.delayDays}d wait` : ''}
                              </div>
                              <h4 className="text-xs md:text-sm font-bold text-white">
                                {node.title}
                              </h4>
                              {node.subtitle && (
                                <p className="text-[11px] text-neutral-400 mt-0.5">
                                  {node.subtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          {node.stats && (
                            <div className="text-right font-mono text-[11px] tabular-nums text-neutral-400">
                              <strong className="text-white">{node.stats.entered}</strong> entered
                            </div>
                          )}
                        </div>
                      </div>

                      {!isCondition && (
                        <div className="flex flex-col items-center my-1 relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddingAfterNodeId(
                                addingAfterNodeId === node.id ? null : node.id
                              );
                            }}
                            className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-emerald-500/50 text-[11px] font-mono flex items-center gap-1 transition-colors"
                          >
                            <Plus className="h-3 w-3 text-emerald-400" />
                            <span>Add Step</span>
                          </button>

                          {addingAfterNodeId === node.id && (
                            <div className="mt-1.5 z-30 p-2 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl flex flex-wrap gap-2 text-xs font-mono">
                              <button
                                type="button"
                                onClick={() => insertNode(node.id, 'email')}
                                className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 flex items-center gap-1.5"
                              >
                                <Mail className="h-3 w-3 text-emerald-400" /> + Email
                              </button>
                              <button
                                type="button"
                                onClick={() => insertNode(node.id, 'delay')}
                                className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 flex items-center gap-1.5"
                              >
                                <Clock className="h-3 w-3 text-amber-400" /> + Delay
                              </button>
                              <button
                                type="button"
                                onClick={() => insertNode(node.id, 'condition')}
                                className="px-2.5 py-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 flex items-center gap-1.5"
                              >
                                <GitBranch className="h-3 w-3 text-purple-400" /> + If/Else Branch
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {conditionNode && (
                  <div className="w-full pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* YES BRANCH */}
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 text-xs font-mono">
                        <span className="font-bold text-emerald-400">
                          ✓ YES: CLICKED LINK
                        </span>
                        <span className="text-[11px] text-emerald-300 tabular-nums">49.5%</span>
                      </div>
                      {trueBranchNodes.map((node) => (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`cursor-pointer rounded-lg border p-3 transition-all ${
                            selectedNodeId === node.id
                              ? 'bg-neutral-900 border-emerald-400'
                              : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="text-[10px] font-mono uppercase text-emerald-400">
                            {node.type}
                          </div>
                          <div className="text-xs font-bold text-white mt-0.5">{node.title}</div>
                          {node.subtitle && (
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                              {node.subtitle}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* NO BRANCH */}
                    <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 text-xs font-mono">
                        <span className="font-bold text-amber-300">
                          ✕ NO: NOT CLICKED YET
                        </span>
                        <span className="text-[11px] text-amber-300 tabular-nums">50.5%</span>
                      </div>
                      {falseBranchNodes.map((node) => (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNodeId(node.id)}
                          className={`cursor-pointer rounded-lg border p-3 transition-all ${
                            selectedNodeId === node.id
                              ? 'bg-neutral-900 border-amber-400'
                              : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="text-[10px] font-mono uppercase text-amber-400">
                            {node.type}
                          </div>
                          <div className="text-xs font-bold text-white mt-0.5">{node.title}</div>
                          {node.subtitle && (
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                              {node.subtitle}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =============================================================== */}
        {/* RIGHT 5 COLUMNS: STEP EDITOR & LIVE MINI EMAIL PREVIEW          */}
        {/* =============================================================== */}
        <div className="lg:col-span-5 rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-5 sticky top-6">
          {builderMode === 'guided' && selectedStep ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                    Step #{selectedStep.stepNumber} Inspector · Day {selectedStep.cumulativeDay}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    Configure Step Timing & Email Content
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={sequence.steps.length <= 1}
                  onClick={() => handleDeleteStep(selectedStep.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 disabled:opacity-30"
                  title="Remove Step"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* 1-Click Wait Delay Presets */}
              <div className="space-y-1.5 text-xs">
                <label className="text-neutral-400 font-mono block">
                  When should this email be sent?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {QUICK_DELAY_PRESETS.map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() =>
                        handleUpdateStep({ ...selectedStep, delayDays: preset.days })
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors text-left ${
                        selectedStep.delayDays === preset.days
                          ? 'bg-emerald-500 text-neutral-950 font-bold'
                          : 'bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Selector */}
              <div className="space-y-1 text-xs">
                <label className="text-neutral-400 font-mono block">
                  Assigned SaaS Email Template
                </label>
                <select
                  value={selectedStep.templateId}
                  onChange={(e) => {
                    const tpl = templates.find((t) => t.id === e.target.value);
                    if (tpl) {
                      handleUpdateStep({
                        ...selectedStep,
                        templateId: tpl.id,
                        subjectLine: tpl.subjectLine,
                        previewSnippet: tpl.preheader
                      });
                    }
                  }}
                  className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Editable Subject Line Override */}
              <div className="space-y-1 text-xs">
                <label className="text-neutral-400 font-mono block">
                  Step Subject Line
                </label>
                <input
                  type="text"
                  value={selectedStep.subjectLine}
                  onChange={(e) =>
                    handleUpdateStep({ ...selectedStep, subjectLine: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white font-mono text-xs"
                />
              </div>

              {/* Editable Preheader Snippet */}
              <div className="space-y-1 text-xs">
                <label className="text-neutral-400 font-mono block">
                  Inbox Preview Snippet (Preheader)
                </label>
                <input
                  type="text"
                  value={selectedStep.previewSnippet}
                  onChange={(e) =>
                    handleUpdateStep({ ...selectedStep, previewSnippet: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              {/* Live Mini Email Preview Card */}
              {inspectedTemplate && (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Eye className="h-3.5 w-3.5" />
                      <span>LIVE STEP EMAIL PREVIEW</span>
                    </span>
                    <span>From: {smtpFromEmail}</span>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-3 text-xs">
                    <div className="border-b border-neutral-800 pb-2 space-y-0.5">
                      <div className="font-bold text-white font-mono">
                        {selectedStep.subjectLine}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {selectedStep.previewSnippet}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-900/90 border border-neutral-800/90 space-y-2">
                      <div className="text-xs font-bold text-emerald-400">
                        {inspectedTemplate.headerTitle}
                      </div>
                      <p className="text-xs text-neutral-300 whitespace-pre-line line-clamp-4 leading-relaxed">
                        {inspectedTemplate.bodyContent}
                      </p>
                      {inspectedTemplate.highlightBox && (
                        <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-mono text-neutral-400">
                              {inspectedTemplate.highlightBox.title}
                            </div>
                            <div className="text-xs text-neutral-300">
                              {inspectedTemplate.highlightBox.caption}
                            </div>
                          </div>
                          <span className="font-mono text-sm font-bold text-emerald-400">
                            {inspectedTemplate.highlightBox.value}
                          </span>
                        </div>
                      )}
                      <div className="pt-1">
                        <span className="inline-block px-3 py-1.5 rounded-md bg-emerald-500 text-neutral-950 font-bold text-xs">
                          {inspectedTemplate.ctaText} →
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onEditTemplate(inspectedTemplate)}
                        className="flex-1 py-2 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Customize in Visual / HTML Studio</span>
                      </button>
                      {onSendTestTemplate && (
                        <button
                          type="button"
                          onClick={() => onSendTestTemplate(inspectedTemplate)}
                          className="py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs border border-neutral-700 flex items-center gap-1.5 whitespace-nowrap"
                          title="Send a test of this step via Business SMTP"
                        >
                          <Send className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Send Test</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() =>
                    onOpenApproval(
                      `Sequence Update: ${sequence.name}`,
                      `Configured ${sequence.steps.length} automated steps (${totalSequenceDays}-day lifecycle) for ${sequence.targetAudience}.`
                    )
                  }
                  className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  <span>Save & Activate Sequence Workflow</span>
                </button>
              </div>
            </div>
          ) : selectedNode ? (
            /* Inspector when in Branching Graph Mode */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">
                    Graph Node Inspector
                  </span>
                  <h3 className="text-sm font-bold text-white capitalize">
                    {selectedNode.type} Step
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => deleteNode(selectedNode.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-neutral-400 font-mono block">Step Title</label>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={(e) => updateNode({ ...selectedNode, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                />
              </div>

              {selectedNode.type === 'email' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-neutral-400 font-mono block mb-1">
                      Assigned Email Template
                    </label>
                    <select
                      value={selectedNode.templateId || templates[0]?.id}
                      onChange={(e) => {
                        const chosen = templates.find((t) => t.id === e.target.value);
                        updateNode({
                          ...selectedNode,
                          templateId: e.target.value,
                          subtitle: `Template: ${chosen?.name || 'Custom'}`
                        });
                      }}
                      className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs"
                    >
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.category})
                        </option>
                      ))}
                    </select>
                  </div>
                  {inspectedTemplate && (
                    <button
                      type="button"
                      onClick={() => onEditTemplate(inspectedTemplate)}
                      className="w-full py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-semibold text-xs flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Open in Visual / HTML Studio</span>
                    </button>
                  )}
                </div>
              )}

              {selectedNode.type === 'delay' && (
                <div className="space-y-3 text-xs">
                  <label className="text-neutral-400 font-mono block">
                    Quick Wait Duration
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {QUICK_DELAY_PRESETS.map((preset) => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() =>
                          updateNode({
                            ...selectedNode,
                            delayDays: preset.days,
                            title:
                              preset.days === 0
                                ? 'Send Immediately'
                                : `Wait ${preset.days} Days`
                          })
                        }
                        className={`px-2.5 py-1.5 rounded-lg font-mono text-xs ${
                          selectedNode.delayDays === preset.days
                            ? 'bg-amber-500 text-neutral-950 font-bold'
                            : 'bg-neutral-950 text-neutral-300 border border-neutral-800'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() =>
                    onOpenApproval(
                      `Sequence Update: ${sequence.name}`,
                      `Updated branching logic for ${sequence.name}.`
                    )
                  }
                  className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>Save Branching Workflow</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
