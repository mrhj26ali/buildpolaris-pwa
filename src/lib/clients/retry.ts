// Small backoff helper shared by SyncEngine (ARCH §3.2 — SyncEngine drains the
// outbox on reconnect and periodically as a fallback). Kept in lib/clients/
// because it's a request-shaping concern, not sync-state logic.

export function computeBackoffMs(attemptCount: number): number {
  const base = 2000
  const maxDelay = 60000
  const delay = base * 2 ** Math.max(0, attemptCount - 1)
  return Math.min(delay, maxDelay)
}
