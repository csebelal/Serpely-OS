import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Activity,
  Menu,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck
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
  onLogout?: () => void;
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
  onOpenLogin,
  onLogout
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

        {/* 4. Active User Profile & Session Controls */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer"
              title={`Logged in as ${currentUser.name} (${currentUser.role})`}
            >
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 text-neutral-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                {currentUser.initials || 'SS'}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-bold text-white truncate max-w-[110px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase leading-none">
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-neutral-400 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-2.5 z-40 text-xs space-y-1.5">
                  <div className="p-2 border-b border-neutral-800 space-y-0.5">
                    <p className="font-bold text-white text-xs">{currentUser.name}</p>
                    <p className="text-[11px] font-mono text-neutral-400">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                      {currentUser.role} (Full Access)
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenLogin?.();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 text-left transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Switch Role / Login Portal</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-left transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
