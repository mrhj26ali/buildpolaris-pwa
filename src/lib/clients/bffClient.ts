import { createTraceId, logger } from '@/lib/telemetry'

const BFF_BASE_URL = '/api'
const DEFAULT_TIMEOUT_MS = 15000
const RETRY_DELAY_MS = 100

export interface BffResponse<T> {
  success: boolean
  data: T | null
  message: string
  error_code?: string
}

interface BffErrorBody {
  error?: {
    code?: string
    message?: string
    details?: Record<string, unknown>
    request_id?: string
  }
  _server_messages?: string
  message?: unknown
  exception?: string
}

export class BffApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly requestId?: string
  readonly serverMessage?: string

  constructor(options: {
    status: number
    message: string
    code?: string
    requestId?: string
    serverMessage?: string
  }) {
    super(options.message)
    this.name = 'BffApiError'
    this.status = options.status
    this.code = options.code
    this.requestId = options.requestId
    this.serverMessage = options.serverMessage
  }
}

let csrfToken: string | undefined

export function clearCsrfToken() {
  csrfToken = undefined
}

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch(`${BFF_BASE_URL}/method/buildpolaris_bff.api.v1.auth.get_csrf_token`, {
    credentials: 'include',
  })
  
  if (!res.ok) {
    throw new BffApiError({ status: res.status, message: `Failed to load CSRF token: ${res.status}` })
  }
  
  const body: unknown = await res.json()
  const unwrapped =
    body && typeof body === 'object' && 'message' in body
      ? (body as { message: unknown }).message
      : body
  
  csrfToken = typeof unwrapped === 'string' ? unwrapped : ''
  
  if (!csrfToken) {
    throw new BffApiError({ status: 0, message: 'CSRF token response did not include a token' })
  }
  
  return csrfToken
}

export async function getCsrfToken(): Promise<string> {
  return csrfToken ?? fetchCsrfToken()
}

export interface BffRequestMeta {
  idempotencyKey?: string
  timeoutMs?: number
  traceId?: string
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function extractServerMessage(body: BffErrorBody | undefined, rawText: string): string | undefined {
  if (!body) return rawText.substring(0, 500) || undefined
  
  if (body._server_messages) {
    try {
      const parsed: unknown = JSON.parse(String(body._server_messages))
      if (Array.isArray(parsed)) {
        return parsed
          .map((entry) => {
            if (entry && typeof entry === 'object' && 'message' in entry) {
              return String((entry as { message: unknown }).message)
            }
            return String(entry)
          })
          .join(', ')
      }
      return String(body._server_messages)
    } catch {
      return String(body._server_messages)
    }
  }
  
  if (typeof body.message === 'string') return body.message
  if (body.message !== undefined) return JSON.stringify(body.message)
  if (body.exception) return body.exception
  
  return rawText.substring(0, 500) || undefined
}

export async function bffRequest<T>(
  path: string,
  options: RequestInit = {},
  meta: BffRequestMeta = {},
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  const traceId = meta.traceId ?? createTraceId()
  const headers = new Headers(options.headers || {})
  
  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  
  headers.set('Accept', 'application/json')
  headers.set('X-Trace-Id', traceId)
  
  if (meta.idempotencyKey) {
    headers.set('Idempotency-Key', meta.idempotencyKey)
  }
  
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      headers.set('X-Frappe-CSRF-Token', await getCsrfToken())
    } catch {
      /* Let the server reject the request if the token is genuinely required. */
    }
  }
  
  logger.debug('bff.request', { path, method, traceId })
  
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), meta.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  const maxAttempts = method === 'GET' || method === 'HEAD' ? 2 : 1
  let response: Response | undefined
  
  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        response = await fetch(`${BFF_BASE_URL}${path}`, {
          credentials: 'include',
          headers,
          signal: controller.signal,
          ...options,
        })
        break
      } catch (error) {
        if (controller.signal.aborted) {
          throw new BffApiError({ status: 0, message: 'The request timed out.', requestId: traceId })
        }
        
        if (attempt >= maxAttempts) {
          throw new BffApiError({
            status: 0,
            message: 'Network error: unable to reach the server.',
            serverMessage: error instanceof Error ? error.message : undefined,
            requestId: traceId,
          })
        }
        
        await wait(RETRY_DELAY_MS)
      }
    }
  } finally {
    clearTimeout(timer)
  }
  
  if (!response) {
    throw new BffApiError({ status: 0, message: 'Network error: unable to reach the server.', requestId: traceId })
  }
  
  const rawText = await response.text()
  
  if (!response.ok) {
    let parsed: BffErrorBody | undefined
    try {
      parsed = rawText ? (JSON.parse(rawText) as BffErrorBody) : undefined
    } catch {
      parsed = undefined
    }
    
    if (response.status === 401) {
      clearCsrfToken()
    }
    
    if (parsed?.error) {
      logger.warn('bff.error', { path, status: response.status, code: parsed.error.code, traceId })
      throw new BffApiError({
        status: response.status,
        code: parsed.error.code,
        requestId: parsed.error.request_id ?? traceId,
        message: parsed.error.message ?? `Request failed (${response.status})`,
        serverMessage: parsed.error.message,
      })
    }
    
    const serverMessage = extractServerMessage(parsed, rawText)
    logger.warn('bff.error', { path, status: response.status, traceId })
    
    throw new BffApiError({
      status: response.status,
      message: serverMessage ?? `Request failed (${response.status})`,
      serverMessage,
      requestId: traceId,
    })
  }
  
  if (!rawText) {
    return undefined as T
  }
  
  const jsonRes: unknown = JSON.parse(rawText)
  const payload: unknown =
    jsonRes && typeof jsonRes === 'object' && 'message' in jsonRes
      ? (jsonRes as { message: unknown }).message
      : jsonRes
  
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    const envelope = payload as BffResponse<unknown>
    
    if (!envelope.success) {
      throw new BffApiError({
        status: response.status,
        code: envelope.error_code,
        message: envelope.message || 'Operation failed',
        serverMessage: envelope.message,
        requestId: traceId,
      })
    }
    
    return envelope.data as T
  }
  
  return payload as T
}

class BffClient {
  public async ping() {
    return bffRequest<{ status: string; app: string; framework: string }>(
      '/method/buildpolaris_bff.api.v1.health.ping',
      { method: 'GET' },
    )
  }
}

export const bffClient = new BffClient()
