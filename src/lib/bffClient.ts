const BFF_BASE_URL = '/api'

let csrfToken: string | undefined

export class BffApiError extends Error {
  public status: number
  public serverMessage?: string

  constructor(status: number, message: string, serverMessage?: string) {
    super(message)
    this.status = status
    this.serverMessage = serverMessage
  }
}

export function clearCsrfToken() {
  csrfToken = undefined
}

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(`${BFF_BASE_URL}/method/buildpolaris_bff.api.auth.get_csrf_token`, {
    credentials: 'include',
  })
  if (!res.ok) {
    throw new BffApiError(res.status, `Failed to load CSRF token: ${res.status}`)
  }

  const body = await res.json()
  csrfToken = body.message
  if (!csrfToken) {
    throw new Error('CSRF token response did not include a token')
  }
  return csrfToken
}

export async function getCsrfToken(): Promise<string> {
  return csrfToken ?? fetchCsrfToken()
}

export async function bffRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && method !== 'GET' && method !== 'HEAD') {
    headers.set('Content-Type', 'application/json')
  }

  if (method !== 'GET' && method !== 'HEAD') {
    headers.set('X-Frappe-CSRF-Token', await getCsrfToken())
  }

  let res: Response
  try {
    res = await fetch(`${BFF_BASE_URL}${path}`, { credentials: 'include', headers, ...options })
  } catch (networkError) {
    throw new BffApiError(
      0,
      'Network Error',
      'Unable to reach the server. Ensure the BFF is running and CORS is configured.',
    )
  }

  if (!res.ok) {
    let serverMessage: string | undefined
    const text = await res.text()

    try {
      const body = JSON.parse(text)

      if (body._server_messages) {
        try {
          const parsed = JSON.parse(body._server_messages)
          serverMessage = Array.isArray(parsed) ? parsed.join('\n') : String(parsed)
        } catch {
          serverMessage = body._server_messages
        }
      } else if (body.message) {
        serverMessage = typeof body.message === 'string' ? body.message : JSON.stringify(body.message)
      } else if (body.exception) {
        serverMessage = body.exception
      }
    } catch {
      serverMessage = text.substring(0, 500) || res.statusText
    }

    throw new BffApiError(res.status, `BFF Request failed: ${res.status}`, serverMessage || `HTTP ${res.status}`)
  }

  const jsonRes = await res.json()
  return (jsonRes.message !== undefined ? jsonRes.message : jsonRes) as T
}