import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  LayoutDashboard,
  Bot,
  Database,
  Megaphone,
  FileText,
  Share2,
  Search,
  Mail,
  Users,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Zap,
  FileSpreadsheet,
  Plug,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { ViewId, UserRole, AuthUser } from '../../types';

interface SidebarProps {
  activeView: ViewId;
  onSelectView: (view: ViewId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pendingApprovalsCount: number;
  newLeadsCount: number;
  brandName?: string;
  currentUser?: AuthUser;
  onSwitchRole?: (role: UserRole) => void;
  onOpenLogin?: () => void;
}

interface NavItem {
  id: ViewId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeVariant?: 'amber' | 'emerald';
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  pendingApprovalsCount,
  newLeadsCount,
  brandName = 'Sincly',
  currentUser,
  onSwitchRole,
  onOpenLogin
}) => {
  const displayBrand = !brandName || brandName === 'Serpely' || brandName === 'Nexus AI' ? 'Sincly' : brandName;
  const [hoveredItem, setHoveredItem] = useState<{ id: ViewId; label: string; badge?: number } | null>(null);

  // Expandable accordion groups state (defaults to all open)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    core: true,
    marketing: true,
    audience: true,
    operations: true
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const currentRole: UserRole = currentUser?.role || 'director';

  const sections: NavSection[] = [
    {
      id: 'core',
      title: 'Core Platform',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'overview', label: 'System Architecture', icon: Compass },
        { id: 'agents', label: 'AI Agents', icon: Bot },
        { id: 'marketing-hub', label: 'Knowledge Base', icon: Database }
      ]
    },
    {
      id: 'marketing',
      title: 'Marketing & Channels',
      items: [
        { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
        { id: 'content', label: 'Content Studio', icon: FileText },
        { id: 'social', label: 'Social Media', icon: Share2 },
        { id: 'seo', label: 'SEO & Search', icon: Search },
        { id: 'email', label: 'Email Marketing', icon: Mail }
      ]
    },
    {
      id: 'audience',
      title: 'Audience & Leads',
      items: [
        { id: 'community', label: 'Social Inbox', icon: MessageSquare },
        { id: 'leads', label: 'Leads & Pipeline', icon: Users, badge: newLeadsCount, badgeVariant: 'emerald' },
        { id: 'analytics', label: 'Analytics & ROI', icon: BarChart3 },
        { id: 'meetings', label: 'Meetings & Calls', icon: CalendarCheck }
      ]
    },
    {
      id: 'operations',
      title: 'Operations & Settings',
      items: [
        {
          id: 'approvals',
          label: 'Approval Gate',
          icon: ShieldCheck,
          badge: pendingApprovalsCount,
          badgeVariant: 'amber'
        },
        { id: 'automation', label: 'Automations', icon: Zap },
        { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
        { id: 'integrations', label: 'Integrations', icon: Plug },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="relative z-30 flex flex-col h-full rounded-2xl border border-neutral-800/90 bg-neutral-900/95 backdrop-blur-2xl shadow-xl shrink-0 select-none overflow-visible"
    >
      {/* 1. Brand Lockup & Collapse Trigger */}
      <div className="flex h-16 items-center justify-between px-3.5 border-b border-neutral-800/80 bg-neutral-950/60 rounded-t-2xl">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 shadow-lg shadow-emerald-500/20 shrink-0">
              <Sparkles className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm tracking-tight font-sans">
                  {displayBrand}
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-emerald-500/15 text-emerald-300 rounded border border-emerald-500/30">
                  OS
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                Autonomous Growth
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`h-7 w-7 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors ${
            collapsed ? 'hidden' : 'hidden lg:flex'
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Floating Uncollapse Trigger when collapsed (visible on hover) */}
      {collapsed && (
        <div className="hidden lg:flex justify-center pt-2 pb-1 border-b border-neutral-800/60">
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar"
            className="h-6 w-6 flex items-center justify-center rounded-md text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. Scrollable Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {sections.map(section => {
          const isExpanded = expandedSections[section.id] !== false;

          return (
            <div key={section.id} className="space-y-1">
              {/* Accordion Section Header */}
              {!collapsed ? (
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-mono font-semibold tracking-wider text-neutral-500 uppercase hover:text-neutral-300 transition-colors group"
                >
                  <span className="truncate">{section.title}</span>
                  <ChevronDown
                    className={`h-3 w-3 text-neutral-600 group-hover:text-neutral-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </button>
              ) : (
                <div className="h-1 border-t border-neutral-800/80 my-2 mx-1" />
              )}

              {/* Accordion Group Items */}
              <AnimatePresence initial={false}>
                {(isExpanded || collapsed) && (
                  <motion.div
                    key={`group-${section.id}`}
                    initial={collapsed ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {section.items.map(item => {
                      const Icon = item.icon;
                      const isActive = activeView === item.id;

                      return (
                        <div
                          key={item.id}
                          className="relative"
                          onMouseEnter={() => setHoveredItem({ id: item.id, label: item.label, badge: item.badge })}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <button
                            onClick={() => onSelectView(item.id)}
                            className={`relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs transition-colors z-10 ${
                              isActive
                                ? 'text-emerald-300 font-semibold'
                                : 'text-neutral-400 font-medium hover:text-neutral-100 hover:bg-neutral-800/50'
                            }`}
                          >
                            {/* Smooth Active Indicator Glider */}
                            {isActive && (
                              <motion.div
                                layoutId="activeNavIndicator"
                                transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                                className="absolute inset-0 rounded-xl bg-emerald-500/15 border border-emerald-500/35 shadow-sm -z-10"
                              >
                                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                              </motion.div>
                            )}

                            <Icon
                              className={`h-4 w-4 shrink-0 transition-transform duration-150 ${
                                isActive
                                  ? 'text-emerald-400 scale-105'
                                  : 'text-neutral-500 group-hover:text-neutral-300'
                              } ${collapsed ? 'mx-auto' : ''}`}
                            />

                            {!collapsed && (
                              <span className="truncate text-left flex-1">{item.label}</span>
                            )}

                            {/* Badge */}
                            {!collapsed && item.badge !== undefined && item.badge > 0 && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold tabular-nums ${
                                  item.badgeVariant === 'amber'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}

                            {/* Collapsed Dot Badge */}
                            {collapsed && item.badge !== undefined && item.badge > 0 && (
                              <span
                                className={`absolute top-1.5 right-2 h-2 w-2 rounded-full ${
                                  item.badgeVariant === 'amber' ? 'bg-amber-400' : 'bg-emerald-400'
                                } animate-pulse`}
                              />
                            )}
                          </button>

                          {/* Floating Glass Tooltip when Collapsed */}
                          {collapsed && hoveredItem?.id === item.id && (
                            <motion.div
                              initial={{ opacity: 0, x: -6, scale: 0.95 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              exit={{ opacity: 0, x: -6, scale: 0.95 }}
                              transition={{ duration: 0.12 }}
                              className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700/80 text-white font-medium text-xs shadow-2xl z-50 whitespace-nowrap pointer-events-none flex items-center gap-2"
                            >
                              <span>{item.label}</span>
                              {item.badge !== undefined && item.badge > 0 && (
                                <span
                                  className={`rounded-full px-1.5 py-0.2 text-[9px] font-mono ${
                                    item.badgeVariant === 'amber'
                                      ? 'bg-amber-500/30 text-amber-300'
                                      : 'bg-emerald-500/30 text-emerald-300'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.aside>
  );
};
