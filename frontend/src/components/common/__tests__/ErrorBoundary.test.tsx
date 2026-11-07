import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ErrorBoundary } from '../ErrorBoundary';

describe('ErrorBoundary Component', () => {
  it('renders children normally when there is no error', () => {
    const html = renderToString(
      <ErrorBoundary>
        <div data-testid="child-content">Normal Content</div>
      </ErrorBoundary>
    );

    expect(html).toContain('Normal Content');
    expect(html).not.toContain('Something interrupted this workspace view');
  });

  it('updates state via getDerivedStateFromError when a child throws', () => {
    const testError = new Error('Test crash in child component');
    const newState = ErrorBoundary.getDerivedStateFromError(testError);

    expect(newState.hasError).toBe(true);
    expect(newState.error).toBe(testError);
    expect(newState.showDetails).toBe(false);
  });

  it('renders the fallback UI when an error is caught in state', () => {
    const boundary = new ErrorBoundary({ children: <div>Child</div>, fallbackTitle: 'Custom Error Title' });
    boundary.state = {
      hasError: true,
      error: new Error('Render failure'),
      errorInfo: null,
      showDetails: false
    };

    const rendered = boundary.render();
    const html = renderToString(rendered as React.ReactElement);

    expect(html).toContain('Custom Error Title');
    expect(html).toContain('Try Recovering');
    expect(html).toContain('Reload Page');
    expect(html).toContain('Clear Local Cache');
  });
});
