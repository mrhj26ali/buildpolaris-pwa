import { bffRequest } from '@/lib/clients/bffClient'
import { getDatabase } from '@/lib/db'

export type ConflictType = 'no-conflict' | 'stale-write' | 'local-newer'
export type ConflictResolutionAction = 'apply' | 'reject' | 'retry'

export interface ConflictResolution {
  action: ConflictResolutionAction
  surfaceToUser: boolean
  reason?: string
}

export function resolveSyncConflict({
  localVersion,
  serverVersion,
  conflictType,
}: {
  localVersion: number
  serverVersion: number
  conflictType: ConflictType
}): ConflictResolution {
  if (conflictType === 'no-conflict' || localVersion === serverVersion) {
    return { action: 'apply', surfaceToUser: false }
  }
  
  if (conflictType === 'stale-write' || serverVersion > localVersion) {
    return {
      action: 'reject',
      surfaceToUser: true,
      reason: 'The server has a newer version of this record. Refresh and re-apply your change.',
    }
  }
  
  if (conflictType === 'local-newer' || localVersion > serverVersion) {
    return {
      action: 'retry',
      surfaceToUser: false,
      reason: 'This record was edited locally after the server snapshot and will be retried.',
    }
  }
  
  return {
    action: 'reject',
    surfaceToUser: true,
    reason: 'Unknown conflict state.',
  }
}

export interface SyncMutationPayload {
  local_id: string
  target_collection: 'daily_logs' | 'jsa' | 'safety_incidents' | 'punch_items'
  operation: 'create' | 'update' | 'delete'
  payload?: Record<string, unknown>
  base_version?: number
}

export interface SyncResponse {
  applied: Array<{ local_id: string; server_name?: string; action: string; server_modified?: number }>
  conflicts: Array<{ local_id: string; server_name?: string; server_data?: Record<string, unknown> }>
  errors: Array<{ local_id: string; error: string; message: string }>
  server_timestamp: number
  new_sync_token?: string
}

export class SyncEngine {
  private started = false
  private timer: number | null = null
  private syncInProgress = false

  async start() {
    if (this.started) return
    this.started = true
    await this.syncNow()
    
    if (typeof window !== 'undefined') {
      this.timer = window.setInterval(() => {
        this.syncNow().catch((error) => console.error('[SyncEngine] periodic sync failed', error))
      }, 30000)
      
      // Sync when coming back online
      window.addEventListener('online', () => {
        this.syncNow().catch((error) => console.error('[SyncEngine] online sync failed', error))
      })
    }
  }

  async stop() {
    this.started = false
    if (this.timer && typeof window !== 'undefined') {
      window.clearInterval(this.timer)
      this.timer = null
    }
  }

  async queueMutation(mutation: SyncMutationPayload) {
    const db = await getDatabase()
    await db.mutation_queue.insert({
      local_id: mutation.local_id,
      target_collection: mutation.target_collection,
      operation: mutation.operation,
      payload: mutation.payload ?? {},
      project: mutation.payload?.project as string ?? 'default',
      created_at: new Date().toISOString(),
      modified: Date.now(),
      retry_count: 0,
      base_version: mutation.base_version,
      status: 'pending',
    })
    
    // Trigger immediate sync
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.syncNow().catch(() => {})
    }
  }

  async syncNow(): Promise<SyncResponse> {
    if (this.syncInProgress) {
      return {
        applied: [],
        conflicts: [],
        errors: [],
        server_timestamp: Date.now(),
      }
    }

    this.syncInProgress = true
    
    try {
      const db = await getDatabase()
      const pending = await db.mutation_queue.find({
        selector: { status: 'pending' },
        sort: [{ modified: 'asc' }],
      }).exec()
      
      if (!pending.length) {
        return {
          applied: [],
          conflicts: [],
          errors: [],
          server_timestamp: Date.now(),
          new_sync_token: Date.now().toString(),
        }
      }

      const mutations = pending.map((item) => ({
        local_id: item.local_id,
        doctype: item.target_collection,
        action: item.operation,
        data: item.payload,
        base_version: item.base_version,
      }))

      try {
        const result = await bffRequest<SyncResponse>('/method/buildpolaris_bff.api.field.sync_field_mutations', {
          method: 'POST',
          body: JSON.stringify({ mutations, last_sync_timestamp: 0 }),
        })

        // Process results
        for (const item of pending) {
          const isApplied = result.applied.some((record) => record.local_id === item.local_id)
          const isConflict = result.conflicts.some((record) => record.local_id === item.local_id)
          
          if (isApplied) {
            // Update local record with server_name if provided
            const appliedRecord = result.applied.find((r) => r.local_id === item.local_id)
            if (appliedRecord?.server_name) {
              const collection = db[item.target_collection as keyof typeof db]
              if (collection) {
                const localDoc = await collection.findOne(item.local_id).exec()
                if (localDoc) {
                  localDoc.server_name = appliedRecord.server_name
                  localDoc.synced = true
                  await localDoc.save()
                }
              }
            }
            await item.remove()
          } else if (isConflict) {
            item.status = 'conflict'
            item.last_error = 'Conflict detected'
            await item.save()
          } else {
            const error = result.errors.find((e) => e.local_id === item.local_id)
            if (error) {
              item.last_error = error.message
              item.retry_count += 1
              item.status = item.retry_count >= 3 ? 'failed' : 'pending'
              await item.save()
            }
          }
        }

        return result
      } catch (error) {
        console.error('[SyncEngine] sync failed', error)
        return {
          applied: [],
          conflicts: [],
          errors: [{ local_id: 'batch', error: 'sync_failed', message: error instanceof Error ? error.message : 'Unknown sync error' }],
          server_timestamp: Date.now(),
        }
      }
    } finally {
      this.syncInProgress = false
    }
  }

  async getPendingCount(): Promise<number> {
    const db = await getDatabase()
    const pending = await db.mutation_queue.find({ selector: { status: 'pending' } }).exec()
    return pending.length
  }

  async getConflictCount(): Promise<number> {
    const db = await getDatabase()
    const conflicts = await db.mutation_queue.find({ selector: { status: 'conflict' } }).exec()
    return conflicts.length
  }

  async clearAll() {
    const db = await getDatabase()
    await db.mutation_queue.remove()
  }
}

export const syncEngine = new SyncEngine()
