// Ensure window.fetch has both getter and setter for any extension interceptors
if (typeof window !== 'undefined') {
  try {
    const originalFetch = window.fetch;
    let fetchHolder = originalFetch
      ? function (this: any, ...args: any[]) {
          return originalFetch.apply(this || window, args as any);
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
