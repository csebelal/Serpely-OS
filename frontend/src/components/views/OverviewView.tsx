import React from 'react';
import { motion } from 'motion/react';
import {
  Layers,
  Bot,
  ArrowRight,
  Database,
  Globe,
  Search,
  AlertTriangle,
  Play,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { ViewId } from '../../types';

interface OverviewViewProps {
  onNavigate: (view: ViewId) => void;
  onOpenCommand: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }
  }
};

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate, onOpenCommand }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full space-y-6"
    >
      {/* Top Asymmetric 8:4 Bento Hero Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left 8-Cols: Executive Hero Card */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-8 relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-7 md:p-8 flex flex-col justify-between"
        >
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="text-xs font-semibold text-emerald-400">
              System Architecture · 3-Layer Governance & Agent Matrix
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
              The system does the work.{' '}
              <span className="text-emerald-400">The human keeps the final say.</span>
            </h2>

            <p className="text-sm text-neutral-400 leading-relaxed">
              11 specialized AI agents across research, content, SEO/GEO, social distribution, and lifecycle email—persisted in a server-side SQL database with strict human approval gates.
            </p>
          </div>

          <div className="relative z-10 pt-6 flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenCommand}
              className="preserve-theme px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-2"
            >
              <Play className="h-3.5 w-3.5 fill-neutral-950" />
              <span>Launch Campaign</span>
            </motion.button>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs border border-neutral-700 transition-colors flex items-center gap-2"
            >
              <span>Open Control Room</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.button>
          </div>

          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        </motion.div>

        {/* Right 4-Cols: Architecture Summary Bento Tile */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                <span>Platform Blueprint</span>
              </span>
              <span className="tabular-nums">SQL Engine</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div
                onClick={() => onNavigate('agents')}
                className="cursor-pointer p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/40 transition-colors"
              >
                <div className="text-2xl font-extrabold text-white tabular-nums">12</div>
                <div className="text-[11px] text-neutral-400">AI Specialists</div>
              </div>
              <div
                onClick={() => onNavigate('campaigns')}
                className="cursor-pointer p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/40 transition-colors"
              >
                <div className="text-2xl font-extrabold text-white tabular-nums">10</div>
                <div className="text-[11px] text-neutral-400">Workflow Stages</div>
              </div>
              <div
                onClick={() => onNavigate('integrations')}
                className="cursor-pointer p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/40 transition-colors"
              >
                <div className="text-2xl font-extrabold text-white tabular-nums">19</div>
                <div className="text-[11px] text-neutral-400">Integrations</div>
              </div>
              <div
                onClick={() => onNavigate('approvals')}
                className="cursor-pointer p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 transition-colors"
              >
                <div className="text-2xl font-extrabold text-emerald-400 tabular-nums">100%</div>
                <div className="text-[11px] text-neutral-400">Human Gated</div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Zero Unapproved Spend</span>
            </span>
            <button
              onClick={() => onNavigate('community')}
              className="text-emerald-400 font-semibold hover:underline"
            >
              Inbox →
            </button>
          </div>
        </motion.div>
      </div>

      {/* 3-Layer System Architecture Bento Grid */}
      <motion.div variants={cardVariants} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <span>3-Layer Autonomous Architecture</span>
          </h3>
          <button
            onClick={() => onNavigate('agents')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Explore All 12 Agents</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {/* Layer 1 */}
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="text-xs text-neutral-400 font-medium tabular-nums">
                01 · Input & Signals
              </div>
              <h4 className="text-base font-bold text-white">Sources & Knowledge</h4>

              <div className="space-y-2.5 pt-1 text-xs">
                <div className="flex items-center gap-2.5 text-neutral-300 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <Globe className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Social Channels (LinkedIn, Facebook, X, YouTube)</span>
                </div>
                <div className="flex items-center gap-2.5 text-neutral-300 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <Database className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>SQL CRM & Workspace (Leads, Community, Campaigns)</span>
                </div>
                <div className="flex items-center gap-2.5 text-neutral-300 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <Search className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>AI Search Citations (ChatGPT, Perplexity, Gemini)</span>
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('integrations')}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors"
            >
              Manage 19 Integrations
            </motion.button>
          </motion.div>

          {/* Layer 2 */}
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-emerald-500/30 bg-neutral-900/60 p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="text-xs text-emerald-400 font-medium tabular-nums">
                02 · Orchestration
              </div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="h-4 w-4 text-emerald-400" />
                <span>Brain & Knowledge Hub</span>
              </h4>

              <div className="space-y-2.5 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="font-semibold text-white">Task Triage</span>
                  <span className="text-neutral-400 tabular-nums">12 Specialist Agents</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="font-semibold text-white">Source of Truth</span>
                  <span className="text-neutral-400">Brand DNA & RAG Memory</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <span className="font-semibold text-amber-300">Safety Triggers</span>
                  <span className="text-neutral-400 tabular-nums">7 Interrupt Rules</span>
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('marketing-hub')}
              className="preserve-theme w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-neutral-950 transition-colors"
            >
              Open Knowledge Hub
            </motion.button>
          </motion.div>

          {/* Layer 3 */}
          <motion.div
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="text-xs text-neutral-400 font-medium tabular-nums">
                03 · Execution & Governance
              </div>
              <h4 className="text-base font-bold text-white">Departments & Approval Gate</h4>

              <div className="space-y-2.5 pt-1 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-300">Research & SEO</span>
                  <span className="text-emerald-400 font-medium">Low Risk · Auto</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-300">Content & Social</span>
                  <span className="text-sky-400 font-medium">Medium Risk · Review</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-amber-500/30">
                  <span className="text-amber-300 font-medium">Ad Spend & Email</span>
                  <span className="text-amber-400 font-bold">High Risk · Gate</span>
                </div>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('approvals')}
              className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold text-amber-300 transition-colors"
            >
              Inspect Approval Queue
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Bento Row: 7 Human Interrupt Triggers */}
      <motion.div
        variants={cardVariants}
        className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">7 Human Interrupt Triggers</h4>
          </div>
          <span className="text-xs text-neutral-400">
            Automatic pause & human escalation guardrails
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { title: 'Trending Topic', desc: 'Viral search breakout' },
            { title: 'Brand Crisis', desc: 'Negative LLM claim' },
            { title: 'Amplification', desc: '3x organic engagement' },
            { title: 'Algorithm Shift', desc: 'Search index update' },
            { title: 'Budget Limit', desc: 'Spend cap reached' },
            { title: 'Compliance', desc: 'Legal sensitivity' },
            { title: 'Executive Gate', desc: 'Tier-1 campaign launch' }
          ].map((trigger, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              onClick={() => onNavigate('approvals')}
              className="cursor-pointer p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/30 transition-colors space-y-1"
            >
              <div className="text-xs font-bold text-white">{trigger.title}</div>
              <p className="text-[11px] text-neutral-400 leading-snug">{trigger.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
