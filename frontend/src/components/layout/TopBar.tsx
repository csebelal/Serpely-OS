import React from 'react';
import {
  Search,
  Sparkles,
  Activity,
  Menu
} from 'lucide-react';
import { ViewId, UserRole, AuthUser } from '../../types';

interface TopBarProps {
  activeView: ViewId;
  onOpenCommand: () => void;
  onOpenSearch?: () => void;
  onSelectView: (view: ViewId) => void;
  pendingApprovalsCount?: number;
  onToggleMobileSidebar: () => void;
  brandName?: string;
  geoScore?: number;
  geoDelta?: number;
  appTheme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  currentUser?: AuthUser;
  onSwitchRole?: (role: UserRole) => void;
  onOpenLogin?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onOpenCommand,
  onOpenSearch,
  onSelectView,
  pendingApprovalsCount = 0,
  onToggleMobileSidebar,
  brandName = 'Sincly',
  geoScore = 88,
  geoDelta = 6.4,
  appTheme = 'dark',
  onToggleTheme,
  currentUser,
  onSwitchRole,
  onOpenLogin
}) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-neutral-800/80 bg-neutral-900/90 px-4 sm:px-6 md:px-7 backdrop-blur-xl">
      {/* Left Side: Mobile Menu Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-300 hover:bg-neutral-800 transition-colors shrink-0"
          aria-label="Toggle menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Right Side: Search Bar, GEO Score & Ask AI */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* 1. Global Search Trigger (⌘K) */}
        <button
          onClick={onOpenSearch || onOpenCommand}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-all min-w-[170px] sm:min-w-[240px] md:min-w-[270px]"
          title="Search AI agents, company knowledge, campaigns, or prompts (⌘K)"
        >
          <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
          <span className="flex-1 text-left truncate">Search agents, company, prompts...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-semibold bg-neutral-800 text-neutral-300 rounded-md border border-neutral-700 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* 2. Live GEO Score Badge */}
        <div
          onClick={() => onSelectView('seo')}
          className="hidden md:flex cursor-pointer items-center gap-2 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/40 transition-all shrink-0"
          title="View Generative Engine Optimization breakdown"
        >
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-neutral-400">GEO</span>
          <span className="text-xs font-bold text-emerald-400 tabular-nums">{geoScore}/100</span>
          <span className="text-[11px] font-semibold text-emerald-400 tabular-nums">+{geoDelta}%</span>
        </div>

        {/* 3. Ask AI Button (⌘J) */}
        <button
          onClick={onOpenCommand}
          className="preserve-theme group relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-all text-xs font-bold shadow-md shadow-emerald-500/20 whitespace-nowrap shrink-0"
          title="Open AI Marketing Orchestrator (⌘J)"
        >
          <Sparkles className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
          <span>Ask AI</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold bg-neutral-950/20 text-neutral-950 rounded">
            ⌘J
          </kbd>
        </button>
      </div>
    </header>
  );
};
