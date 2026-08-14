// NFR-UX.3: "Offline state, pending-sync, and sync-conflict must be visibly
// communicated — never silent." This module is the single read surface every
// SyncStatusBadge.tsx / OfflineBanner.tsx instance queries, so "how many things
// are pending" is computed once, not re-derived per component.

import { getDatabase } from '@/lib/db/database'

export interface SyncSummary {
  pendingCount: number
  conflictCount: number
}

export async function getSyncSummary(): Promise<SyncSummary> {
  const db = await getDatabase()
  const collections = [db.daily_logs, db.jsas, db.incidents, db.punch_items]

  const pendingCounts = await Promise.all(
    collections.map((c) => c.find({ selector: { sync_status: 'pending' } }).exec()),
  )
  const conflictCounts = await Promise.all(
    collections.map((c) => c.find({ selector: { sync_status: 'conflict' } }).exec()),
  )

  return {
    pendingCount: pendingCounts.reduce((sum, docs) => sum + docs.length, 0),
    conflictCount: conflictCounts.reduce((sum, docs) => sum + docs.length, 0),
  }
}
