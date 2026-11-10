import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  User
} from 'lucide-react';
import { AuthUser, UserRole } from '../../types';
import {
  authenticateCredentials,
  saveCustomUser
} from '../../data/rbac-data';
import { apiClient, setStoredAuthToken } from '../../services/apiClient';

interface LoginViewProps {
  currentRole?: UserRole;
  initialMode?: 'signin' | 'signup';
  appTheme?: 'dark' | 'light';
  canCancel?: boolean;
  onToggleTheme?: () => void;
  onLogin: (user: AuthUser, options?: { isNewUser?: boolean }) => void;
  onCancel?: () => void;
}

const VALUE_PILLARS = [
  {
    icon: Bot,
    title: '12 specialized marketing agents',
    description: 'Coordinate research, content, SEO, email, and social in one workspace.'
  },
  {
    icon: ShieldCheck,
    title: 'Human approval before publishing',
    description: 'Every campaign, post, and budget change waits for your explicit sign-off.'
  },
  {
    icon: Layers,
    title: 'Unified brand memory',
    description: 'Consistent voice, positioning, and audience context across every channel.'
  }
];

export const LoginView: React.FC<LoginViewProps> = ({
  initialMode = 'signin',
  appTheme = 'light',
  canCancel = false,
  onToggleTheme,
  onLogin,
  onCancel
}) => {
  const isDark = appTheme === 'dark';

  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsSignUp(initialMode === 'signup');
  }, [initialMode]);

  const switchAuthMode = (nextSignUp: boolean) => {
    if (nextSignUp === isSignUp) return;
    setIsSignUp(nextSignUp);
    setErrorMessage(null);
    setSuccessMessage(null);
    setConfirmPassword('');
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter your work email address.');
      setIsSubmitting(false);
      return;
    }
    if (!cleanPassword) {
      setErrorMessage('Please enter your password.');
      setIsSubmitting(false);
      return;
    }

    if (isSignUp) {
      if (cleanPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        setIsSubmitting(false);
        return;
      }
      if (cleanPassword !== confirmPassword.trim()) {
        setErrorMessage('Passwords do not match. Please re-type your password.');
        setIsSubmitting(false);
        return;
      }

      try {
        const res = await apiClient.post('/api/auth/register', {
          name: name.trim() || cleanEmail.split('@')[0],
          email: cleanEmail,
          password: cleanPassword,
          role: 'owner'
        });

        if (!res.success || !res.data?.success) {
          setErrorMessage(res.error || res.data?.error || 'Registration failed. Please try again.');
          setIsSubmitting(false);
          return;
        }

        const registeredUser = res.data.user;
        if (res.data.token) {
          setStoredAuthToken(res.data.token);
        }
        try {
          localStorage.setItem('serpely_authenticated_user', JSON.stringify(registeredUser));
          localStorage.setItem('serpely_active_role', registeredUser.role);
          saveCustomUser(registeredUser);
        } catch {}

        onLogin(registeredUser, { isNewUser: true });
      } catch (err: any) {
        setErrorMessage(err?.message || 'Network error connecting to auth server.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        const res = await apiClient.post('/api/auth/login', {
          email: cleanEmail,
          password: cleanPassword
        });

        if (!res.success || !res.data?.success) {
          const fallback = authenticateCredentials(cleanEmail, cleanPassword);
          if (fallback.success && fallback.user) {
            if (rememberMe) {
              try {
                localStorage.setItem('serpely_authenticated_user', JSON.stringify(fallback.user));
                localStorage.setItem('serpely_active_role', fallback.user.role);
              } catch {}
            }
            onLogin(fallback.user, { isNewUser: false });
            return;
          }
          setErrorMessage(
            res.error || res.data?.error || 'Invalid credentials. Please verify your email and password.'
          );
          setIsSubmitting(false);
          return;
        }

        const authenticatedUser = res.data.user;
        if (res.data.token) {
          setStoredAuthToken(res.data.token);
        }
        try {
          localStorage.setItem('serpely_authenticated_user', JSON.stringify(authenticatedUser));
          localStorage.setItem('serpely_active_role', authenticatedUser.role);
        } catch {}

        onLogin(authenticatedUser, { isNewUser: false });
      } catch (err: any) {
        const fallback = authenticateCredentials(cleanEmail, cleanPassword);
        if (fallback.success && fallback.user) {
          if (rememberMe) {
            try {
              localStorage.setItem('serpely_authenticated_user', JSON.stringify(fallback.user));
              localStorage.setItem('serpely_active_role', fallback.user.role);
            } catch {}
          }
          onLogin(fallback.user, { isNewUser: false });
          return;
        }
        setErrorMessage(err?.message || 'Failed to connect to authentication service.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const pageBg = isDark
    ? 'bg-[#070a09] text-slate-100'
    : 'bg-[#f4f7f5] text-slate-900';
  const cardBg = isDark
    ? 'bg-[#0e1411] border-neutral-800'
    : 'bg-white border-slate-200 shadow-sm';
  const mutedText = isDark ? 'text-slate-300' : 'text-slate-600';
  const subtleText = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputSurface = isDark
    ? 'bg-[#090d0b] border-neutral-700 text-slate-100 placeholder:text-slate-500'
    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400';

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans ${pageBg}`}>
      <a
        href="#auth-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-emerald-600 focus:text-white focus:text-sm focus:font-semibold"
      >
        Skip to sign in form
      </a>

      {/* Clean Minimal Top Header */}
      <header
        className={`w-full border-b ${
          isDark ? 'border-neutral-800/80 bg-[#070a09]' : 'border-slate-200/80 bg-white/80'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              S
            </div>
            <span className="font-bold tracking-tight text-sm uppercase">
              SINCLY{' '}
              <span className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>
                OS
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {canCancel && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isDark
                    ? 'border-neutral-800 text-slate-200 hover:bg-neutral-900'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Back to workspace</span>
              </button>
            )}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className={`p-2 rounded-xl border cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isDark
                    ? 'border-neutral-800 bg-neutral-900 text-slate-200 hover:bg-neutral-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isDark ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        id="auth-main"
        className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center"
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Clear Value Proposition */}
          <section aria-labelledby="auth-hero-heading" className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
                  isDark
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Human-in-the-loop Marketing OS</span>
              </div>

              <h1
                id="auth-hero-heading"
                className="text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold tracking-tight leading-[1.15]"
              >
                Autonomous marketing,{' '}
                <span className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>
                  built for clarity.
                </span>
              </h1>

              <p className={`text-sm sm:text-base max-w-md leading-relaxed ${mutedText}`}>
                Plan campaigns, publish across channels, and review every AI action from one calm command center.
              </p>
            </div>

            <ul className="space-y-4 pt-1">
              {VALUE_PILLARS.map(item => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex items-start gap-3.5">
                    <div
                      className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                        isDark
                          ? 'bg-neutral-900 border-neutral-800 text-emerald-400'
                          : 'bg-white border-slate-200 text-emerald-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="space-y-0.5">
                      <h2 className="text-sm font-semibold">{item.title}</h2>
                      <p className={`text-xs sm:text-sm leading-relaxed ${mutedText}`}>
                        {item.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Right Column: Accessible Authentication Card */}
          <section aria-labelledby="auth-card-heading" className="lg:col-span-6 w-full">
            <div className={`w-full max-w-md mx-auto rounded-2xl border p-6 sm:p-8 space-y-6 ${cardBg}`}>
              {/* Accessible Mode Switcher */}
              <div
                role="tablist"
                aria-label="Authentication mode"
                className={`grid grid-cols-2 p-1 rounded-xl border ${
                  isDark
                    ? 'bg-[#090d0b] border-neutral-800'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isSignUp}
                  onClick={() => switchAuthMode(false)}
                  className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    !isSignUp
                      ? isDark
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-900 shadow-xs'
                      : isDark
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isSignUp}
                  onClick={() => switchAuthMode(true)}
                  className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isSignUp
                      ? isDark
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-900 shadow-xs'
                      : isDark
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create account
                </button>
              </div>

              <div className="space-y-1">
                <h2 id="auth-card-heading" className="text-xl sm:text-2xl font-bold tracking-tight">
                  {isSignUp ? 'Create your workspace' : 'Sign in to Sincly'}
                </h2>
                <p className={`text-xs sm:text-sm ${mutedText}`}>
                  {isSignUp
                    ? 'Start with a quick 3-step brand setup after creating your account.'
                    : 'Enter your email and password to open your workspace.'}
                </p>
              </div>

              {errorMessage && (
                <div
                  id="auth-form-error"
                  role="alert"
                  aria-live="assertive"
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-start gap-2.5 ${
                    isDark
                      ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-start gap-2.5 ${
                    isDark
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" aria-hidden="true" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label htmlFor="auth-name" className="block text-xs sm:text-sm font-semibold">
                      Full name
                    </label>
                    <div className="relative">
                      <User
                        className={`h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${subtleText}`}
                        aria-hidden="true"
                      />
                      <input
                        id="auth-name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Alex Rivera"
                        aria-describedby={errorMessage ? 'auth-form-error' : undefined}
                        className={`w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${inputSurface}`}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="auth-email" className="block text-xs sm:text-sm font-semibold">
                    Work email
                  </label>
                  <div className="relative">
                    <Mail
                      className={`h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${subtleText}`}
                      aria-hidden="true"
                    />
                    <input
                      id="auth-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      aria-invalid={Boolean(errorMessage && !email.trim())}
                      aria-describedby={errorMessage ? 'auth-form-error' : undefined}
                      className={`w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${inputSurface}`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="auth-password" className="block text-xs sm:text-sm font-semibold">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${subtleText}`}
                      aria-hidden="true"
                    />
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={isSignUp ? 'Minimum 6 characters' : 'Enter your password'}
                      aria-invalid={Boolean(errorMessage && !password.trim())}
                      aria-describedby={
                        [errorMessage ? 'auth-form-error' : '', isSignUp ? 'auth-password-hint' : '']
                          .filter(Boolean)
                          .join(' ') || undefined
                      }
                      className={`w-full min-h-[44px] pl-10 pr-11 py-2.5 rounded-xl border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${inputSurface}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        isDark
                          ? 'text-slate-300 hover:bg-neutral-800 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {isSignUp && (
                    <p id="auth-password-hint" className={`text-xs ${subtleText}`}>
                      Use at least 6 characters.
                    </p>
                  )}
                </div>

                {isSignUp && (
                  <div className="space-y-1.5">
                    <label htmlFor="auth-confirm-password" className="block text-xs sm:text-sm font-semibold">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock
                        className={`h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${subtleText}`}
                        aria-hidden="true"
                      />
                      <input
                        id="auth-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        aria-invalid={Boolean(
                          confirmPassword && password.trim() !== confirmPassword.trim()
                        )}
                        className={`w-full min-h-[44px] pl-10 pr-11 py-2.5 rounded-xl border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${inputSurface}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(prev => !prev)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        aria-pressed={showConfirmPassword}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                          isDark
                            ? 'text-slate-300 hover:bg-neutral-800 hover:text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rememberSession"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 accent-emerald-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    />
                    <label
                      htmlFor="rememberSession"
                      className={`text-xs sm:text-sm font-medium cursor-pointer ${mutedText}`}
                    >
                      Keep me signed in
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full min-h-[46px] px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold cursor-pointer transition-colors duration-150 motion-reduce:transition-none flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                      <span>{isSignUp ? 'Creating workspace...' : 'Signing in...'}</span>
                    </>
                  ) : (
                    <span>{isSignUp ? 'Create account & continue' : 'Sign in'}</span>
                  )}
                </button>
              </form>

              <div
                className={`pt-4 border-t text-center text-xs sm:text-sm ${
                  isDark ? 'border-neutral-800 text-slate-300' : 'border-slate-200 text-slate-600'
                }`}
              >
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => switchAuthMode(!isSignUp)}
                  className={`font-semibold underline underline-offset-4 cursor-pointer rounded px-1 py-0.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isDark
                      ? 'text-emerald-400 hover:text-emerald-300'
                      : 'text-emerald-700 hover:text-emerald-800'
                  }`}
                >
                  {isSignUp ? 'Sign in' : 'Create an account'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className={`w-full py-4 px-4 text-center text-xs font-medium ${subtleText}`}>
        Sincly AI Marketing OS · Autonomous Multi-Agent Governance
      </footer>
    </div>
  );
};
