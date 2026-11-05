import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  ShieldCheck,
  Megaphone,
  Users,
  FileText,
  Calendar,
  Layers,
  HelpCircle,
  LucideIcon
} from 'lucide-react';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost' | 'amber';
  shortcut?: string;
}

export interface EmptyStateTip {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export interface EmptyStateTemplate {
  title: string;
  category: string;
  description: string;
  onClick: () => void;
  badge?: string;
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  iconColor?: string;
  glowColor?: string;
  badge?: string;
  badgeVariant?: 'emerald' | 'amber' | 'sky' | 'purple' | 'neutral';
  title: string;
  description: string;
  tipsTitle?: string;
  tips?: EmptyStateTip[];
  templatesTitle?: string;
  templates?: EmptyStateTemplate[];
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
  variant?: 'default' | 'card' | 'compact' | 'mini';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  iconColor = '#10b981',
  glowColor = 'rgba(16, 185, 129, 0.25)',
  badge,
  badgeVariant = 'emerald',
  title,
  description,
  tipsTitle = 'Helpful Guidance & Next Steps',
  tips,
  templatesTitle = 'Or Start with a 1-Click Template',
  templates,
  primaryAction,
  secondaryAction,
  className = '',
  variant = 'default'
}) => {
  const badgeClasses: Record<string, string> = {
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    sky: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    neutral: 'bg-neutral-800 text-neutral-300 border-neutral-700'
  };

  // Compact Variant (e.g. for small sidebar drawers or sub-lists)
  if (variant === 'compact' || variant === 'mini') {
    return (
      <div
        className={`p-6 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 text-center space-y-3.5 ${className}`}
      >
        <div
          style={{ backgroundColor: `${iconColor}15`, borderColor: `${iconColor}35` }}
          className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm"
        >
          <Icon style={{ color: iconColor }} className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        </div>
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors border border-neutral-700"
          >
            {primaryAction.icon && <primaryAction.icon className="h-3.5 w-3.5 text-emerald-400" />}
            <span>{primaryAction.label}</span>
          </button>
        )}
      </div>
    );
  }

  // Card Variant (fits inside 7:5 bento split or medium panels)
  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`w-full p-6 sm:p-7 rounded-2xl border border-neutral-800/90 bg-neutral-900/60 backdrop-blur-xl flex flex-col justify-between space-y-5 ${className}`}
      >
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div
              style={{
                backgroundColor: `${iconColor}15`,
                borderColor: `${iconColor}35`,
                boxShadow: `0 0 20px -3px ${glowColor}`
              }}
              className="flex h-11 w-11 items-center justify-center rounded-xl border"
            >
              <Icon style={{ color: iconColor }} className="h-5 w-5" />
            </div>

            {badge && (
              <span
                className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-semibold tracking-wider ${
                  badgeClasses[badgeVariant]
                }`}
              >
                {badge}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">{description}</p>
          </div>

          {/* Quick tips list if available */}
          {tips && tips.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-neutral-800/80">
              {tips.slice(0, 2).map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2 rounded-xl bg-neutral-950/60 border border-neutral-800/70 text-xs"
                >
                  <div className="h-5 w-5 rounded-lg bg-neutral-900 flex items-center justify-center shrink-0 mt-0.5">
                    {tip.icon ? (
                      <tip.icon className="h-3 w-3 text-neutral-400" />
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-200 block">{tip.title}</span>
                    <span className="text-neutral-400 text-[11px] block">{tip.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button Row */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                {primaryAction.icon && <primaryAction.icon className="h-3.5 w-3.5" />}
                <span>{primaryAction.label}</span>
                {primaryAction.shortcut && (
                  <kbd className="ml-1 px-1.5 py-0.2 rounded bg-neutral-950/25 text-[9px] font-mono">
                    {primaryAction.shortcut}
                  </kbd>
                )}
              </button>
            )}

            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition-colors border border-neutral-700 flex items-center gap-1.5"
              >
                {secondaryAction.icon && <secondaryAction.icon className="h-3.5 w-3.5 text-neutral-400" />}
                <span>{secondaryAction.label}</span>
              </button>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  // Full Hero Default Variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full rounded-2xl border border-neutral-800/90 bg-neutral-900/60 backdrop-blur-2xl p-7 md:p-10 space-y-7 text-center relative overflow-hidden shadow-2xl ${className}`}
    >
      {/* Background Decorative Ambient Glow Orb */}
      <div
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`
        }}
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none opacity-40 blur-3xl -z-10"
      />

      {/* Visual Focal Point: Animated Floating Icon Badge */}
      <div className="relative mx-auto inline-block">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            backgroundColor: `${iconColor}15`,
            borderColor: `${iconColor}40`,
            boxShadow: `0 0 35px -5px ${glowColor}`
          }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl border"
        >
          <Icon style={{ color: iconColor }} className="h-8 w-8" />
        </motion.div>

        {badge && (
          <div className="mt-3">
            <span
              className={`inline-block text-[10px] font-mono uppercase px-3 py-0.5 rounded-full border font-bold tracking-wider ${
                badgeClasses[badgeVariant]
              }`}
            >
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Title & Contextual Messaging */}
      <div className="space-y-2 max-w-xl mx-auto">
        <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight font-sans">
          {title}
        </h3>
        <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Optional Step-by-Step Guidance */}
      {tips && tips.length > 0 && (
        <div className="max-w-2xl mx-auto text-left space-y-3 pt-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-neutral-400 tracking-wider">
            <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>{tipsTitle}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 transition-colors space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-[10px] font-mono text-emerald-400 font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-bold text-white truncate">{tip.title}</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Starter Templates / Fast-Track Cards */}
      {templates && templates.length > 0 && (
        <div className="max-w-2xl mx-auto text-left space-y-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold uppercase text-neutral-400 tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>{templatesTitle}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {templates.map((tpl, idx) => (
              <div
                key={idx}
                onClick={tpl.onClick}
                className="group cursor-pointer p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-emerald-500/50 hover:bg-neutral-900 transition-all space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 block w-fit">
                    {tpl.category}
                  </span>
                  <h5 className="text-xs font-bold text-neutral-200 group-hover:text-emerald-300 transition-colors">
                    {tpl.title}
                  </h5>
                  <p className="text-[11px] text-neutral-400 line-clamp-2">
                    {tpl.description}
                  </p>
                </div>
                <div className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 pt-1">
                  <span>Deploy Blueprint</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary & Secondary Action CTAs */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {primaryAction && (
            <motion.button
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={primaryAction.onClick}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
            >
              {primaryAction.icon && <primaryAction.icon className="h-4 w-4" />}
              <span>{primaryAction.label}</span>
              {primaryAction.shortcut && (
                <kbd className="ml-1.5 px-1.5 py-0.5 rounded bg-neutral-950/25 text-[10px] font-mono">
                  {primaryAction.shortcut}
                </kbd>
              )}
            </motion.button>
          )}

          {secondaryAction && (
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={secondaryAction.onClick}
              className="px-4 py-2.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-800 text-neutral-200 font-semibold text-xs transition-colors border border-neutral-700/80 flex items-center gap-2"
            >
              {secondaryAction.icon && (
                <secondaryAction.icon className="h-4 w-4 text-neutral-400" />
              )}
              <span>{secondaryAction.label}</span>
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ============================================================================
// PRE-CONFIGURED FEATURE EMPTY STATES FOR SINCLY
// ============================================================================

/**
 * 1. Approval Gate All Clear State
 */
export const ApprovalGateEmptyState: React.FC<{
  onSimulateReview?: () => void;
  onOpenCommand?: () => void;
  variant?: 'default' | 'card';
}> = ({ onSimulateReview, onOpenCommand, variant = 'card' }) => {
  return (
    <EmptyState
      variant={variant}
      icon={ShieldCheck}
      iconColor="#10b981"
      glowColor="rgba(16, 185, 129, 0.25)"
      badge="Governance 100% Compliant"
      badgeVariant="emerald"
      title="All High-Risk Actions Cleared"
      description="Zero campaigns, ad budgets, or social broadcasts are currently pending human approval. Your autonomous agents are operating safely within configured limits."
      tips={[
        {
          title: 'Autonomous Execution',
          description: 'Low-risk actions like SEO indexing and research run automatically.'
        },
        {
          title: 'Human-in-the-Loop Safeguards',
          description: 'Budget changes >$500 and public broadcasts pause here for sign-off.'
        }
      ]}
      primaryAction={
        onSimulateReview
          ? {
              label: 'Simulate Review Request',
              icon: RefreshCw,
              onClick: onSimulateReview,
              shortcut: 'Demo'
            }
          : undefined
      }
      secondaryAction={
        onOpenCommand
          ? {
              label: 'Command Center',
              icon: Sparkles,
              onClick: onOpenCommand,
              shortcut: '⌘K'
            }
          : undefined
      }
    />
  );
};

/**
 * 2. Campaigns Empty State
 */
export const CampaignsEmptyState: React.FC<{
  onCreateCampaign: () => void;
  onOpenCommand?: () => void;
}> = ({ onCreateCampaign, onOpenCommand }) => {
  return (
    <EmptyState
      icon={Megaphone}
      iconColor="#10b981"
      glowColor="rgba(16, 185, 129, 0.25)"
      badge="Autonomous Marketing Engine"
      badgeVariant="emerald"
      title="Ready to Launch Your Next Growth Sprint"
      description="You don't have any active campaigns right now. Sincly's 10-stage autonomous workforce will deconstruct your target goals, conduct competitive research, and orchestrate omnichannel execution."
      tips={[
        {
          title: '1. Goal Deconstruction',
          description: 'AI Orchestrator splits your goal into research, copy, visual, and distribution tasks.'
        },
        {
          title: '2. Multi-Agent Synthesis',
          description: 'SEO, Content, Ad, and Social agents collaborate with shared brand memory.'
        },
        {
          title: '3. Human Sign-Off',
          description: 'Final creatives and spend limits are locked until you give executive approval.'
        }
      ]}
      templatesTitle="Or Launch an Instant Campaign Blueprint"
      templates={[
        {
          category: 'Search & AI Engines',
          title: 'GEO Prominence Sprint',
          description: 'Maximize brand citations across ChatGPT, Perplexity, and Google AI Overviews.',
          onClick: onCreateCampaign
        },
        {
          category: 'B2B LinkedIn',
          title: 'Executive Thought Leadership',
          description: 'Generate 5 high-converting carousel breakdowns and founder essays.',
          onClick: onCreateCampaign
        },
        {
          category: 'Lifecycle Email',
          title: 'High-Intent Nurture Flow',
          description: 'Deploy 5-stage automated email sequences triggered by buyer signals.',
          onClick: onCreateCampaign
        }
      ]}
      primaryAction={{
        label: 'Create 9-Stage Campaign',
        icon: Megaphone,
        onClick: onCreateCampaign
      }}
      secondaryAction={
        onOpenCommand
          ? {
              label: 'Orchestrate via AI',
              icon: Sparkles,
              onClick: onOpenCommand,
              shortcut: '⌘K'
            }
          : undefined
      }
    />
  );
};

/**
 * 3. Leads & Pipeline Empty State
 */
export const LeadsEmptyState: React.FC<{
  onScanSignals: () => void;
  onNavigateIntegrations?: () => void;
}> = ({ onScanSignals, onNavigateIntegrations }) => {
  return (
    <EmptyState
      icon={Users}
      iconColor="#f59e0b"
      glowColor="rgba(245, 158, 11, 0.25)"
      badge="Lead Engine Active"
      badgeVariant="amber"
      title="Autonomous Lead Engine Standing By"
      description="No commercial leads matching your qualification threshold are currently in the queue. Sincly is actively listening for buying signals across connected channels."
      tips={[
        {
          title: 'Social Comment Intent',
          description: 'AI scans LinkedIn & Meta comments for commercial queries (e.g. "pricing", "audit").'
        },
        {
          title: 'Lead Enrichment',
          description: 'Prospects are automatically scored (0-100) based on firmographics and intent.'
        },
        {
          title: 'CRM Synchronization',
          description: 'Qualified deals are pushed directly to your sales pipeline and calendar.'
        }
      ]}
      primaryAction={{
        label: 'Scan Inbound Buying Signals',
        icon: Users,
        onClick: onScanSignals
      }}
      secondaryAction={
        onNavigateIntegrations
          ? {
              label: 'Check Connected Channels',
              icon: Layers,
              onClick: onNavigateIntegrations
            }
          : undefined
      }
    />
  );
};

/**
 * 4. Content Studio Empty State
 */
export const ContentStudioEmptyState: React.FC<{
  onGenerateContent: () => void;
  onResetFilters?: () => void;
}> = ({ onGenerateContent, onResetFilters }) => {
  return (
    <EmptyState
      icon={FileText}
      iconColor="#0ea5e9"
      glowColor="rgba(14, 165, 233, 0.25)"
      badge="Studio Ready"
      badgeVariant="sky"
      title="Content Studio Canvas is Empty"
      description="Create multi-format thought leadership, viral carousels, or search authority whitepapers tailored to your brand voice with one instruction."
      templatesTitle="Quick-Start Asset Prompts"
      templates={[
        {
          category: 'LinkedIn B2B',
          title: 'Enterprise IT Checklist',
          description: 'Generate a 6-slide carousel breakdown with hook, body, and CTA.',
          onClick: onGenerateContent
        },
        {
          category: 'GEO Authority',
          title: 'Perplexity Engine Guide',
          description: 'Technical comparison showing why your product is cited as top solution.',
          onClick: onGenerateContent
        },
        {
          category: 'Short-Form Video',
          title: 'YouTube & Reel Script',
          description: '60-second viral problem-agitate-solve script with visual cues.',
          onClick: onGenerateContent
        }
      ]}
      primaryAction={{
        label: 'Generate New Content Asset',
        icon: FileText,
        onClick: onGenerateContent
      }}
      secondaryAction={
        onResetFilters
          ? {
              label: 'Reset Filters',
              icon: RefreshCw,
              onClick: onResetFilters
            }
          : undefined
      }
    />
  );
};

/**
 * 5. Filter / Search Results Empty State
 */
export const FilterResultsEmptyState: React.FC<{
  query?: string;
  onReset: () => void;
}> = ({ query, onReset }) => {
  return (
    <EmptyState
      variant="compact"
      icon={Search}
      iconColor="#64748b"
      title="No Matching Records Found"
      description={
        query
          ? `We couldn't find any items matching "${query}". Try broadening your search or adjusting your status filters.`
          : 'No records match your active filter criteria. Clear your filters to view all available records.'
      }
      primaryAction={{
        label: 'Clear Filters & Search',
        icon: RefreshCw,
        onClick: onReset
      }}
    />
  );
};
