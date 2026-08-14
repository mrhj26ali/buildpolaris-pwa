// ARCH §3.2: "SyncEngine.ts drains the outbox on a reconnectListener.ts-detected
// connectivity change (and periodically as a fallback)... The BFF is always the
// arbiter, never the PWA. A queued offline write is re-validated against live
// permission and business rules on sync — it is a delay, never a bypass."
//
// This class owns only orchestration (when to drain, session-expiry handling,
// UI-visible summary refresh) — the actual per-collection replay logic lives in
// outbox.ts, and conflict policy lives in conflictResolver.ts. Keeping this file
// thin is what makes it possible to unit-test outbox.ts and conflictResolver.ts
// without spinning up timers/listeners.

import { drainAllOutboxes, type OutboxDrainResult } from './outbox'
import { startReconnectListener, isOnline, type ReconnectListenerHandle } from './reconnectListener'
import { getSyncSummary, type SyncSummary } from './syncStatus'
import { logger } from '@/lib/utils/logger'

type SyncListener = (summary: SyncSummary) => void

class SyncEngine {
  private started = false
  private draining = false
  private reconnectHandle: ReconnectListenerHandle | null = null
  private listeners = new Set<SyncListener>()

  async start(): Promise<void> {
    if (this.started) return
    this.started = true

    this.reconnectHandle = startReconnectListener(() => {
      void this.drainNow()
    })

    if (isOnline()) {
      void this.drainNow()
    }
  }

  stop(): void {
    this.started = false
    this.reconnectHandle?.stop()
    this.reconnectHandle = null
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private async notify(): Promise<void> {
    const summary = await getSyncSummary()
    this.listeners.forEach((l) => l(summary))
  }

  // ARCH §8.2 item 2: "the outbox survives a forced re-login, keyed
  // independently of session lifetime." A 401 during drain does NOT clear the
  // outbox — it simply stops this drain pass; the next reconnect/periodic
  // trigger (after the user re-authenticates) picks the same pending docs back
  // up, because sync_status is untouched on failure.
  async drainNow(): Promise<OutboxDrainResult[]> {
    if (this.draining) return []
    if (!isOnline()) return []

    this.draining = true
    try {
      const results = await drainAllOutboxes()
      const totalSynced = results.reduce((s, r) => s + r.synced, 0)
      const totalConflicted = results.reduce((s, r) => s + r.conflicted, 0)
      const totalFailed = results.reduce((s, r) => s + r.failed, 0)
      logger.info('sync.drain_complete', { totalSynced, totalConflicted, totalFailed })
      await this.notify()
      return results
    } catch (error) {
      logger.error('sync.drain_failed', { error: error instanceof Error ? error.message : String(error) })
      return []
    } finally {
      this.draining = false
    }
  }
}

export const syncEngine = new SyncEngine()
