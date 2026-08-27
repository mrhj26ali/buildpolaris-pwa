import type { RxJsonSchema } from 'rxdb'
import type { SyncEnvelope } from '@/types/sync'

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
    location: { type: 'string', maxLength: 128 },
    description: { type: 'string', maxLength: 1024 },
    assigned_to: { type: 'string', maxLength: 128 },
    // ✅ FIX: Added maxLength: 16 because 'status' is in the indexes array
    status: { type: 'string', enum: ['Open', 'InProgress', 'Closed'], maxLength: 16 },
    rfi: { type: ['string', 'null'], maxLength: 64 },
    sync_status: { type: 'string', enum: ['pending', 'synced', 'conflict'], maxLength: 16 },
    queued_at: { type: 'string', format: 'date-time', maxLength: 32 },
    synced_at: { type: ['string', 'null'], format: 'date-time', maxLength: 32 },
  },
  required: ['local_uuid', 'project', 'description', 'status', 'sync_status', 'queued_at'],
  indexes: ['project', 'sync_status', 'status'],
}