import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Activity,
  Users,
  Search,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  Zap,
  RefreshCw,
  Flame,
  Layers,
  Clock
} from 'lucide-react';
import { AgentInfo, ApprovalItem, CampaignItem, SocialPost, ViewId } from '../../types';
import { AgentActivityDashboard } from '../dashboard/AgentActivityDashboard';
import {
  AnimatedAreaChart,
  AnimatedDonutChart,
  SparklineChart,
  MetricType,
  TimeHorizon
} from '../dashboard/AnimatedCharts';
import { DashboardSkeleton } from '../dashboard/DashboardSkeleton';
import { ApprovalGateEmptyState } from '../common/EmptyState';
import {
  mockChartTimeseries7d,
  mockChartTimeseries30d,
  mockChartTimeseries90d,
  mockChannelDistribution
} from '../../data/mock-data';

interface DashboardViewProps {
  agents: AgentInfo[];
  approvals: ApprovalItem[];
  campaigns: CampaignItem[];
  socialPosts: SocialPost[];
  onNavigate: (view: ViewId) => void;
  onOpenCommand: () => void;
  onApproveItem: (id: string) => void;
  isLoading?: boolean;
}

const bentoContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

const bentoItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }
  }
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  agents,
  approvals,
  campaigns,
  socialPosts,
  onNavigate,
  onOpenCommand,
  onApproveItem,
  isLoading: initialLoading = false
}) => {
  // Chart Controls State
  const [metric, setMetric] = useState<MetricType>('reach');
  const [horizon, setHorizon] = useState<TimeHorizon>('30d');
  const [recentlyApprovedTitle, setRecentlyApprovedTitle] = useState<string | null>(null);

  // Interactive Skeleton Demo Simulation
  const [isSimulatingLoading, setIsSimulatingLoading] = useState(initialLoading);

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const topPending = pendingApprovals[0];
  const runningCampaignsCount = campaigns.filter(c => c.status === 'running').length;

  const handleQuickApprove = (item: ApprovalItem) => {
    setRecentlyApprovedTitle(item.title);
    onApproveItem(item.id);
    setTimeout(() => {
      setRecentlyApprovedTitle(null);
    }, 3200);
  };

  // Select dataset based on time horizon
  const chartData =
    horizon === '7d'
      ? mockChartTimeseries7d
      : horizon === '90d'
      ? mockChartTimeseries90d
      : mockChartTimeseries30d;

  // Trigger temporary loading preview to demonstrate skeleton state
  const handleTriggerSkeletonPreview = () => {
    setIsSimulatingLoading(true);
    setTimeout(() => {
      setIsSimulatingLoading(false);
    }, 1500);
  };

  if (isSimulatingLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>Simulating 1.5s Data Hydration (CLS = 0)...</span>
          </div>
          <button
            onClick={() => setIsSimulatingLoading(false)}
            className="text-[11px] font-mono text-neutral-400 hover:text-white underline"
          >
            Cancel Preview
          </button>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      variants={bentoContainerVariants}
      initial="hidden"
      animate="show"
      className="w-full space-y-6"
    >
      {/* 1. Header Toolbar with Sincly Brand & Controls */}
      <motion.div
        variants={bentoItemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
              Dashboard
            </h2>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-neutral-400 tabular-nums">
            Autonomous growth OS · {pendingApprovals.length} items awaiting governance · {runningCampaignsCount} active campaigns
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Skeleton Preview Demo Trigger */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTriggerSkeletonPreview}
            title="Preview Shimmer Skeleton Loading State"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-xs font-mono transition-colors shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5 text-neutral-400" />
            <span>Preview Skeleton</span>
          </motion.button>

          {/* Approval Gate Counter Pill */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('approvals')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            <span>Approval Gate ({pendingApprovals.length})</span>
          </motion.button>

          {/* AI Command Center */}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenCommand}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Command Center</span>
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.2 rounded bg-neutral-950/20 text-[9px] font-mono">⌘K</kbd>
          </motion.button>
        </div>
      </motion.div>

      {/* Celebratory Approval Banner */}
      <AnimatePresence>
        {recentlyApprovedTitle && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3.5 flex items-center justify-between gap-4 shadow-lg shadow-emerald-500/10"
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.3, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 16 }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-neutral-950 shrink-0"
              >
                <CheckCircle2 className="h-4 w-4" />
              </motion.div>
              <div className="text-xs">
                <span className="font-bold text-white">Approved & Dispatched: </span>
                <span className="text-emerald-300">"{recentlyApprovedTitle}"</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 tabular-nums shrink-0">
              Synced to SQL Engine
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Bento 4 KPI Glass Cards with Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: GEO Visibility Score */}
        <motion.div
          variants={bentoItemVariants}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate('seo')}
          className="cursor-pointer p-5 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 hover:border-emerald-500/40 transition-all space-y-3 group shadow-xs hover:shadow-lg hover:shadow-emerald-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">GEO Visibility Score</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white tabular-nums tracking-tight">84</span>
              <span className="text-xs text-neutral-500 tabular-nums">/ 100</span>
            </div>
            <SparklineChart values={[68, 71, 74, 72, 79, 81, 84]} color="#10b981" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '84%' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
          <div className="text-xs text-neutral-400 flex items-center justify-between pt-0.5">
            <span className="text-[11px]">ChatGPT · Perplexity · Gemini</span>
            <span className="text-xs text-emerald-400 font-semibold tabular-nums">+12.4%</span>
          </div>
        </motion.div>

        {/* KPI 2: AI Citations */}
        <motion.div
          variants={bentoItemVariants}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate('seo')}
          className="cursor-pointer p-5 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 hover:border-sky-500/40 transition-all space-y-3 group shadow-xs hover:shadow-lg hover:shadow-sky-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">AI Engine Citations (7d)</span>
            <Search className="h-4 w-4 text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white tabular-nums tracking-tight">1,280</span>
            </div>
            <SparklineChart values={[820, 890, 940, 1020, 1140, 1210, 1280]} color="#0ea5e9" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '76%' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
              className="h-full rounded-full bg-sky-500"
            />
          </div>
          <div className="text-xs text-neutral-400 flex items-center justify-between pt-0.5 tabular-nums">
            <span className="text-[11px]">Perplexity 42% · Google AIO 31%</span>
            <span className="text-xs text-sky-400 font-semibold tabular-nums">+28.4%</span>
          </div>
        </motion.div>

        {/* KPI 3: Active Campaigns */}
        <motion.div
          variants={bentoItemVariants}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate('campaigns')}
          className="cursor-pointer p-5 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 hover:border-emerald-500/40 transition-all space-y-3 group shadow-xs hover:shadow-lg hover:shadow-emerald-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Active Campaigns</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white tabular-nums tracking-tight">
                {runningCampaignsCount}
              </span>
              <span className="text-xs text-neutral-500 tabular-nums">of {campaigns.length} total</span>
            </div>
            <SparklineChart values={[1, 2, 2, 3, 3, 4, runningCampaignsCount]} color="#10b981" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '68%' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
          <div className="text-xs text-neutral-400 flex items-center justify-between pt-0.5 tabular-nums">
            <span className="text-[11px]">$14,170 / $46,000 budget</span>
            <span className="text-xs text-emerald-400 font-semibold tabular-nums">10-Stage</span>
          </div>
        </motion.div>

        {/* KPI 4: Qualified Leads / Pipeline */}
        <motion.div
          variants={bentoItemVariants}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate('leads')}
          className="cursor-pointer p-5 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 hover:border-amber-500/40 transition-all space-y-3 group shadow-xs hover:shadow-lg hover:shadow-amber-500/5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Qualified Deals (SQL)</span>
            <Users className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-white tabular-nums tracking-tight">38</span>
              <span className="text-xs text-neutral-500 tabular-nums">SQLs</span>
            </div>
            <SparklineChart values={[14, 18, 22, 25, 29, 34, 38]} color="#f59e0b" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '92%' }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
              className="h-full rounded-full bg-amber-500"
            />
          </div>
          <div className="text-xs text-neutral-400 flex items-center justify-between pt-0.5">
            <span className="text-[11px]">96 Avg Intent Score</span>
            <span className="text-xs text-amber-400 font-semibold tabular-nums">+41.2%</span>
          </div>
        </motion.div>
      </div>

      {/* 3. Visual Intelligence 8:4 Grid (Area Chart + Donut Distribution) */}
      <motion.div variants={bentoItemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Main Interactive Bézier Area Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 backdrop-blur-xl space-y-4">
          <AnimatedAreaChart
            data={chartData}
            metric={metric}
            onMetricChange={setMetric}
            horizon={horizon}
            onHorizonChange={setHorizon}
          />
        </div>

        {/* Channel Acquisition Donut Distribution (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 backdrop-blur-xl">
          <AnimatedDonutChart
            channels={mockChannelDistribution}
            totalLabel="Verified Reach"
            totalValue="154.2K"
          />
        </div>
      </motion.div>

      {/* 4. Asymmetric 7:5 Bento Split: Human Approval Spotlight & Live Social Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <motion.div variants={bentoItemVariants} className="lg:col-span-7 flex">
          {topPending ? (
            <div className="w-full rounded-2xl border border-amber-500/30 bg-neutral-900/60 p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs tabular-nums">
                  <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    <span>Human Approval Gate · {topPending.platform || topPending.agent}</span>
                  </span>
                  <span className="text-neutral-400">{topPending.submittedAt}</span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  {topPending.title}
                </h3>

                {topPending.preview && (
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 leading-relaxed line-clamp-3 font-mono">
                    "{topPending.preview}"
                  </div>
                )}

                {topPending.riskReason && (
                  <p className="text-[11px] text-amber-300/90">
                    Governance Note: {topPending.riskReason}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
                <span className="text-xs text-neutral-400 tabular-nums">
                  Risk Level: <strong className="text-amber-400 uppercase">{topPending.riskLevel}</strong>
                </span>

                <div className="flex flex-wrap items-center gap-2.5">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigate('approvals')}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
                  >
                    Inspect All ({pendingApprovals.length})
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleQuickApprove(topPending)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Approve & Execute</span>
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            <ApprovalGateEmptyState
              variant="card"
              onOpenCommand={onOpenCommand}
            />
          )}
        </motion.div>

        <motion.div
          variants={bentoItemVariants}
          className="lg:col-span-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Upcoming Social Distribution</h3>
              </div>
              <button
                onClick={() => onNavigate('social')}
                className="text-xs font-semibold text-emerald-400 hover:underline"
              >
                Open Studio →
              </button>
            </div>

            <div className="space-y-2.5">
              {socialPosts.slice(0, 3).map(post => (
                <div
                  key={post.id}
                  onClick={() => onNavigate('social')}
                  className="cursor-pointer p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/30 transition-colors text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 tabular-nums">
                    <span className="font-semibold text-emerald-400">{post.platform}</span>
                    <span>
                      {post.scheduledTime} · {post.dayOfWeek}
                    </span>
                  </div>
                  <p className="text-neutral-300 truncate">{post.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 tabular-nums">
            <span>Connected Profiles: LinkedIn · Meta · X</span>
            <button
              onClick={() => onNavigate('community')}
              className="text-emerald-400 font-semibold hover:underline"
            >
              Social Inbox →
            </button>
          </div>
        </motion.div>
      </div>

      {/* 5. Bottom Full-Width Bento Module: 12-Agent Live Telemetry */}
      <motion.div variants={bentoItemVariants}>
        <AgentActivityDashboard
          agents={agents}
          pendingApprovalsCount={pendingApprovals.length}
          onNavigate={onNavigate}
          onOpenCommand={onOpenCommand}
        />
      </motion.div>
    </motion.div>
  );
};
