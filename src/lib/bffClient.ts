const BFF_BASE_URL = '/api';
let csrfToken: string | undefined;

export class BffApiError extends Error {
  public status: number;
  public serverMessage?: string;
  constructor(status: number, message: string, serverMessage?: string) {
    super(message);
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

export function clearCsrfToken() { csrfToken = undefined; }

async function fetchCsrfToken(): Promise<string> {
  // Note: We will update this path once we build the BFF auth endpoint
  const res = await fetch(`${BFF_BASE_URL}/method/buildpolaris_bff.api.auth.get_csrf_token`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Failed to load CSRF token: ${res.status}`);
  const body = await res.json();
  csrfToken = body.message;
  if (!csrfToken) throw new Error('CSRF token response did not include a token');
  return csrfToken;
}

export async function getCsrfToken(): Promise<string> {
  return csrfToken ?? fetchCsrfToken();
}

export async function bffRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (method !== 'GET' && method !== 'HEAD') {
    headers.set('X-Frappe-CSRF-Token', await getCsrfToken());
  }

  const res = await fetch(`${BFF_BASE_URL}${path}`, { credentials: 'include', headers, ...options });

  if (!res.ok) {
    let serverMessage: string | undefined;
    try { const body = await res.json(); serverMessage = body.message ?? body._server_messages; } catch {}
    throw new BffApiError(res.status, `BFF Request failed: ${res.status}`, serverMessage);
  }
  return res.json();
}