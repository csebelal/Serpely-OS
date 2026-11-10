import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Globe,
  Megaphone,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Users
} from 'lucide-react';
import { AuthUser, BrandProfile } from '../../types';

export interface OnboardingResult {
  brandProfile: BrandProfile;
  primaryGoal: string;
}

interface OnboardingViewProps {
  user: AuthUser;
  brandProfile: BrandProfile;
  appTheme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onComplete: (result: OnboardingResult) => void;
  onSkip: () => void;
}

const INDUSTRY_OPTIONS = [
  'B2B SaaS',
  'E-commerce & Retail',
  'Agency & Consulting',
  'Fintech',
  'Developer Tools',
  'Healthcare & Wellness',
  'Education',
  'Other'
];

const VOICE_TONE_OPTIONS = [
  {
    value: 'Professional, Engaging & Authoritative',
    title: 'Professional & Authoritative',
    description: 'Clear, credible, and executive-ready.'
  },
  {
    value: 'Friendly, Warm & Conversational',
    title: 'Friendly & Conversational',
    description: 'Approachable, human-first, and relatable.'
  },
  {
    value: 'Bold, Direct & Challenger',
    title: 'Bold & Challenger',
    description: 'Opinionated, crisp, and high-conviction.'
  },
  {
    value: 'Technical, Data-Backed & Educational',
    title: 'Technical & Educational',
    description: 'Precise, structured, and insight-driven.'
  }
];

const PRIMARY_GOAL_OPTIONS = [
  {
    value: 'Grow organic & AI search (SEO / GEO)',
    title: 'Grow organic & AI search',
    description: 'Rank in Google and AI answer engines.'
  },
  {
    value: 'Automate multi-channel social publishing',
    title: 'Automate social publishing',
    description: 'Plan and approve LinkedIn, X, and video posts.'
  },
  {
    value: 'Launch outbound email sequences',
    title: 'Launch email sequences',
    description: 'Build onboarding and nurture campaigns.'
  },
  {
    value: 'Capture & qualify inbound leads',
    title: 'Capture & qualify leads',
    description: 'Convert traffic into booked meetings.'
  }
];

