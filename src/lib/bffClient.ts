// src/lib/bffClient.ts
// Standardized API Client for BuildPolaris PWA <-> Frappe v16 BFF Communication

export interface BffResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  error_code?: string;
}

// Kept as '/api' to maintain backward compatibility with existing feature API paths
const BFF_BASE_URL = '/api';
let csrfToken: string | undefined;

export class BffApiError extends Error {
  public status: number;
  public serverMessage?: string;
  
  constructor(status: number, message: string, serverMessage?: string) {
    super(message);
    this.name = 'BffApiError';
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

export function clearCsrfToken() {
  csrfToken = undefined;
}

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(`${BFF_BASE_URL}/method/buildpolaris_bff.api.auth.get_csrf_token`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new BffApiError(res.status, `Failed to load CSRF token: ${res.status}`);
  }
  const body = await res.json();
  const token = body.message !== undefined ? body.message : body;
  csrfToken = typeof token === 'string' ? token : '';
  if (!csrfToken) {
    throw new Error('CSRF token response did not include a token');
  }
  return csrfToken;
}

export async function getCsrfToken(): Promise<string> {
  return csrfToken ?? fetchCsrfToken();
}

export async function bffRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  if (options.method && options.method !== 'GET' && options.method !== 'HEAD') {
    try {
      headers.set('X-Frappe-CSRF-Token', await getCsrfToken());
    } catch (e) { /* Ignore CSRF fetch errors in dev */ }
  }

  let res: Response;
  try {
    res = await fetch(`${BFF_BASE_URL}${path}`, { 
      credentials: 'include', 
      headers, 
      ...options 
    });
  } catch (networkError) {
    throw new BffApiError(0, 'Network Error: Unable to reach the server.', 'Network Error');
  }

  if (!res.ok) {
    let serverMessage: string | undefined;
    const text = await res.text();
    try {
      const body = JSON.parse(text);
      if (body._server_messages) {
        try {
          const parsed = JSON.parse(body._server_messages);
          serverMessage = Array.isArray(parsed) ? parsed.map((p: any) => p.message || p).join(', ') : body._server_messages;
        } catch {
          serverMessage = body._server_messages;
        }
      } else if (body.message) {
        serverMessage = typeof body.message === 'string' ? body.message : JSON.stringify(body.message);
      } else if (body.exception) {
        serverMessage = body.exception;
      }
    } catch {
      serverMessage = text.substring(0, 500) || res.statusText;
    }
    throw new BffApiError(res.status, `BFF Request failed: ${res.status}`, serverMessage || `HTTP ${res.status}`);
  }

  const jsonRes = await res.json();
  
  // 1. Unwrap Frappe's automatic {"message": ...} wrapper
  const payload = jsonRes.message !== undefined ? jsonRes.message : jsonRes;

  // 2. Handle our new standardized BffResponse<T> envelope
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    if (!payload.success) {
      throw new BffApiError(res.status, payload.message || 'Operation failed', payload.message);
    }
    return payload.data as T;
  }

  // 3. Fallback for legacy Frappe endpoints
  return payload as T;
}

class BffClient {
  public async ping() {
    return bffRequest<{ status: string; app: string; framework: string }>(
      '/method/buildpolaris_bff.api.health.ping', 
      { method: 'GET' }
    );
  }
}

export const bffClient = new BffClient();
