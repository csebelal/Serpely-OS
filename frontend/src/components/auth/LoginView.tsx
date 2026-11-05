import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Crown,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  UserCheck,
  FileEdit,
  BarChart3,
  KeyRound,
  Info
} from 'lucide-react';
import { UserRole, AuthUser } from '../../types';
import { ROLE_CONFIGS, DEMO_USERS, getAuthUserByRole } from '../../data/rbac-data';

interface LoginViewProps {
  currentRole: UserRole;
  onLogin: (user: AuthUser) => void;
  onCancel?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  currentRole,
  onLogin,
  onCancel
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [email, setEmail] = useState(DEMO_USERS[currentRole].email);
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(DEMO_USERS[role].email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const user = getAuthUserByRole(selectedRole);
      onLogin({
        ...user,
        email: email || user.email
      });
      setIsSubmitting(false);
    }, 450);
  };

  const handleInstantQuickLogin = (role: UserRole) => {
    handleSelectRole(role);
    setIsSubmitting(true);
    setTimeout(() => {
      onLogin(getAuthUserByRole(role));
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-neutral-950 shadow-lg shadow-emerald-500/20 font-black text-lg">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base">
                SERPELY
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Marketing OS
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Autonomous Growth, Multi-Agent Attribution & Approval Gates
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 font-semibold transition-colors"
          >
            Return to Workspace
          </button>
        )}
      </header>

      {/* Main Authentication Center */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-4xl space-y-6">
          {/* Headline */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Role-Based Access Control (RBAC) System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign In & Select Workspace Authority
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
              Select your team role below to authenticate with specific permission boundaries across AI agents, budget sign-offs, and asset publishing.
            </p>
          </div>

          {/* RBAC Role Selector Cards (The 4 Promoted Roles) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold px-1">
              <span className="text-neutral-300 flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
                <span>One-Click Role Selection (Click card to select or log in):</span>
              </span>
              <span className="text-emerald-400 font-mono text-[11px]">
                Active Authority: {ROLE_CONFIGS[selectedRole].label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* 1. Owner */}
              <div
                onClick={() => handleSelectRole('owner')}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'owner'
                    ? 'bg-neutral-900/90 border-amber-500/60 ring-2 ring-amber-500/20 shadow-xl shadow-amber-500/10'
                    : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Crown className="h-4 w-4" />
                    </div>
                    {selectedRole === 'owner' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Selected
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>Owner</span>
                    </h3>
                    <p className="text-xs text-amber-300/90 font-medium mt-0.5">
                      Full workspace control
                    </p>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Complete administrative control over all workspace configurations, API vault, billing, team invitations, and publishing.
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500">
                    {DEMO_USERS.owner.email}
                  </span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleInstantQuickLogin('owner');
                    }}
                    className="text-[11px] font-semibold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Instant Login</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* 2. Director (Active) */}
              <div
                onClick={() => handleSelectRole('director')}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'director'
                    ? 'bg-neutral-900/90 border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-500/10'
                    : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    {selectedRole === 'director' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Director (Active)
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>Director</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-normal">
                        (Active)
                      </span>
                    </h3>
                    <p className="text-xs text-emerald-300/90 font-medium mt-0.5">
                      Approvals & ad spend sign-off
                    </p>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Human-in-the-Loop executive authority. Approves campaigns, signs off on ad spend budgets, and directs AI agent pipelines.
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500">
                    {DEMO_USERS.director.email}
                  </span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleInstantQuickLogin('director');
                    }}
                    className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Instant Login</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* 3. Editor */}
              <div
                onClick={() => handleSelectRole('editor')}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'editor'
                    ? 'bg-neutral-900/90 border-sky-500/60 ring-2 ring-sky-500/20 shadow-xl shadow-sky-500/10'
                    : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <FileEdit className="h-4 w-4" />
                    </div>
                    {selectedRole === 'editor' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Selected
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>Editor</span>
                    </h3>
                    <p className="text-xs text-sky-300/90 font-medium mt-0.5">
                      Draft & schedule assets
                    </p>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Creative execution specialist. Can draft and schedule campaigns, social posts, emails, and content for approval gates.
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500">
                    {DEMO_USERS.editor.email}
                  </span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleInstantQuickLogin('editor');
                    }}
                    className="text-[11px] font-semibold text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>Instant Login</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* 4. Viewer */}
              <div
                onClick={() => handleSelectRole('viewer')}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'viewer'
                    ? 'bg-neutral-900/90 border-purple-500/60 ring-2 ring-purple-500/20 shadow-xl shadow-purple-500/10'
                    : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    {selectedRole === 'viewer' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Selected
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>Viewer</span>
                    </h3>
                    <p className="text-xs text-purple-300/90 font-medium mt-0.5">
                      Read-only analytics
                    </p>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Auditing and analytics role. Full visibility into ROI analytics, attribution models, and performance charts without edit rights.
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500">
                    {DEMO_USERS.viewer.email}
                  </span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleInstantQuickLogin('viewer');
                    }}
                    className="text-[11px] font-semibold text-purple-400 hover:underline flex items-center gap-1"
                  >
                    <span>Instant Login</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Box */}
          <div className="p-6 rounded-3xl bg-neutral-900/70 border border-neutral-800/90 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Account Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="user@serpely.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Password / Token
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role Dropdown & Remember Me */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded bg-neutral-950 border-neutral-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <label
                    htmlFor="remember"
                    className="text-xs text-neutral-400 cursor-pointer select-none"
                  >
                    Keep session active in local storage
                  </label>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-400">Selected Role:</span>
                  <select
                    value={selectedRole}
                    onChange={e => handleSelectRole(e.target.value as UserRole)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-semibold focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="owner">👑 Owner — Full workspace control</option>
                    <option value="director">🎯 Director — Approvals & ad spend sign-off</option>
                    <option value="editor">✍️ Editor — Draft & schedule assets</option>
                    <option value="viewer">👁️ Viewer — Read-only analytics</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin text-neutral-950" />
                      <span>Authenticating & Loading RBAC Permissions...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      <span>
                        Enter Workspace as {ROLE_CONFIGS[selectedRole].label}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security & RBAC Compliance Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>RBAC Security Enforced</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Encrypted Session Vault</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Zero-Trust Approval Gates</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 border-t border-neutral-900 bg-neutral-950 text-center text-xs text-neutral-500">
        Serpely AI Marketing OS · Role-Based Access Control Architecture · Multi-Agent Governance
      </footer>
    </div>
  );
};
