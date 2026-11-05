// Global fetch wrapper with automatic user-scoped header injection & extension compatibility
if (typeof window !== 'undefined') {
  try {
    const originalFetch = window.fetch;
    let fetchHolder = originalFetch
      ? function (this: any, input: RequestInfo | URL, init?: RequestInit) {
          try {
            let userEmail = '';
            const saved = localStorage.getItem('serpely_authenticated_user');
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                userEmail = (parsed?.email || '').trim().toLowerCase();
              } catch {}
            }
            if (userEmail) {
              if (typeof input === 'string' || input instanceof URL) {
                const headers = new Headers(init?.headers || {});
                if (!headers.has('x-user-email')) {
                  headers.set('x-user-email', userEmail);
                }
                init = { ...init, headers };
              } else if (typeof Request !== 'undefined' && input instanceof Request) {
                if (!input.headers.has('x-user-email')) {
                  input.headers.set('x-user-email', userEmail);
                }
              }
            }
          } catch {}
          return originalFetch.apply(this || window, [input, init] as any);
        }
      : undefined;

    if (typeof Window !== 'undefined' && Window.prototype) {
      const protoDesc = Object.getOwnPropertyDescriptor(Window.prototype, 'fetch');
      if (protoDesc && protoDesc.configurable) {
        Object.defineProperty(Window.prototype, 'fetch', {
          get: () => fetchHolder,
          set: (v) => {
            fetchHolder = v;
          },
          configurable: true,
          enumerable: true
        });
      }
    }

    Object.defineProperty(window, 'fetch', {
      get: () => fetchHolder,
      set: (v) => {
        fetchHolder = v;
      },
      configurable: true,
      enumerable: true
    });
  } catch {
    // Continue cleanly if already defined
  }
}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
