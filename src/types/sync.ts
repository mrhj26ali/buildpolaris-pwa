// Sync envelope shared by every offline-writable RxDB collection (ERD §5.2).
// This is the ONLY sync-related shape — every field-execution schema embeds it
// verbatim rather than redefining sync_status/local_uuid per collection, so
// lib/sync/SyncEngine.ts can operate on any writable collection generically.

export type SyncStatus = 'pending' | 'synced' | 'conflict'

export interface SyncEnvelope {
  local_uuid: string // primary key, client-generated, stable across the offline session
  server_id: string | null // null until first successful sync
  sync_status: SyncStatus
  queued_at: string // ISO 8601
  synced_at: string | null // ISO 8601
  
}

// The four writable offline collections (ERD §5.1 / §3.4 design note).
// This union is load-bearing: it is the only place "which collections are
// offline-writable" is enumerated, and lib/sync/* code should always derive
// from this type rather than re-listing collection names ad hoc.
export type WritableFieldCollection = 'daily_logs' | 'jsas' | 'incidents' | 'punch_items'

// Read-only offline caches (ERD §5.1) — never queued, never conflict, just a
// periodically-refreshed local mirror for offline field usability.
export type ReadOnlyFieldCollection = 'tasks_lookahead' | 'drawing_revisions_meta'

export interface OutboxEntry {
  local_uuid: string
  collection: WritableFieldCollection
  idempotency_key: string // derived from local_uuid — NFR-SCALE.6
  attempt_count: number
  last_error: string | null
  last_attempted_at: string | null
}

// BFF sync response shape — one write, one server verdict, matching UC-6.5's
// "BFF applies each write" step and the punch_items conflict case (ERD §5.4).
export interface SyncApplyResult {
  local_uuid: string
  outcome: 'applied' | 'conflict' | 'rejected'
  server_id?: string
  synced_at?: string
  // present only when outcome === 'conflict' — both versions, per ERD §5.4,
  // "the PWA shows both versions and asks the user to confirm"
  server_version?: Record<string, unknown>
  reason?: string
}

export interface SyncBatchResponse {
  results: SyncApplyResult[]
  server_timestamp: string
}
