import type { RxJsonSchema } from 'rxdb'
import type { SyncEnvelope } from '@/types/sync'

export interface JsaHazardLine {
  hazard: string
  mitigation: string
}

export interface JsaDoc extends SyncEnvelope {
  project: string
  jsa_date: string
  crew: string
  prepared_by: string
  hazard_lines: JsaHazardLine[]
}

export const jsaSchema: RxJsonSchema<JsaDoc> = {
  version: 0,
  primaryKey: 'local_uuid',
  type: 'object',
  properties: {
    local_uuid: { type: 'string', maxLength: 64 },
    server_id: { type: ['string', 'null'] },
    sync_status: { type: 'string', enum: ['pending', 'synced', 'conflict'], maxLength: 16 },
    queued_at: { type: 'string', format: 'date-time', maxLength: 32 },
    synced_at: { type: ['string', 'null'], format: 'date-time' },
    _rev: { type: 'string' },
    project: { type: 'string', maxLength: 64 },
    jsa_date: { type: 'string', maxLength: 10 },
    crew: { type: 'string' },
    prepared_by: { type: 'string' },
    hazard_lines: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          hazard: { type: 'string' },
          mitigation: { type: 'string' },
        },
      },
    },
  },
  required: ['local_uuid', 'project', 'jsa_date', 'sync_status', 'queued_at'],
  indexes: ['project', 'sync_status', 'jsa_date'],
}
