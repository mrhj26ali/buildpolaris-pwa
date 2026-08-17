// CSRF token handling for buildpolaris_bff (ARCH §4.1): "state-changing requests
// additionally carry X-Frappe-CSRF-Token, fetched once at bootstrap and cached."
// This module owns exactly that cache — bffClient.ts calls getCsrfToken() and
// never fetches the token itself.

const BFF_BASE_URL = '/api'

let csrfToken: string | undefined
let csrfTokenPromise: Promise<string> | undefined

export function clearCsrfToken(): void {
  csrfToken = undefined
  csrfTokenPromise = undefined
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
  // Return cached token if available
  if (csrfToken) {
    return csrfToken
  }

  // Return in-flight promise if a fetch is already happening
  if (csrfTokenPromise) {
    return csrfTokenPromise
  }

  // Start new fetch and cache the promise
  csrfTokenPromise = fetchCsrfToken()
    .catch((error) => {
      // Clear the promise on failure so we can retry
      csrfTokenPromise = undefined
      throw error
    })

  return csrfTokenPromise
}