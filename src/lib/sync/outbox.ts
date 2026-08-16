// Per-collection outbox replay. Each writable collection gets one function here
// rather than one generic "replay any doc" function, because the BFF endpoint
// path and payload shape genuinely differ per DocType (UC-6.1..6.4's own
// sequence diagrams show distinct POST paths) — forcing one generic shape would
// just move the per-collection knowledge into a big switch statement instead of
// here, where it's next to the schema it serializes.

import { bffRequest, BffApiError } from '@/lib/clients/bffClient'
import { deriveIdempotencyKey } from './idempotencyKey'
import type { WritableFieldCollection, SyncApplyResult } from '@/types/sync'
import {
  findPendingDailyLogs,
  markDailyLogSynced,
} from '@/lib/db/repositories/dailyLog.repository'
import { findPendingJsas, markJsaSynced } from '@/lib/db/repositories/jsa.repository'
import {
  findPendingSafetyIncidents,
  markSafetyIncidentSynced,
} from '@/lib/db/repositories/safetyIncident.repository'
import {
  findPendingPunchItems,
  markPunchItemSynced,
  markPunchItemConflict,
} from '@/lib/db/repositories/punchListItem.repository'
import { resolveConflict } from './conflictResolver'
import { getDatabase } from '@/lib/db/database'

export interface OutboxDrainResult {
  collection: WritableFieldCollection
  attempted: number
  synced: number
  conflicted: number
  failed: number
}

async function replayOne(
  collection: WritableFieldCollection,
  localUuid: string,
  path: string,
  payload: Record<string, unknown>,
): Promise<SyncApplyResult> {
  try {
    const result = await bffRequest<SyncApplyResult>(
      path,
      { method: 'POST', body: JSON.stringify(payload) },
      { idempotencyKey: deriveIdempotencyKey(collection, localUuid) },
    )
    return result
  } catch (error) {
    return {
      local_uuid: localUuid,
      outcome: 'rejected',
      reason: error instanceof BffApiError ? error.message : 'Network error',
    }
  }
}

async function drainDailyLogs(): Promise<OutboxDrainResult> {
  const pending = await findPendingDailyLogs()
  let synced = 0
  let conflicted = 0
  let failed = 0

  for (const doc of pending) {
    const result = await replayOne(
      'daily_logs',
      doc.local_uuid,
      '/method/buildpolaris_bff.field.api.sync_daily_log',
      { ...doc },
    )
    if (result.outcome === 'applied' && result.server_id) {
      await markDailyLogSynced(doc.local_uuid, result.server_id)
      synced += 1
    } else if (result.outcome === 'conflict') {
      resolveConflict('daily_logs', result) // deterministic — logged, never surfaced
      conflicted += 1
    } else {
      failed += 1
    }
  }
  return { collection: 'daily_logs', attempted: pending.length, synced, conflicted, failed }
}

async function drainJsas(): Promise<OutboxDrainResult> {
  const pending = await findPendingJsas()
  let synced = 0
  let conflicted = 0
  let failed = 0

  for (const doc of pending) {
    const result = await replayOne(
      'jsas',
      doc.local_uuid,
      '/method/buildpolaris_bff.field.api.sync_jsa',
      { ...doc },
    )
    if (result.outcome === 'applied' && result.server_id) {
      await markJsaSynced(doc.local_uuid, result.server_id)
      synced += 1
    } else if (result.outcome === 'conflict') {
      resolveConflict('jsas', result)
      conflicted += 1
    } else {
      failed += 1
    }
  }
  return { collection: 'jsas', attempted: pending.length, synced, conflicted, failed }
}

async function drainIncidents(): Promise<OutboxDrainResult> {
  const pending = await findPendingSafetyIncidents()
  let synced = 0
  let conflicted = 0
  let failed = 0

  for (const doc of pending) {
    const result = await replayOne(
      'incidents',
      doc.local_uuid,
      '/method/buildpolaris_bff.field.api.sync_safety_incident',
      { ...doc },
    )
    if (result.outcome === 'applied' && result.server_id) {
      await markSafetyIncidentSynced(doc.local_uuid, result.server_id)
      synced += 1
    } else if (result.outcome === 'conflict') {
      resolveConflict('incidents', result)
      conflicted += 1
    } else {
      failed += 1
    }
  }
  return { collection: 'incidents', attempted: pending.length, synced, conflicted, failed }
}

async function drainPunchItems(): Promise<OutboxDrainResult> {
  const pending = await findPendingPunchItems()
  let synced = 0
  let conflicted = 0
  let failed = 0

  for (const doc of pending) {
    const result = await replayOne(
      'punch_items',
      doc.local_uuid,
      '/method/buildpolaris_bff.field.api.sync_punch_item',
      { ...doc },
    )
    if (result.outcome === 'applied' && result.server_id) {
      await markPunchItemSynced(doc.local_uuid, result.server_id)
      synced += 1
    } else if (result.outcome === 'conflict') {
      const decision = resolveConflict('punch_items', result)
      if (decision.action === 'surface') {
        // ERD §5.4: never silently overwritten — mark conflicted, the
        // PunchListConflictResolver.tsx UI queries this state and shows both
        // versions (server_version arrives on the SyncApplyResult itself).
        await markPunchItemConflict(doc.local_uuid)
      }
      conflicted += 1
    } else {
      failed += 1
    }
  }
  return { collection: 'punch_items', attempted: pending.length, synced, conflicted, failed }
}

export async function drainAllOutboxes(): Promise<OutboxDrainResult[]> {
  // Ensure the DB is ready before any drain function touches a collection.
  await getDatabase()
  return Promise.all([drainDailyLogs(), drainJsas(), drainIncidents(), drainPunchItems()])
}