const STEPS = [
  { id: 1, label: 'Workspace' },
  { id: 2, label: 'Voice & Goals' },
  { id: 3, label: 'Review' }
] as const;

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  user,
  brandProfile,
  appTheme = 'light',
  onToggleTheme,
  onComplete,
  onSkip
}) => {
  const isDark = appTheme === 'dark';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [brandName, setBrandName] = useState(() =>
    brandProfile.name && brandProfile.name !== 'My Workspace'
      ? brandProfile.name
      : ''
  );
  const [website, setWebsite] = useState(brandProfile.website || '');
  const [industry, setIndustry] = useState(brandProfile.industry || 'B2B SaaS');
  const [voiceTone, setVoiceTone] = useState(
    brandProfile.voiceTone || VOICE_TONE_OPTIONS[0].value
  );
  const [primaryGoal, setPrimaryGoal] = useState(PRIMARY_GOAL_OPTIONS[0].value);
  const [targetAudience, setTargetAudience] = useState(
    brandProfile.targetAudience || ''
  );
  const [stepError, setStepError] = useState<string | null>(null);

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [step]);

  const handleNext = () => {
    setStepError(null);
    if (step === 1) {
      if (!brandName.trim()) {
        setStepError('Please enter your workspace or brand name to continue.');
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStepError(null);
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = brandName.trim() || `${user.name.split(' ')[0]}'s Workspace`;
    const cleanWebsite = website.trim();
    const cleanAudience = targetAudience.trim();

    const updatedProfile: BrandProfile = {
      ...brandProfile,
      name: cleanName,
      website: cleanWebsite,
      industry,
      voiceTone,
      targetAudience: cleanAudience || brandProfile.targetAudience || 'Growth & Marketing Teams',
      keyThemes: Array.from(
        new Set([...(brandProfile.keyThemes || []), primaryGoal])
      )
    };

    onComplete({
      brandProfile: updatedProfile,
      primaryGoal
    });
  };

  const pageBg = isDark
    ? 'bg-[#070a09] text-white'
    : 'bg-[#f4f7f5] text-neutral-900';
  const cardBg = isDark
    ? 'bg-[#0e1411] border-neutral-800'
    : 'bg-white border-neutral-200 shadow-sm';
  const headingText = isDark ? 'text-white' : 'text-neutral-900';
  const bodyText = isDark ? 'text-neutral-200' : 'text-neutral-800';
  const mutedText = isDark ? 'text-neutral-400' : 'text-neutral-600';
  const subtleText = isDark ? 'text-neutral-500' : 'text-neutral-500';
  const inputSurface = isDark
    ? 'bg-[#090d0b] border-neutral-700 text-white placeholder:text-neutral-500'
    : 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400';
  const optionIdle = isDark
    ? 'bg-[#090d0b] border-neutral-800 hover:border-neutral-700 text-neutral-200'
    : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-800';
  const optionSelected = isDark
    ? 'bg-emerald-950/60 border-emerald-500 text-white'
    : 'bg-emerald-50/70 border-emerald-600 text-neutral-900';

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans ${pageBg}`}>
      <a
        href="#onboarding-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-emerald-600 focus:text-white focus:text-sm focus:font-semibold"
      >
        Skip to onboarding content
      </a>

      {/* Top Header */}
      <header
        className={`w-full border-b ${
          isDark ? 'border-neutral-800/80 bg-[#070a09]' : 'border-neutral-200/80 bg-white/80'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              S
            </div>
            <span className={`font-bold tracking-tight text-sm uppercase ${headingText}`}>
              SINCLY{' '}
              <span className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>
                OS
              </span>
            </span>
          </div>

          {/* Step Progress Indicator */}
          <nav aria-label="Onboarding steps" className="hidden sm:flex items-center gap-2">
            <ol className="flex items-center gap-2">
              {STEPS.map((item, idx) => {
                const isActive = step === item.id;
                const isDone = step > item.id;
                return (
                  <li key={item.id} className="flex items-center gap-2">
                    <div
                      aria-current={isActive ? 'step' : undefined}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors duration-150 motion-reduce:transition-none ${
                        isActive
                          ? isDark
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                            : 'bg-emerald-50 border-emerald-600 text-emerald-800'
                          : isDone
                            ? isDark
                              ? 'bg-neutral-900 border-emerald-700/60 text-emerald-400'
                              : 'bg-emerald-50/60 border-emerald-300 text-emerald-700'
                            : isDark
                              ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
                              : 'bg-neutral-50 border-neutral-200 text-neutral-500'
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isActive
                              ? 'bg-emerald-600 text-white'
                              : isDark
                                ? 'bg-neutral-800 text-neutral-300'
                                : 'bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {isDone ? <Check className="h-3 w-3" aria-hidden="true" /> : item.id}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <span
                        aria-hidden="true"
                        className={`w-4 h-px ${isDark ? 'bg-neutral-800' : 'bg-neutral-300'}`}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className={`p-2 rounded-xl border cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isDark
                    ? 'border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {isDark ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={onSkip}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                isDark
                  ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:text-white'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              Skip setup
            </button>
          </div>
        </div>
      </header>

      {/* Main Centered Onboarding Card */}
      <main
        id="onboarding-main"
        className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center"
      >
        {/* Mobile Step Indicator */}
        <p className={`sm:hidden text-xs font-semibold mb-3 ${subtleText}`} aria-live="polite">
          Step {step} of {STEPS.length}: {STEPS[step - 1].label}
        </p>

        <form onSubmit={handleLaunch} noValidate className={`rounded-2xl border p-6 sm:p-8 ${cardBg}`}>
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Step 1 of 3 · Welcome, {user.name.split(' ')[0]}
                </p>
                <h1
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className={`text-2xl sm:text-3xl font-bold tracking-tight focus:outline-none ${headingText}`}
                >
                  Tell us about your brand
                </h1>
                <p className={`text-sm ${mutedText}`}>
                  Your AI agents use these details to tailor copy, SEO briefs, and outreach.
                </p>
              </div>

              {stepError && (
                <div
                  id="onboarding-step-error"
                  role="alert"
                  className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                    isDark
                      ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <span className="font-bold">!</span>
                  <span>{stepError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="onboarding-brand-name" className={`block text-sm font-semibold ${bodyText}`}>
                    Workspace or brand name <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Building2
                      className={`h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${subtleText}`}
                      aria-hidden="true"
                    />
                    <input
                      id="onboarding-brand-name"
                      type="text"
                      required
                      value={brandName}
                      onChange={e => {
                        setBrandName(e.target.value);
                        if (stepError) setStepError(null);
                      }}
                      placeholder="e.g. Sincly Labs"
                      aria-invalid={Boolean(stepError)}
                      aria-describedby={stepError ? 'onboarding-step-error' : undefined}
                      className={`w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${inputSurface}`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="onboarding-website" className={`block text-sm font-semibold ${bodyText}`}>
                    Website URL <span className={`font-normal text-xs ${subtleText}`}>(optional)</span>
                  </label>
                  <div className="relative">
                    <Globe
                      className={`h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${subtleText}`}
                      aria-hidden="true"
                    />
                    <input
                      id="onboarding-website"
                      type="url"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      placeholder="https://yourcompany.com"
                      className={`w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${inputSurface}`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="onboarding-industry" className={`block text-sm font-semibold ${bodyText}`}>
                    Industry
                  </label>
                  <select
                    id="onboarding-industry"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-sm cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${inputSurface}`}
                  >
                    {INDUSTRY_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Step 2 of 3 · Voice & Priorities
                </p>
                <h1
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className={`text-2xl sm:text-3xl font-bold tracking-tight focus:outline-none ${headingText}`}
                >
                  Set your brand voice and goal
                </h1>
                <p className={`text-sm ${mutedText}`}>
                  Choose how Sincly writes for your audience and what to prioritize first.
                </p>
              </div>

              <fieldset className="space-y-2.5">
                <legend className={`text-sm font-semibold flex items-center gap-2 mb-1 ${headingText}`}>
                  <Megaphone className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>Brand voice & tone</span>
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VOICE_TONE_OPTIONS.map(option => {
                    const checked = voiceTone === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-within:ring-2 focus-within:ring-emerald-500 ${
                          checked ? optionSelected : optionIdle
                        }`}
                      >
                        <input
                          type="radio"
                          name="voiceTone"
                          value={option.value}
                          checked={checked}
                          onChange={() => setVoiceTone(option.value)}
                          className="mt-1 h-4 w-4 accent-emerald-600 cursor-pointer shrink-0"
                        />
                        <span className="space-y-0.5">
                          <span className={`block text-sm font-semibold ${headingText}`}>{option.title}</span>
                          <span className={`block text-xs ${mutedText}`}>{option.description}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="space-y-2.5">
                <legend className={`text-sm font-semibold flex items-center gap-2 mb-1 ${headingText}`}>
                  <Target className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>Primary 30-day goal</span>
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRIMARY_GOAL_OPTIONS.map(goal => {
                    const checked = primaryGoal === goal.value;
                    return (
                      <label
                        key={goal.value}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-within:ring-2 focus-within:ring-emerald-500 ${
                          checked ? optionSelected : optionIdle
                        }`}
                      >
                        <input
                          type="radio"
                          name="primaryGoal"
                          value={goal.value}
                          checked={checked}
                          onChange={() => setPrimaryGoal(goal.value)}
                          className="mt-1 h-4 w-4 accent-emerald-600 cursor-pointer shrink-0"
                        />
                        <span className="space-y-0.5">
                          <span className={`block text-sm font-semibold ${headingText}`}>{goal.title}</span>
                          <span className={`block text-xs ${mutedText}`}>{goal.description}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="space-y-1.5">
                <label htmlFor="onboarding-audience" className={`text-sm font-semibold flex items-center gap-2 ${bodyText}`}>
                  <Users className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>
                    Target audience <span className={`font-normal text-xs ${subtleText}`}>(optional)</span>
                  </span>
                </label>
                <input
                  id="onboarding-audience"
                  type="text"
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  placeholder="e.g. SaaS founders, VP Marketing, and growth teams"
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${inputSurface}`}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1.5">
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Step 3 of 3 · Ready to Launch
                </p>
                <h1
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className={`text-2xl sm:text-3xl font-bold tracking-tight focus:outline-none ${headingText}`}
                >
                  Review your workspace setup
                </h1>
                <p className={`text-sm ${mutedText}`}>
                  Everything below can be updated anytime from Marketing Hub or Settings.
                </p>
              </div>

              <dl
                className={`rounded-xl border divide-y ${
                  isDark
                    ? 'border-neutral-800 divide-neutral-800 bg-[#090d0b]'
                    : 'border-neutral-200 divide-neutral-200 bg-neutral-50/70'
                }`}
              >
                <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <dt className={`text-xs font-semibold uppercase tracking-wide ${subtleText}`}>
                    Workspace Name
                  </dt>
                  <dd className={`text-sm font-semibold ${headingText}`}>{brandName.trim()}</dd>
                </div>
                <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <dt className={`text-xs font-semibold uppercase tracking-wide ${subtleText}`}>
                    Website & Industry
                  </dt>
                  <dd className={`text-sm font-medium ${headingText}`}>
                    {website.trim() ? `${website.trim()} · ` : ''}
                    {industry}
                  </dd>
                </div>
                <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <dt className={`text-xs font-semibold uppercase tracking-wide ${subtleText}`}>
                    Brand Voice
                  </dt>
                  <dd className={`text-sm font-medium ${headingText}`}>{voiceTone}</dd>
                </div>
                <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <dt className={`text-xs font-semibold uppercase tracking-wide ${subtleText}`}>
                    Primary Goal
                  </dt>
                  <dd className={`text-sm font-medium ${headingText}`}>{primaryGoal}</dd>
                </div>
                {targetAudience.trim() && (
                  <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <dt className={`text-xs font-semibold uppercase tracking-wide ${subtleText}`}>
                      Target Audience
                    </dt>
                    <dd className={`text-sm font-medium ${headingText}`}>{targetAudience.trim()}</dd>
                  </div>
                )}
              </dl>

              <div
                className={`rounded-xl border p-4 space-y-2.5 ${
                  isDark
                    ? 'border-emerald-800/70 bg-emerald-950/35'
                    : 'border-emerald-200 bg-emerald-50/70'
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>Included in your workspace</span>
                </p>
                <ul className={`space-y-1.5 text-sm ${mutedText}`}>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Brand profile synced to persistent workspace memory</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>Human approval gate active before any live publishing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>12 specialized AI agents ready in Command Center</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Footer Navigation Controls */}
          <div
            className={`mt-8 pt-5 border-t flex items-center justify-between gap-3 ${
              isDark ? 'border-neutral-800' : 'border-neutral-200'
            }`}
          >
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className={`inline-flex items-center gap-2 px-4 min-h-[44px] rounded-xl border text-sm font-semibold cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isDark
                    ? 'border-neutral-700 text-neutral-200 hover:bg-neutral-800'
                    : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back</span>
              </button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold cursor-pointer transition-colors duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>Launch Workspace</span>
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
};
