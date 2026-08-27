// Per-collection outbox replay. Now unified to use the BFF's single sync_offline_write endpoint.

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
import { uploadPendingMediaForRefs } from '@/lib/db/mediaCache' // ADDED: Import media upload function

export interface OutboxDrainResult {
  collection: WritableFieldCollection
  attempted: number
  synced: number
  conflicted: number
  failed: number
}

// A loose type to satisfy TypeScript when stripping RxDB metadata
type RxDbDoc = Record<string, unknown> & {
  local_uuid: string
  sync_status?: string
  queued_at?: string
  synced_at?: string | null
  server_id?: string | null
  _rev?: string
  media?: Array<{ local_file_ref?: string; file?: string }> // ADDED: media field type
}

// Map PWA collection names to exact BFF DocType names
const DOCTYPE_MAP: Record<WritableFieldCollection, string> = {
  daily_logs: 'Daily Log',
  jsas: 'JSA',
  incidents: 'Safety Incident',
  punch_items: 'Punch List Item',
}

async function replayOne(
  collection: WritableFieldCollection,
  localUuid: string,
  docData: RxDbDoc,
): Promise<SyncApplyResult> {
  const doctype = DOCTYPE_MAP[collection]
  const idempotencyKey = deriveIdempotencyKey(collection, localUuid)
  
  const {
    sync_status: _sync_status,
    queued_at: _queued_at,
    synced_at: _synced_at,
    local_uuid: _local_uuid,
    _rev,
    ...cleanPayload
  } = docData

  if (collection === 'punch_items' && docData.server_id) {
    cleanPayload._action = docData.status === 'Closed' ? 'close' : 'assign'
  }

  try {
    console.log(`[SYNC DEBUG] Attempting to sync ${doctype} ${localUuid}...`)
    
    // Use 'any' temporarily to safely inspect the raw response structure
    const response: any = await bffRequest(
      '/method/buildpolaris_bff.field.api.sync_offline_write',
      {
        method: 'POST',
        body: JSON.stringify({
          doctype,
          payload: cleanPayload,
          local_uuid: localUuid,
          idempotency_key: idempotencyKey
        })
      },
      { idempotencyKey }
    )
    
    console.log('[SYNC DEBUG] Raw response from BFF:', response)

    // BULLETPROOF EXTRACTION: 
    // If bffRequest unwraps it, response is { outcome: 'applied', ... }
    // If bffRequest does NOT unwrap it, response is { message: { outcome: 'applied', ... } }
    const syncResult = response?.message || response;
    
    console.log('[SYNC DEBUG] Extracted syncResult:', syncResult)

    if (syncResult && (syncResult.outcome === 'applied' || syncResult.outcome === 'conflict' || syncResult.outcome === 'rejected')) {
      return syncResult as SyncApplyResult;
    }
    
    console.warn('[SYNC DEBUG] Unexpected response format, defaulting to rejected')
    return {
      local_uuid: localUuid,
      outcome: 'rejected',
      reason: 'Unexpected response format from server',
    }
  } catch (error) {
    console.error('[SYNC DEBUG] Network error during replay:', error)
    return {
      local_uuid: localUuid,
      outcome: 'rejected',
      reason: error instanceof BffApiError ? error.message : 'Network error',
    }
  }
}

async function drainDailyLogs(): Promise<OutboxDrainResult> {
  const pending = await findPendingDailyLogs()
  console.log(`[SYNC DEBUG] Found ${pending.length} pending daily logs to drain.`)
  
  const mediaRefs = pending.flatMap(doc => (doc.media || []).map((m: any) => m.local_file_ref).filter(Boolean))
  const mediaMapping = await uploadPendingMediaForRefs(mediaRefs)

  let synced = 0, conflicted = 0, failed = 0
  for (const doc of pending) {
    if (doc.media && mediaRefs.length > 0) {
      doc.media = doc.media.map((m: any) => {
        if (!m.file && m.local_file_ref && mediaMapping[m.local_file_ref]) {
          return { ...m, file: mediaMapping[m.local_file_ref] }
        }
        return m
      })
    }

    const result = await replayOne('daily_logs', doc.local_uuid, doc as unknown as RxDbDoc)
    
    console.log(`[SYNC DEBUG] Result for ${doc.local_uuid}:`, result)

    if (result.outcome === 'applied' && result.server_id) {
      console.log(`[SYNC DEBUG] Marking ${doc.local_uuid} as synced with server_id: ${result.server_id}`)
      await markDailyLogSynced(doc.local_uuid, result.server_id)
      synced += 1
    } else if (result.outcome === 'conflict') {
      resolveConflict('daily_logs', result)
      conflicted += 1
    } else {
      console.warn(`[SYNC DEBUG] Failed to sync ${doc.local_uuid}. Reason:`, result.reason)
      failed += 1
    }
  }
  return { collection: 'daily_logs', attempted: pending.length, synced, conflicted, failed }
}

async function drainJsas(): Promise<OutboxDrainResult> {
  const pending = await findPendingJsas()
  let synced = 0, conflicted = 0, failed = 0

  for (const doc of pending) {
    const result = await replayOne('jsas', doc.local_uuid, doc as unknown as RxDbDoc)
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
  
  // --- NEW: Upload pending media files ---
  const mediaRefs = pending.flatMap(doc => (doc.media || []).map((m: any) => m.local_file_ref).filter(Boolean))
  const mediaMapping = await uploadPendingMediaForRefs(mediaRefs)

  let synced = 0, conflicted = 0, failed = 0
  for (const doc of pending) {
    if (doc.media && mediaRefs.length > 0) {
      doc.media = doc.media.map((m: any) => {
        if (!m.file && m.local_file_ref && mediaMapping[m.local_file_ref]) {
          return { ...m, file: mediaMapping[m.local_file_ref] }
        }
        return m
      })
    }
    // -------------------------------------

    const result = await replayOne('incidents', doc.local_uuid, doc as unknown as RxDbDoc)
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
  let synced = 0, conflicted = 0, failed = 0

  for (const doc of pending) {
    const result = await replayOne('punch_items', doc.local_uuid, doc as unknown as RxDbDoc)
    if (result.outcome === 'applied' && result.server_id) {
      await markPunchItemSynced(doc.local_uuid, result.server_id)
      synced += 1
    } else if (result.outcome === 'conflict') {
      const decision = resolveConflict('punch_items', result)
      if (decision.action === 'surface') {
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
  await getDatabase()
  return Promise.all([drainDailyLogs(), drainJsas(), drainIncidents(), drainPunchItems()])
}