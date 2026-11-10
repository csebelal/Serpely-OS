import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { LoginView } from '../LoginView';
import { OnboardingView } from '../OnboardingView';
import { getViewFromPathname } from '../../layout/AppShell';
import { DEFAULT_ADMIN_USER } from '../../../data/rbac-data';

describe('LoginView accessibility and layout', () => {
  it('renders sign-in mode with linked labels, skip link, and accessible controls', () => {
    const html = renderToString(
      <LoginView
        appTheme="light"
        onLogin={vi.fn()}
        onToggleTheme={vi.fn()}
      />
    );

    expect(html).toContain('href="#auth-main"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('for="auth-email"');
    expect(html).toContain('id="auth-email"');
    expect(html).toContain('for="auth-password"');
    expect(html).toContain('id="auth-password"');
    expect(html).toContain('aria-label="Show password"');
    expect(html).toContain('for="rememberSession"');
    expect(html).toContain('Sign in to Sincly');
    // High-contrast light mode classes
    expect(html).toContain('text-neutral-900');
    expect(html).not.toContain('text-slate-900');
  });

  it('renders sign-up mode with theme-safe dark contrast when appTheme is dark', () => {
    const html = renderToString(
      <LoginView
        initialMode="signup"
        appTheme="dark"
        onLogin={vi.fn()}
      />
    );

    expect(html).toContain('Create your workspace');
    expect(html).toContain('for="auth-name"');
    expect(html).toContain('for="auth-confirm-password"');
    expect(html).toContain('id="auth-password-hint"');
    // High-contrast dark mode classes
    expect(html).toContain('text-white');
    expect(html).not.toContain('text-slate-900');
  });
});

describe('OnboardingView accessibility and step structure', () => {
  it('renders step 1 with progress navigation, linked inputs, and skip button', () => {
    const html = renderToString(
      <OnboardingView
        user={DEFAULT_ADMIN_USER}
        brandProfile={{
          name: 'My Workspace',
          website: '',
          industry: 'B2B SaaS',
          tagline: 'Autonomous AI Growth & Marketing Engine',
          mission: 'Scale revenue',
          voiceTone: 'Professional, Engaging & Authoritative'
        }}
        appTheme="light"
        onToggleTheme={vi.fn()}
        onComplete={vi.fn()}
        onSkip={vi.fn()}
      />
    );

    expect(html).toContain('aria-label="Onboarding steps"');
    expect(html).toContain('aria-current="step"');
    expect(html).toContain('Tell us about your brand');
    expect(html).toContain('for="onboarding-brand-name"');
    expect(html).toContain('for="onboarding-website"');
    expect(html).toContain('for="onboarding-industry"');
    expect(html).toContain('Skip setup');
  });
});

describe('getViewFromPathname routing', () => {
  it('maps /login, /signup, /onboarding, and /campaigns accurately', () => {
    expect(getViewFromPathname('/login')).toEqual({
      view: 'dashboard',
      isLogin: true,
      initialAuthMode: 'signin',
      isOnboarding: false
    });
    expect(getViewFromPathname('/signup')).toEqual({
      view: 'dashboard',
      isLogin: true,
      initialAuthMode: 'signup',
      isOnboarding: false
    });
    expect(getViewFromPathname('/onboarding')).toEqual({
      view: 'dashboard',
      isLogin: false,
      isOnboarding: true
    });
    expect(getViewFromPathname('/campaigns')).toEqual({
      view: 'campaigns',
      isLogin: false,
      isOnboarding: false
    });
  });
});
