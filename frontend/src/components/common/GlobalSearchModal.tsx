import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Bot,
  Building2,
  Sparkles,
  Megaphone,
  ArrowRight,
  Compass,
  FileText,
  Share2,
  Mail,
  Users,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Zap,
  FileSpreadsheet,
  Plug,
  Settings,
  CalendarCheck,
  CornerDownLeft,
  Command,
  LucideIcon
} from 'lucide-react';
import { ViewId } from '../../types';

interface SearchResultItem {
  id: string;
  category: 'Agents' | 'Company' | 'Prompts' | 'Campaigns' | 'Navigation';
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  viewId?: ViewId;
  actionPrompt?: string;
  badge?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ViewId) => void;
  onOpenAskAI?: (initialPrompt?: string) => void;
  brandName?: string;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAskAI,
  brandName = 'Sincly'
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Focus input automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Master catalog of searchable items across Sincly
  const searchCatalog: SearchResultItem[] = useMemo(() => [
    // 1. Agents
    {
      id: 'agent-orchestrator',
      category: 'Agents',
      title: 'AI Orchestrator',
      subtitle: 'Central Dispatcher & QA Supervisor · gemini-3.8-flash Reasoning Core',
      icon: Bot,
      iconColor: '#10b981',
      viewId: 'agents',
      badge: 'Tier 1'
    },
    {
      id: 'agent-strategy',
      category: 'Agents',
      title: 'Strategy & Research Agent',
      subtitle: 'Deconstructs high-level marketing goals and competitor battlecards',
      icon: Bot,
      iconColor: '#10b981',
      viewId: 'agents'
    },
    {
      id: 'agent-content',
      category: 'Agents',
      title: 'Content Studio Agent',
      subtitle: 'Generates multi-format thought leadership, carousels, and whitepapers',
      icon: FileText,
      iconColor: '#0ea5e9',
      viewId: 'content'
    },
    {
      id: 'agent-seo',
      category: 'Agents',
      title: 'SEO & GEO Prominence Agent',
      subtitle: 'Tracks ChatGPT, Perplexity, and Gemini citations and optimizes entity visibility',
      icon: Search,
      iconColor: '#10b981',
      viewId: 'seo'
    },
    {
      id: 'agent-leads',
      category: 'Agents',
      title: 'Lead Intelligence & Pipeline Agent',
      subtitle: 'Detects commercial buying intent signals and syncs prospects to CRM',
      icon: Users,
      iconColor: '#a855f7',
      viewId: 'leads'
    },
    {
      id: 'agent-social',
      category: 'Agents',
      title: 'Social Media Publishing Agent',
      subtitle: 'Automates multi-channel distribution across LinkedIn, Meta, and X',
      icon: Share2,
      iconColor: '#ec4899',
      viewId: 'social'
    },
    {
      id: 'agent-analytics',
      category: 'Agents',
      title: 'Analytics & Attribution Agent',
      subtitle: 'Computes multi-touch conversion attribution and marketing ROI',
      icon: BarChart3,
      iconColor: '#6366f1',
      viewId: 'analytics'
    },

    // 2. Company & Knowledge Hub
    {
      id: 'comp-profile',
      category: 'Company',
      title: `${brandName} Brand Profile`,
      subtitle: 'Core positioning, mission statement, website URL, and verified domain',
      icon: Building2,
      iconColor: '#10b981',
      viewId: 'marketing-hub',
      badge: 'Brand'
    },
    {
      id: 'comp-voice',
      category: 'Company',
      title: 'Brand Tone of Voice & Guidelines',
      subtitle: 'Authoritative, precise, visionary, and data-backed editorial rules',
      icon: Building2,
      iconColor: '#0ea5e9',
      viewId: 'marketing-hub'
    },
    {
      id: 'comp-competitors',
      category: 'Company',
      title: 'Competitor Intelligence Radar',
      subtitle: 'Real-time positioning matrix vs regional & global SaaS competitors',
      icon: Building2,
      iconColor: '#f59e0b',
      viewId: 'marketing-hub'
    },
    {
      id: 'comp-icp',
      category: 'Company',
      title: 'Ideal Customer Profile (ICP) & Persona',
      subtitle: 'B2B Growth Leaders, Marketing Directors, and Enterprise Founders',
      icon: Users,
      iconColor: '#a855f7',
      viewId: 'marketing-hub'
    },
    {
      id: 'comp-docs',
      category: 'Company',
      title: 'RAG Knowledge Documents & Assets',
      subtitle: 'Embedded technical whitepapers, feature sheets, and case studies',
      icon: FileSpreadsheet,
      iconColor: '#10b981',
      viewId: 'marketing-hub'
    },

    // 3. Prompts & Quick Actions
    {
      id: 'prompt-geo-audit',
      category: 'Prompts',
      title: 'Audit competitor citations in Perplexity & ChatGPT',
      subtitle: 'Prompt: Discover entity citation gaps and draft targeted counter-content',
      icon: Sparkles,
      iconColor: '#10b981',
      actionPrompt: 'Audit competitor citations in Perplexity and find content gaps for our brand',
      badge: 'Prompt'
    },
    {
      id: 'prompt-linkedin-carousel',
      category: 'Prompts',
      title: 'Draft a high-converting LinkedIn carousel on zero-click search',
      subtitle: 'Prompt: Generate 6-slide outline with hook, authority data, and call-to-action',
      icon: Sparkles,
      iconColor: '#0ea5e9',
      actionPrompt: 'Draft a LinkedIn post on zero-click search with a multi-slide carousel outline'
    },
    {
      id: 'prompt-campaign-geo',
      category: 'Prompts',
      title: 'Launch 10-Stage GEO Score sprint',
      subtitle: 'Prompt: Deconstruct campaign to maximize AI engine brand prominence',
      icon: Megaphone,
      iconColor: '#10b981',
      actionPrompt: 'Create an autonomous 10-stage campaign for our new GEO Score feature'
    },
    {
      id: 'prompt-leads-sweep',
      category: 'Prompts',
      title: 'Scan social inbox for commercial buying signals and draft replies',
      subtitle: 'Prompt: Filter high-intent comments and prep human approval items',
      icon: Users,
      iconColor: '#a855f7',
      actionPrompt: 'Scan community inbox for commercial buying signals and draft replies'
    },

    // 4. Campaigns & Execution
    {
      id: 'camp-geo-sprint',
      category: 'Campaigns',
      title: 'GEO Prominence & AI Citations Sprint',
      subtitle: '10-stage autonomous sprint targeting ChatGPT, Perplexity & Google AIO',
      icon: Megaphone,
      iconColor: '#10b981',
      viewId: 'campaigns',
      badge: 'Active'
    },
    {
      id: 'camp-linkedin-thought',
      category: 'Campaigns',
      title: 'Executive Thought Leadership Campaign',
      subtitle: 'Omnichannel B2B content sprint on LinkedIn, Meta & Tech Community',
      icon: Megaphone,
      iconColor: '#0ea5e9',
      viewId: 'campaigns'
    },

    // 5. Navigation & Views
    {
      id: 'nav-dashboard',
      category: 'Navigation',
      title: 'Dashboard Overview',
      subtitle: 'Live multi-agent telemetry, Bento KPIs, and real-time operations',
      icon: Compass,
      iconColor: '#10b981',
      viewId: 'dashboard'
    },
    {
      id: 'nav-approvals',
      category: 'Navigation',
      title: 'Approval Gate (Human-in-the-Loop)',
      subtitle: 'Governance review — inspect high-risk assets and ad budgets before publishing',
      icon: ShieldCheck,
      iconColor: '#f59e0b',
      viewId: 'approvals'
    },
    {
      id: 'nav-leads',
      category: 'Navigation',
      title: 'Leads & Pipeline CRM',
      subtitle: 'Intent detection, lead scoring (0-100), and CRM pipeline synchronization',
      icon: Users,
      iconColor: '#a855f7',
      viewId: 'leads'
    },
    {
      id: 'nav-analytics',
      category: 'Navigation',
      title: 'Analytics & Marketing ROI',
      subtitle: 'Conversion funnel, multi-touch attribution, and platform reach metrics',
      icon: BarChart3,
      iconColor: '#6366f1',
      viewId: 'analytics'
    },
    {
      id: 'nav-automation',
      category: 'Navigation',
      title: 'Automations & Event Triggers',
      subtitle: 'Webhook pipelines, competitor radar alerts, and automated responses',
      icon: Zap,
      iconColor: '#10b981',
      viewId: 'automation'
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      title: 'Settings & Workspace Preferences',
      subtitle: 'Theme (Dark/Light), RBAC User Roles, API Keys vault, and Models',
      icon: Settings,
      iconColor: '#64748b',
      viewId: 'settings'
    }
  ], [brandName]);

  // Filter items based on user input
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default initial view: show a curated mix
      return searchCatalog.slice(0, 10);
    }

    return searchCatalog.filter(item => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [query, searchCatalog]);

  // Keep selection within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  const handleSelect = (item: SearchResultItem) => {
    onClose();
    if (item.actionPrompt && onOpenAskAI) {
      onOpenAskAI(item.actionPrompt);
    } else if (item.viewId) {
      onNavigate(item.viewId);
    }
  };

  // Keyboard navigation listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1 < filteredResults.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex]);
      } else if (query.trim() && onOpenAskAI) {
        onClose();
        onOpenAskAI(query.trim());
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 bg-black/75 backdrop-blur-md p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900/95 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col"
        >
          {/* Top Search Input Box */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-800/80 bg-neutral-950/60">
            <Search className="h-4 w-4 text-emerald-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search AI agents, company knowledge, campaigns, or prompts..."
              className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-neutral-500 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-neutral-400 border border-neutral-700">
              ESC
            </kbd>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-neutral-800/60 bg-neutral-950/40 text-[11px] font-mono overflow-x-auto">
            <span className="text-neutral-500 uppercase shrink-0 font-semibold mr-1">Filter:</span>
            {['All', 'Agents', 'Company', 'Prompts', 'Campaigns', 'Navigation'].map(cat => {
              const isSelected = (!query && cat === 'All') || query.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setQuery(cat === 'All' ? '' : cat);
                    inputRef.current?.focus();
                  }}
                  className={`px-2.5 py-0.5 rounded-lg transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Results List */}
          <div
            ref={resultsContainerRef}
            className="max-h-[380px] overflow-y-auto p-2 space-y-1"
          >
            {filteredResults.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <Search className="h-8 w-8 text-neutral-600 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">No Direct Matches Found</h4>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    We couldn't find an exact item matching "{query}". You can send this as a prompt to the AI Orchestrator instead!
                  </p>
                </div>
                {onOpenAskAI && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAskAI(query);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Ask AI about "{query}"</span>
                  </button>
                )}
              </div>
            ) : (
              filteredResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-neutral-800/90 text-white shadow-sm'
                        : 'text-neutral-300 hover:bg-neutral-800/50'
                    }`}
                  >
                    <div
                      style={{
                        backgroundColor: `${item.iconColor}15`,
                        borderColor: `${item.iconColor}30`
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border shrink-0"
                    >
                      <Icon style={{ color: item.iconColor }} className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate">{item.title}</span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-700 text-neutral-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate">{item.subtitle}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-400">
                        {item.category}
                      </span>
                      {isSelected && (
                        <CornerDownLeft className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Guide & Shortcut Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-neutral-800/80 bg-neutral-950/60 text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.2 rounded bg-neutral-800 text-[10px]">↑↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.2 rounded bg-neutral-800 text-[10px]">↵</kbd>
                <span>Open</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-400">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span>Sincly Omnipresent Search</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
