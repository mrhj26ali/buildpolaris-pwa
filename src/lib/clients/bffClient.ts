const BFF_BASE_URL = '/api';

export class BffApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly serverMessage?: string;

  constructor(options: { status: number; message: string; code?: string; serverMessage?: string }) {
    super(options.message);
    this.name = 'BffApiError';
    this.status = options.status;
    this.code = options.code;
    this.serverMessage = options.serverMessage;
  }
}

let csrfToken: string | undefined;

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(`${BFF_BASE_URL}/method/buildpolaris_bff.api.v1.auth.get_csrf_token`, {
    credentials: 'include',
  });
  if (!res.ok) throw new BffApiError({ status: res.status, message: 'Failed to load CSRF token' });
  const body = await res.json();
  csrfToken = body.message || body;
  return csrfToken as string;
}

export async function bffRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});
  
  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  if (method !== 'GET' && method !== 'HEAD') {
    if (!csrfToken) await fetchCsrfToken();
    headers.set('X-Frappe-CSRF-Token', csrfToken!);
  }

  const response = await fetch(`${BFF_BASE_URL}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new BffApiError({ status: response.status, message: text });
  }

  const text = await response.text();
  if (!text) return undefined as T;
  
  const json = JSON.parse(text);
  return (json.message !== undefined ? json.message : json) as T;
}
