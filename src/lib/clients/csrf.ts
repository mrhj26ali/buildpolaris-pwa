// CSRF token handling for buildpolaris_bff (ARCH §4.1): "state-changing requests
// additionally carry X-Frappe-CSRF-Token, fetched once at bootstrap and cached."
// This module owns exactly that cache — bffClient.ts calls getCsrfToken() and
// never fetches the token itself.

const BFF_BASE_URL = '/api'

let csrfToken: string | undefined

export function clearCsrfToken(): void {
  csrfToken = undefined
}

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(`${BFF_BASE_URL}/method/buildpolaris_bff.api.v1.auth.get_csrf_token`, {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error(`Failed to load CSRF token: ${res.status}`)
  }

  const body: unknown = await res.json()
  const unwrapped =
    body && typeof body === 'object' && 'message' in body
      ? (body as { message: unknown }).message
      : body

  csrfToken = typeof unwrapped === 'string' ? unwrapped : ''

  if (!csrfToken) {
    throw new Error('CSRF token response did not include a token')
  }

  return csrfToken
}

export async function getCsrfToken(): Promise<string> {
  return csrfToken ?? fetchCsrfToken()
}
