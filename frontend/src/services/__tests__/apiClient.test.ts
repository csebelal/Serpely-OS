import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  apiClient,
  getStoredAuthToken,
  setStoredAuthToken
} from '../apiClient';

// In-memory mock for browser Storage & EventTarget
const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, val: string) => storageMap.set(key, String(val)),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear()
};

const eventTarget = new EventTarget();
const windowMock = {
  dispatchEvent: (event: Event) => eventTarget.dispatchEvent(event),
  addEventListener: (type: string, listener: any) => eventTarget.addEventListener(type, listener),
  removeEventListener: (type: string, listener: any) => eventTarget.removeEventListener(type, listener)
};

(globalThis as any).localStorage = localStorageMock;
(globalThis as any).window = windowMock;

describe('Centralized Frontend API Client (apiClient)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  it('stores and retrieves JWT authentication token cleanly', () => {
    expect(getStoredAuthToken()).toBeNull();
    setStoredAuthToken('test-jwt-token-12345');
    expect(getStoredAuthToken()).toBe('test-jwt-token-12345');
    setStoredAuthToken(null);
    expect(getStoredAuthToken()).toBeNull();
  });

  it('automatically injects Authorization: Bearer <token> when token is present', async () => {
    setStoredAuthToken('valid-token-xyz');

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ status: 'success', data: { id: 1 } })
    });
    global.fetch = mockFetch as any;

    const res = await apiClient.get('/api/state');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledHeaders = mockFetch.mock.calls[0][1].headers;
    expect(calledHeaders.get('Authorization')).toBe('Bearer valid-token-xyz');
    expect(res.success).toBe(true);
    expect(res.statusCode).toBe(200);
  });

  it('serializes JSON bodies and sets Content-Type header on POST and PUT requests', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ updated: true })
    });
    global.fetch = mockFetch as any;

    const payload = { title: 'Test Campaign', budget: 5000 };
    const res = await apiClient.put('/api/state', payload);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledOptions = mockFetch.mock.calls[0][1];
    expect(calledOptions.method).toBe('PUT');
    expect(calledOptions.body).toBe(JSON.stringify(payload));
    expect(calledOptions.headers.get('Content-Type')).toBe('application/json');
    expect(res.success).toBe(true);
  });

  it('dispatches auth:unauthorized window event upon receiving 401 response', async () => {
    const unauthorizedListener = vi.fn();
    window.addEventListener('auth:unauthorized', unauthorizedListener);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Session expired' })
    });
    global.fetch = mockFetch as any;

    const res = await apiClient.get('/api/protected-route');

    expect(res.success).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.error).toBe('Session expired');
    expect(unauthorizedListener).toHaveBeenCalledTimes(1);

    window.removeEventListener('auth:unauthorized', unauthorizedListener);
  });

  it('normalizes network exceptions into clean ApiResponse envelopes', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Failed to fetch (offline)'));
    global.fetch = mockFetch as any;

    const res = await apiClient.get('/api/state');

    expect(res.success).toBe(false);
    expect(res.statusCode).toBe(0);
    expect(res.error).toBe('Failed to fetch (offline)');
  });
});
