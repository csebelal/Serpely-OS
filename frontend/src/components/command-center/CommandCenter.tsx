import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  Play,
  RotateCcw
} from 'lucide-react';
import { ChatMessage, OrchestrationStep, ViewId } from '../../types';
import { planOrchestration } from '../../services/ai-orchestrator';

interface CommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewId) => void;
  onApproveItem?: (title: string) => void;
  brandName?: string;
  onStateSynced?: (newState: any) => void;
}

const PRESET_PROMPTS = [
  'Create a campaign for our new GEO Score feature',
  'Audit competitor citations in Perplexity and find content gaps',
  'Draft a LinkedIn post on zero-click search with carousel outline',
  'Scan community inbox for commercial buying signals and draft replies',
  'Plan a 7-day social distribution calendar for product launch',
  'Run hallucination scan across ChatGPT, Claude, and Gemini',
  'Summarize weekly marketing performance and funnel attribution'
];

export const CommandCenter: React.FC<CommandCenterProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onApproveItem,
  brandName = 'Nexus AI',
  onStateSynced
}) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Welcome to the ${brandName} AI Marketing Orchestrator. 

I coordinate our 11 specialized autonomous marketing agents (Research, Strategy, Content, SEO, Social, Email, Leads, Community, Analytics, Memory). 

Give me any high-level objective — I will decompose the strategy, assign the right agents, and halt at the Human Approval Gate before publishing or spending money.`,
      timestamp: 'Ready'
    }
  ]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || prompt).trim();
    if (!query || isProcessing) return;

    setPrompt('');
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    const plan = planOrchestration(query);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.state && onStateSynced) {
          onStateSynced(data.state);
        }
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply || plan.summary,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timeline: plan.steps
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('API request failed');
      }
    } catch {
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: `I've analyzed your objective: "${query}" and planned a multi-agent execution pipeline.

${plan.summary}

All low-risk research and drafting tasks will proceed automatically. High-risk publishing, ad spend, and external emails are gated below for your explicit sign-off.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timeline: plan.steps
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStepAction = (step: OrchestrationStep) => {
    if (step.agent === 'seo') onNavigate('seo');
    else if (step.agent === 'content') onNavigate('content');
    else if (step.agent === 'social') onNavigate('social');
    else if (step.agent === 'leads') onNavigate('leads');
    else if (step.agent === 'research' || step.agent === 'memory') onNavigate('marketing-hub');
    else onNavigate('approvals');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          onClick={e => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
            className="relative flex h-full w-full max-w-2xl flex-col border-l border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-800 px-6 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                AI Command Center
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Orchestrator Core
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Human-governed multi-agent task execution</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'init-1',
                    role: 'assistant',
                    content: 'Session reset. Provide an objective to launch a new multi-agent pipeline.',
                    timestamp: 'Reset'
                  }
                ]);
              }}
              title="Reset conversation"
              className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500">
                {msg.role === 'assistant' ? (
                  <>
                    <Bot className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">AI Orchestrator</span>
                  </>
                ) : (
                  <span className="text-neutral-300 font-semibold">Marketing Director</span>
                )}
                <span>·</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[90%] rounded-xl p-4 text-xs md:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-200 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Orchestration Pipeline Timeline */}
                {msg.timeline && msg.timeline.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                      <span className="font-semibold text-neutral-300 uppercase tracking-wider">
                        Execution Pipeline ({msg.timeline.length} Steps)
                      </span>
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <Play className="h-3 w-3 fill-emerald-400" /> Human Gate Enforced
                      </span>
                    </div>

                    <div className="space-y-2">
                      {msg.timeline.map((step, idx) => (
                        <div
                          key={step.id || idx}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-xs transition-colors ${
                            step.status === 'approval'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                              : step.status === 'completed'
                              ? 'bg-neutral-950/70 border-neutral-800 text-neutral-300'
                              : step.status === 'running'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                              : 'bg-neutral-950/40 border-neutral-800/60 text-neutral-400'
                          }`}
                        >
                          {/* Step Icon */}
                          <div className="mt-0.5">
                            {step.status === 'completed' ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : step.status === 'approval' ? (
                              <ShieldAlert className="h-4 w-4 text-amber-400 animate-pulse" />
                            ) : step.status === 'running' ? (
                              <div className="h-3.5 w-3.5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                            ) : (
                              <Clock className="h-4 w-4 text-neutral-600" />
                            )}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                                <span className="font-mono text-[10px] text-neutral-500">#{idx + 1}</span>
                                {step.label}
                              </span>
                              <span
                                className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                                  step.status === 'approval'
                                    ? 'bg-amber-500/20 text-amber-300 font-bold'
                                    : step.status === 'completed'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-neutral-800 text-neutral-400'
                                }`}
                              >
                                {step.status}
                              </span>
                            </div>

                            {step.detail && (
                              <p className="text-[11px] text-neutral-400 mt-0.5">{step.detail}</p>
                            )}

                            {step.output && (
                              <div className="mt-2 p-2 rounded bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-emerald-300">
                                ↳ {step.output}
                              </div>
                            )}

                            {/* Human Gate Action */}
                            {step.status === 'approval' && (
                              <div className="mt-2.5 flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    if (onApproveItem) onApproveItem(step.label);
                                    step.status = 'completed';
                                    step.output = 'Approved by Marketing Director';
                                    setMessages([...messages]);
                                  }}
                                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded transition-colors shadow-sm"
                                >
                                  Approve & Execute
                                </button>
                                <button
                                  onClick={() => handleStepAction(step)}
                                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded transition-colors"
                                >
                                  Inspect in Queue
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 animate-pulse">
              <Bot className="h-4 w-4 text-emerald-400 animate-spin" />
              <span>Orchestrator is querying knowledge base and planning agent assignments...</span>
            </div>
          )}
        </div>

        {/* Suggestion Prompts */}
        <div className="border-t border-neutral-800/80 p-4 bg-neutral-950">
          <div className="mb-2 text-[11px] font-mono text-neutral-400 font-semibold uppercase">
            Quick Scenarios
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {PRESET_PROMPTS.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(promptText)}
                className="text-left text-[11px] px-2.5 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-emerald-500/30 transition-colors truncate max-w-full"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-neutral-800 p-4 bg-neutral-900/60">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="State a campaign goal, prompt or request (e.g. 'Launch new GEO campaign')..."
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-xs md:text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isProcessing}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-neutral-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
