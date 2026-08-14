// Thin fetch wrapper — timeout + single retry on network failure for idempotent
// (GET/HEAD) requests only. Not exported outside lib/clients/: bffClient.ts is
// the only caller. Keeping this here (rather than inlined) is what lets envelope
// unwrapping, CSRF attachment, and retry policy be reasoned about independently.

const DEFAULT_TIMEOUT_MS = 15000
const RETRY_DELAY_MS = 100

export class HttpTimeoutError extends Error {
  constructor() {
    super('The request timed out.')
    this.name = 'HttpTimeoutError'
  }
}

export class HttpNetworkError extends Error {
  constructor(cause?: string) {
    super(cause ?? 'Network error: unable to reach the server.')
    this.name = 'HttpNetworkError'
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  opts: { timeoutMs?: number; allowRetry: boolean },
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS)
  const maxAttempts = opts.allowRetry ? 2 : 1

  try {
    let lastError: unknown
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await fetch(url, { ...init, signal: controller.signal })
      } catch (error) {
        lastError = error
        if (controller.signal.aborted) {
          throw new HttpTimeoutError()
        }
        if (attempt >= maxAttempts) break
        await wait(RETRY_DELAY_MS)
      }
    }
    throw new HttpNetworkError(lastError instanceof Error ? lastError.message : undefined)
  } finally {
    clearTimeout(timer)
  }
}
