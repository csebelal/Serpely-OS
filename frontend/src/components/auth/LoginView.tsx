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
  KeyRound,
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import { UserRole, AuthUser } from '../../types';
import {
  DEFAULT_ADMIN_USER,
  DEFAULT_ADMIN_PASSWORD,
  authenticateCredentials,
  getStoredRoles,
  getStoredUsers
} from '../../data/rbac-data';
import { CreateRoleModal } from './CreateRoleModal';

interface LoginViewProps {
  currentRole?: UserRole;
  onLogin: (user: AuthUser) => void;
  onCancel?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  onCancel
}) => {
  const [email, setEmail] = useState('support@serpely.com');
  const [password, setPassword] = useState('123454321');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);

  const handleFillDefaultAdmin = () => {
    setEmail(DEFAULT_ADMIN_USER.email);
    setPassword(DEFAULT_ADMIN_PASSWORD);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const authResult = authenticateCredentials(email, password);

      if (!authResult.success || !authResult.user) {
        setErrorMessage(
          authResult.error ||
            'Invalid credentials. Default full-access login is support@serpely.com with password 123454321.'
        );
        setIsSubmitting(false);
        return;
      }

      const authenticatedUser = authResult.user;

      if (rememberMe) {
        try {
          localStorage.setItem('serpely_authenticated_user', JSON.stringify(authenticatedUser));
          localStorage.setItem('serpely_active_role', authenticatedUser.role);
        } catch {}
      }

      onLogin(authenticatedUser);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Ambient lighting effects */}
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

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCreateRoleOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-emerald-400 font-semibold transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create Role</span>
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-300 font-semibold transition-colors"
            >
              Return to Workspace
            </button>
          )}
        </div>
      </header>

      {/* Main Authentication Center */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Headline */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Full-Access Workspace Authentication</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign In to Marketing OS
            </h1>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Authenticate with your administrative credentials to manage autonomous agents, budgets, and publishing.
            </p>
          </div>

          {/* Default Credentials Callout Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-neutral-900 to-emerald-500/5 border border-emerald-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>Default Full-Access Administrator:</span>
              </span>
              <button
                type="button"
                onClick={handleFillDefaultAdmin}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-neutral-950/70 p-2 rounded-xl border border-neutral-800/80">
              <div>
                <span className="text-neutral-500 block text-[9px] uppercase font-sans">Email:</span>
                <span className="text-white font-semibold">support@serpely.com</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[9px] uppercase font-sans">Password:</span>
                <span className="text-amber-300 font-semibold">123454321</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Box */}
          <div className="p-6 rounded-3xl bg-neutral-900/80 border border-neutral-800/90 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="support@serpely.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="123454321"
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

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded bg-neutral-950 border-neutral-700 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-neutral-400">Keep session active</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsCreateRoleOpen(true)}
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <PlusCircle className="h-3 w-3" />
                  <span>Create New Role</span>
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin text-neutral-950" />
                      <span>Authenticating Workspace Session...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      <span>Sign In to Workspace</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security & RBAC Compliance Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>RBAC Full-Access Enforced</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Encrypted Session Vault</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Zero-Trust Gates</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 border-t border-neutral-900 bg-neutral-950 text-center text-xs text-neutral-500">
        Serpely AI Marketing OS · Role-Based Access Control Architecture · Multi-Agent Governance
      </footer>

      {/* Create Role Modal */}
      <CreateRoleModal
        isOpen={isCreateRoleOpen}
        onClose={() => setIsCreateRoleOpen(false)}
        onRoleCreated={(newRole, newUser) => {
          if (newUser) {
            setEmail(newUser.email);
            setPassword((newUser as any).password || '123454321');
          }
        }}
      />
    </div>
  );
};
