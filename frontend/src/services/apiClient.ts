/**
 * Centralized API Client for Sincly / Serpely Frontend
 * 
 * Provides:
 * - Uniform request and response typing
 * - Automatic Authorization: Bearer <token> injection
 * - Centralized 401 Unauthorized handling via event dispatch
 * - Unified error message normalization
 * - Safe JSON parsing with fallback for empty or non-JSON payloads
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  params?: Record<string, string | number | boolean | undefined | null>;
}

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem('serpely_auth_token') || null;
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem('serpely_auth_token', token);
    } else {
      localStorage.removeItem('serpely_auth_token');
    }
  } catch {
    // Ignore storage quota/permission errors
  }
}

export async function request<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { body, params, headers: customHeaders, ...restOptions } = options;

  // Build URL with query parameters if provided
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers = new Headers(customHeaders || {});

  // Determine if body is JSON or FormData / Blob
  let requestBody: any = body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const isBlob = typeof Blob !== 'undefined' && body instanceof Blob;

  if (body !== undefined && !isFormData && !isBlob) {
    if (typeof body === 'object') {
      requestBody = JSON.stringify(body);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    } else {
      requestBody = String(body);
    }
  }

  // Inject Bearer token if present
  const token = getStoredAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Inject current user email as fallback header if present
  try {
    const userRaw = localStorage.getItem('serpely_authenticated_user');
    if (userRaw) {
      const userObj = JSON.parse(userRaw);
      if (userObj?.email && !headers.has('x-user-email')) {
        headers.set('x-user-email', userObj.email);
      }
    }
  } catch {
    // Ignore JSON parse errors
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers,
      body: requestBody
    });

    // Check for 401 Unauthorized
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('auth:unauthorized', {
            detail: { url, status: 401 }
          })
        );
      }
    }

    // Parse response body safely
    let responseData: any = null;
    const contentType = response.headers.get('content-type') || '';
    if (response.status !== 204 && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }
    } else if (response.status !== 204) {
      try {
        responseData = await response.text();
      } catch {
        responseData = null;
      }
    }

    if (!response.ok) {
      const errorMessage =
        responseData?.error ||
        responseData?.message ||
        (typeof responseData === 'string' && responseData.length < 200 ? responseData : null) ||
        `Request failed with HTTP status ${response.status} (${response.statusText})`;

      return {
        success: false,
        error: errorMessage,
        statusCode: response.status,
        data: responseData
      };
    }

    return {
      success: true,
      data: responseData as T,
      statusCode: response.status
    };
  } catch (err: any) {
    const networkError = err?.message || 'Network request failed or server is unreachable.';
    return {
      success: false,
      error: networkError,
      statusCode: 0
    };
  }
}

export const apiClient = {
  request: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    request<T>(endpoint, options),

  get: <T = any>(url: string, options?: ApiRequestOptions) =>
    request<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, body?: any, options?: ApiRequestOptions) =>
    request<T>(url, { ...options, method: 'POST', body }),

  put: <T = any>(url: string, body?: any, options?: ApiRequestOptions) =>
    request<T>(url, { ...options, method: 'PUT', body }),

  patch: <T = any>(url: string, body?: any, options?: ApiRequestOptions) =>
    request<T>(url, { ...options, method: 'PATCH', body }),

  delete: <T = any>(url: string, options?: ApiRequestOptions) =>
    request<T>(url, { ...options, method: 'DELETE' })
};

export default apiClient;
