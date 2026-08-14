// buildpolaris_bff HTTP client. Per ARCH §3.2's "two-file rule," this is one of
// exactly two files in the whole PWA that knows a backend origin — every feature
// slice imports a typed function from here (or from a feature's model/ hooks
// that wrap these), never calls fetch() directly.
//
// Auth model (ARCH §4.1): Frappe's own sid session cookie, sent automatically by
// the browser; state-changing requests additionally carry X-Frappe-CSRF-Token.
// Idempotency (ARCH §4.1, NFR-SCALE.6): every write may carry an Idempotency-Key,
// which lib/sync/idempotencyKey.ts derives from local_uuid for outbox replays.

import { createTraceId, logger } from '@/lib/utils/logger'
import { getCsrfToken, clearCsrfToken } from './csrf'
import { fetchWithRetry, HttpNetworkError, HttpTimeoutError } from './httpClient'
import { unwrapFrappeEnvelope, isBffEnvelope, extractServerMessage } from './envelope'
import type { BffErrorBody } from '@/types/api'

const BFF_BASE_URL = '/api'

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

export interface BffRequestMeta {
  idempotencyKey?: string
  timeoutMs?: number
  traceId?: string
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
  headers.set('X-Trace-Id', traceId) // NFR-OBS.1 — PWA -> BFF -> AI, one ID

  if (meta.idempotencyKey) {
    headers.set('Idempotency-Key', meta.idempotencyKey) // NFR-SCALE.6
  }

  const isMutation = method !== 'GET' && method !== 'HEAD'
  if (isMutation) {
    try {
      headers.set('X-Frappe-CSRF-Token', await getCsrfToken())
    } catch {
      // Let the server reject the request if the token is genuinely required.
    }
  }

  logger.debug('bff.request', { path, method, traceId })

  let response: Response
  try {
    response = await fetchWithRetry(
      `${BFF_BASE_URL}${path}`,
      { credentials: 'include', headers, ...options },
      { timeoutMs: meta.timeoutMs, allowRetry: !isMutation },
    )
  } catch (error) {
    if (error instanceof HttpTimeoutError) {
      throw new BffApiError({ status: 0, message: error.message, requestId: traceId })
    }
    if (error instanceof HttpNetworkError) {
      throw new BffApiError({
        status: 0,
        message: 'Network error: unable to reach the server.',
        serverMessage: error.message,
        requestId: traceId,
      })
    }
    throw error
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
  const payload = unwrapFrappeEnvelope(jsonRes)

  if (isBffEnvelope(payload)) {
    if (!payload.success) {
      throw new BffApiError({
        status: response.status,
        code: payload.error_code,
        message: payload.message || 'Operation failed',
        serverMessage: payload.message,
        requestId: traceId,
      })
    }
    return payload.data as T
  }

  return payload as T
}

// Server-Sent Events proxy consumption (ARCH §4.5): the copilot endpoint
// streams through the BFF; this is the one place that parses the SSE wire
// format, reused only by features/copilot/lib/sse.ts.
export async function bffStream(
  path: string,
  body: unknown,
  opts: { signal?: AbortSignal; onLine: (rawData: string) => void },
): Promise<void> {
  const traceId = createTraceId()
  const headers = new Headers({
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    'X-Trace-Id': traceId,
  })
  try {
    headers.set('X-Frappe-CSRF-Token', await getCsrfToken())
  } catch {
    // let server reject if required
  }

  const response = await fetch(`${BFF_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(body),
    signal: opts.signal,
  })

  if (!response.ok || !response.body) {
    throw new BffApiError({
      status: response.status,
      message: `Copilot stream failed with status ${response.status}.`,
      requestId: traceId,
    })
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let carry = ''

  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    const text = carry + decoder.decode(value, { stream: true })
    const segments = text.split(/\r?\n\r?\n/)
    carry = segments.pop() ?? ''
    for (const segment of segments) {
      const dataLines = segment
        .split(/\r?\n/)
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
      if (dataLines.length > 0) opts.onLine(dataLines.join(''))
    }
  }
  if (carry.trim()) {
    const dataLines = carry
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
    if (dataLines.length > 0) opts.onLine(dataLines.join(''))
  }
}

class BffClient {
  async ping() {
    return bffRequest<{ status: string; app: string; framework: string }>(
      '/method/buildpolaris_bff.api.v1.health.ping',
      { method: 'GET' },
    )
  }
}

export const bffClient = new BffClient()
