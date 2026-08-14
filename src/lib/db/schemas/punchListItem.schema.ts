import type { RxJsonSchema } from 'rxdb'
import type { SyncEnvelope } from '@/types/sync'

// This is ERD §5.3's worked example verbatim — the one collection where a real
// conflict is possible (a field close colliding with a PM reassignment while
// offline). lib/sync/conflictResolver.ts's punch_items strategy is the only
// non-append-only branch in the whole sync engine.

export type PunchItemStatus = 'Open' | 'InProgress' | 'Closed'

export interface PunchItemDoc extends SyncEnvelope {
  project: string
  location: string
  description: string
  assigned_to: string
  status: PunchItemStatus
  rfi: string | null
}

export const punchItemSchema: RxJsonSchema<PunchItemDoc> = {
  version: 0,
  primaryKey: 'local_uuid',
  type: 'object',
  properties: {
    local_uuid: { type: 'string', maxLength: 64 },
    server_id: { type: ['string', 'null'] },
    project: { type: 'string', maxLength: 64 },
    location: { type: 'string' },
    description: { type: 'string' },
    assigned_to: { type: 'string' },
    status: { type: 'string', enum: ['Open', 'InProgress', 'Closed'] },
    rfi: { type: ['string', 'null'] },
    sync_status: { type: 'string', enum: ['pending', 'synced', 'conflict'], maxLength: 16 },
    queued_at: { type: 'string', format: 'date-time', maxLength: 32 },
    synced_at: { type: ['string', 'null'], format: 'date-time' },
    _rev: { type: 'string' },
  },
  required: ['local_uuid', 'project', 'description', 'status', 'sync_status', 'queued_at'],
  indexes: ['project', 'sync_status', 'status'],
}
