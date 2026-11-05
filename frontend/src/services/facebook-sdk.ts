/**
 * Facebook JavaScript SDK Loader & Hybrid Auth Service
 * Provides smooth in-browser FB.login() with graceful fallback to server OAuth popup.
 */

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

let isSdkLoading = false;
let sdkInitPromise: Promise<boolean> | null = null;

export interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
  expiresIn?: number;
  signedRequest?: string;
  graphDomain?: string;
}

export interface SdkLoginResult {
  ok: boolean;
  accessToken?: string;
  userID?: string;
  error?: string;
  reason?: 'adblocker_or_network' | 'user_cancelled' | 'app_not_configured' | 'unknown';
}

/**
 * Dynamically loads and initializes Meta's official JS SDK (v19.0)
 */
export function initFacebookSdk(appId: string): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  if (window.FB) {
    try {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: 'v19.0'
      });
      return Promise.resolve(true);
    } catch {
      return Promise.resolve(false);
    }
  }

  if (sdkInitPromise) return sdkInitPromise;

  sdkInitPromise = new Promise<boolean>((resolve) => {
    // If blocked or times out after 4 seconds, gracefully fallback
    const timeout = setTimeout(() => {
      resolve(false);
    }, 4000);

    window.fbAsyncInit = function () {
      clearTimeout(timeout);
      try {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: 'v19.0'
        });
        resolve(true);
      } catch {
        resolve(false);
      }
    };

    if (document.getElementById('facebook-jssdk')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return sdkInitPromise;
}

/**
 * Triggers Meta JS SDK FB.login popup directly in the client
 */
export async function loginWithFacebookSdk(
  appId: string,
  scope: string = 'pages_manage_posts,pages_read_engagement,pages_show_list,public_profile'
): Promise<SdkLoginResult> {
  if (!appId) {
    return { ok: false, error: 'Meta App ID is missing', reason: 'app_not_configured' };
  }

  const initialized = await initFacebookSdk(appId);
  if (!initialized || !window.FB) {
    return {
      ok: false,
      error: 'Facebook SDK could not load (likely blocked by Adblocker/Brave Shield).',
      reason: 'adblocker_or_network'
    };
  }

  return new Promise((resolve) => {
    try {
      window.FB.login(
        (response: { authResponse?: FacebookAuthResponse; status?: string }) => {
          if (response?.authResponse?.accessToken) {
            resolve({
              ok: true,
              accessToken: response.authResponse.accessToken,
              userID: response.authResponse.userID
            });
          } else {
            resolve({
              ok: false,
              error: 'User cancelled or failed to authorize Facebook permissions.',
              reason: 'user_cancelled'
            });
          }
        },
        { scope, return_scopes: true }
      );
    } catch (err: any) {
      resolve({
        ok: false,
        error: err?.message || 'Failed to trigger Facebook login dialog.',
        reason: 'unknown'
      });
    }
  });
}

/**
 * Exchanges the client-side user access token with our backend to:
 * 1. Upgrade to a 60-day long-lived token
 * 2. Scrape all managed Facebook Pages (/me/accounts)
 * 3. Store in SQLite database
 */
export async function exchangeFacebookToken(accessToken: string, userID?: string) {
  const res = await fetch('/api/auth/facebook/token-exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, userID })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Token exchange failed with status ${res.status}`);
  }
  return await res.json();
}
