import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  UserCheck,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Check
} from 'lucide-react';
import { UserRole, AuthUser } from '../../types';
import {
  DEFAULT_ADMIN_USER,
  DEFAULT_ADMIN_PASSWORD,
  authenticateCredentials
} from '../../data/rbac-data';

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
    }, 380);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8faf9] text-neutral-800 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Background soft pastel ambient mesh glow (Sincly Mint & Emerald vibe) */}
      <div className="absolute top-0 left-[-8%] w-[650px] h-[650px] bg-gradient-to-br from-emerald-200/45 via-teal-100/35 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[25%] w-[600px] h-[600px] bg-gradient-to-tr from-pink-200/35 via-emerald-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[15%] right-[-6%] w-[550px] h-[550px] bg-gradient-to-bl from-teal-200/30 via-emerald-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Split-Screen Layout matching the user's reference UI */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-14 py-8 lg:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ============================================================
              LEFT COLUMN: HERO HEADLINE + 3D WORKSTATION ILLUSTRATION
              ============================================================ */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8 relative">
            
            {/* Headline Section with 3D floating accent circle */}
            <div className="relative max-w-xl">
              {/* Floating 3D accent sphere behind text matching reference */}
              <div className="absolute -top-6 right-8 sm:right-16 w-24 h-24 rounded-full bg-gradient-to-br from-pink-300 to-rose-200/90 shadow-lg shadow-pink-300/30 blur-[0.5px] pointer-events-none z-0" />

              <div className="relative z-10 space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-neutral-900 tracking-tight leading-[1.12]">
                  The World Most <br />
                  <span className="text-neutral-900">Powerful </span>
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    Marketing OS.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-neutral-500 font-medium max-w-md leading-relaxed">
                  Scale multi-agent campaigns, autonomous publishing, and human-in-the-loop approvals with the Fastest Autonomous Growth Platform.
                </p>
              </div>
            </div>

            {/* 3D Isometric Workstation Monitor & Creative Studio Graphic */}
            <div className="relative w-full max-w-lg mx-auto lg:mx-0 pt-2 pb-6">
              
              {/* Desktop Monitor SVG */}
              <svg
                viewBox="0 0 540 380"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto drop-shadow-2xl"
              >
                <defs>
                  {/* Gradients */}
                  <linearGradient id="monitorBody" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#eef4f1" />
                  </linearGradient>
                  <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#f1f5f9" />
                  </linearGradient>
                  <linearGradient id="standGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </linearGradient>
                  <linearGradient id="videoCardGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f8faf9" />
                  </linearGradient>
                  <linearGradient id="playBtnGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="cameraGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                  <linearGradient id="keyboardGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e5ede8" />
                  </linearGradient>

                  {/* Soft Drop Shadows */}
                  <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
                    <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#064e3b" floodOpacity="0.12" />
                  </filter>
                  <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="3" dy="8" stdDeviation="10" floodColor="#000000" floodOpacity="0.08" />
                  </filter>
                  <filter id="groundShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
                  </filter>
                </defs>

                {/* Ground Shadow underneath monitor & peripherals */}
                <ellipse cx="230" cy="335" rx="190" ry="22" fill="#0f172a" fillOpacity="0.07" filter="url(#groundShadow)" />
                <ellipse cx="430" cy="340" rx="45" ry="12" fill="#0f172a" fillOpacity="0.06" filter="url(#groundShadow)" />

                {/* --- MONITOR STAND --- */}
                {/* Base */}
                <path d="M190 325 Q230 318 270 325 L285 332 Q230 338 175 332 Z" fill="url(#standGrad)" />
                {/* Arm Stem */}
                <path d="M218 220 L242 220 L246 324 L214 324 Z" fill="url(#standGrad)" />
                <path d="M214 220 L246 220 L244 235 L216 235 Z" fill="#cbd5e1" opacity="0.7" />

                {/* --- MONITOR CASING --- */}
                <rect x="45" y="40" width="370" height="230" rx="22" fill="url(#monitorBody)" filter="url(#softShadow)" stroke="#e2ece6" strokeWidth="2" />
                {/* Inner Screen Bezel */}
                <rect x="58" y="52" width="344" height="204" rx="14" fill="url(#screenGrad)" stroke="#cbd5e1" strokeWidth="1" />

                {/* Top Browser Bar */}
                <path d="M58 52 H402 V76 H58 Z" fill="#ffffff" />
                <line x1="58" y1="76" x2="402" y2="76" stroke="#e2e8f0" strokeWidth="1" />
                {/* Traffic Light Dots */}
                <circle cx="74" cy="64" r="4" fill="#ef4444" opacity="0.8" />
                <circle cx="86" cy="64" r="4" fill="#f59e0b" opacity="0.8" />
                <circle cx="98" cy="64" r="4" fill="#10b981" opacity="0.8" />
                {/* Browser Search Bar Pill */}
                <rect x="115" y="58" width="160" height="12" rx="6" fill="#f1f5f9" />

                {/* --- CANVAS CONTENT INSIDE MONITOR --- */}
                {/* 1. Color Palette Swatch Circles with Dropper */}
                <g transform="translate(85, 115)">
                  {/* Swatches */}
                  <circle cx="20" cy="30" r="14" fill="#fbcfe8" />
                  <circle cx="42" cy="18" r="14" fill="#6ee7b7" />
                  <circle cx="36" cy="42" r="14" fill="#fde68a" />
                  {/* Eyedropper Tool */}
                  <g transform="translate(48, 8) rotate(45)">
                    <rect x="0" y="0" width="8" height="22" rx="4" fill="#475569" />
                    <circle cx="4" cy="4" r="6" fill="#334155" />
                    <polygon points="4,28 1,22 7,22" fill="#334155" />
                  </g>
                </g>

                {/* 2. Text Hierarchy Lines in Sincly Emerald Theme */}
                <rect x="175" y="105" width="85" height="42" rx="8" fill="#10b981" />
                <line x1="187" y1="116" x2="248" y2="116" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                <line x1="187" y1="126" x2="240" y2="126" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                <line x1="187" y1="136" x2="225" y2="136" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />

                {/* 3. Typography "Aa" Badge */}
                <g transform="translate(285, 170)">
                  <rect x="0" y="0" width="55" height="42" rx="8" fill="#ffffff" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.5" />
                  <text x="14" y="27" fill="#64748b" fontFamily="Inter, sans-serif" fontWeight="bold" fontSize="16">Aa</text>
                  <circle cx="0" cy="0" r="3" fill="#10b981" />
                  <circle cx="55" cy="0" r="3" fill="#10b981" />
                  <circle cx="0" cy="42" r="3" fill="#10b981" />
                  <circle cx="55" cy="42" r="3" fill="#10b981" />
                </g>

                {/* 4. Floating 3D Video Playback Card (Popping out of screen as in reference image) */}
                <g transform="translate(310, 75)" filter="url(#cardShadow)">
                  <rect x="0" y="0" width="105" height="105" rx="16" fill="url(#videoCardGrad)" stroke="#e2ece6" strokeWidth="1.5" />
                  {/* Video Screen Area */}
                  <rect x="8" y="8" width="89" height="64" rx="10" fill="#f1f5f9" />
                  {/* 3D Play Button */}
                  <polygon points="46,32 46,50 62,41" fill="url(#playBtnGrad)" filter="url(#softShadow)" />
                  {/* Video Progress Bar / Status Pill */}
                  <rect x="18" y="82" width="69" height="12" rx="6" fill="#fecdd3" />
                  <rect x="22" y="86" width="30" height="4" rx="2" fill="#fb7185" />
                </g>

                {/* --- 3D KEYBOARD IN FRONT ON DESK --- */}
                <g transform="translate(115, 305)" filter="url(#cardShadow)">
                  <rect x="0" y="0" width="165" height="26" rx="8" fill="url(#keyboardGrad)" stroke="#cbd5e1" strokeWidth="1" />
                  {/* Key rows simulation */}
                  <line x1="8" y1="8" x2="157" y2="8" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="6 3" strokeLinecap="round" />
                  <line x1="8" y1="16" x2="157" y2="16" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="8 3" strokeLinecap="round" />
                </g>

                {/* --- 3D STUDIO CAMERA ON DESK --- */}
                <g transform="translate(360, 275)" filter="url(#cardShadow)">
                  {/* Camera Body */}
                  <rect x="0" y="10" width="75" height="52" rx="14" fill="url(#cameraGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
                  {/* Camera Shutter / Top button */}
                  <rect x="10" y="4" width="16" height="7" rx="3" fill="#fb7185" />
                  <rect x="52" y="5" width="12" height="6" rx="2" fill="#64748b" />
                  {/* Large Camera Lens */}
                  <circle cx="37" cy="36" r="18" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
                  <circle cx="37" cy="36" r="14" fill="#fed7aa" />
                  <circle cx="37" cy="36" r="9" fill="#1e293b" />
                  <circle cx="34" cy="33" r="3" fill="#ffffff" opacity="0.8" />
                </g>
              </svg>
            </div>
          </div>

          {/* ============================================================
              RIGHT COLUMN: MODERN SINCLY AUTHENTICATION CARD
              ============================================================ */}
          <div className="lg:col-span-5 relative flex flex-col justify-center">
            
            {/* 3D Floating Translucent Geometric Cube Decoration (as in reference image) */}
            <div className="hidden sm:block absolute -right-6 top-1/2 -translate-y-8 w-20 h-20 pointer-events-none z-0">
              <svg viewBox="0 0 100 100" fill="none" className="w-full h-full opacity-85 drop-shadow-xl animate-pulse">
                {/* 3D Isometric Cube in Soft Rose & Mint */}
                <path d="M50 15 L85 35 L50 55 L15 35 Z" fill="#fed7aa" fillOpacity="0.85" />
                <path d="M15 35 L50 55 L50 90 L15 70 Z" fill="#fbcfe8" fillOpacity="0.9" />
                <path d="M50 55 L85 35 L85 70 L50 90 Z" fill="#f472b6" fillOpacity="0.75" />
              </svg>
            </div>

            {/* Bottom floating soft pink/mint sphere */}
            <div className="hidden sm:block absolute right-4 -bottom-6 w-14 h-14 rounded-full bg-gradient-to-tr from-pink-300 to-rose-200/90 shadow-lg shadow-pink-200/50 pointer-events-none" />

            {/* Main Form Box Container */}
            <div className="relative z-10 w-full max-w-md mx-auto space-y-6">
              
              {/* Top Row: Brand Monogram / Cancel Return */}
              <div className="flex items-center justify-between">
                {/* Sincly Brand Monogram Pill matching reference UI */}
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-600/25">
                    S
                  </div>
                  <span className="font-extrabold text-neutral-900 tracking-tight text-sm uppercase">
                    SINCLY <span className="text-[10px] text-emerald-600 font-mono font-bold">OS</span>
                  </span>
                </div>

                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="text-xs text-neutral-400 hover:text-neutral-700 font-semibold transition-colors"
                  >
                    Return to Workspace
                  </button>
                )}
              </div>

              {/* Headings */}
              <div className="space-y-1.5 pt-2">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight flex items-baseline">
                  <span>Sign in Now</span>
                  <span className="text-emerald-500 text-4xl">.</span>
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 font-medium">
                  Enter your detail below
                </p>
              </div>

              {/* Default Full-Access Credentials Hint Card */}
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 text-xs flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-medium text-[11px]">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>
                    Default Admin: <strong className="font-mono text-emerald-950 font-bold">support@serpely.com</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDefaultAdmin}
                  className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 shadow-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                
                {/* 1. Username or Email Input Field matching reference image card */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Username or Email
                  </label>
                  <div className="relative flex items-center rounded-2xl bg-white border border-neutral-200/90 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <div className="pl-4 pr-2 text-neutral-400">
                      <Mail className="h-4 w-4 text-emerald-600" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="dash@ui8.net"
                      className="w-full py-3.5 pr-4 text-xs font-mono text-neutral-900 placeholder:text-neutral-300 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. Password Input Field matching reference image card */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-neutral-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleFillDefaultAdmin}
                      className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      Default: 123454321
                    </button>
                  </div>
                  <div className="relative flex items-center rounded-2xl bg-white border border-neutral-200/90 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <div className="pl-4 pr-2 text-neutral-400">
                      <Lock className="h-4 w-4 text-emerald-600" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full py-3.5 pr-10 text-xs font-mono text-neutral-900 placeholder:text-neutral-300 bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-neutral-400 hover:text-neutral-700 transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="rememberSession"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-md border-neutral-300 text-emerald-600 focus:ring-emerald-500/30 cursor-pointer"
                  />
                  <label htmlFor="rememberSession" className="text-xs text-neutral-500 font-medium cursor-pointer select-none">
                    Keep session active in local storage
                  </label>
                </div>

                {/* CTA Submit Button (Styled matching the reference image's pill button) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-44 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="h-4 w-4 animate-spin text-white" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Subtle Trust & Security Footer */}
              <div className="pt-4 flex items-center gap-4 text-[11px] text-neutral-400 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  RBAC Enforced
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  Full-Access Session
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Clean Minimalist Bottom Footer */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-neutral-400 font-medium">
        Sincly AI Marketing OS · Autonomous Multi-Agent Governance
      </footer>
    </div>
  );
};
