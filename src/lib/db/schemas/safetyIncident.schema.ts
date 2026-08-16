import type { RxJsonSchema } from 'rxdb'
import type { SyncEnvelope } from '@/types/sync'
import type { DailyLogMediaCapture } from './dailyLog.schema'

export type IncidentSeverity = 'Minor' | 'Recordable' | 'Lost-Time' | 'Fatality'

export interface IncidentInvolvedPerson {
  name: string
  role_on_site: string
}

export interface SafetyIncidentDoc extends SyncEnvelope {
  project: string
  incident_date: string // datetime, ISO
  severity: IncidentSeverity
  narrative: string
  reported_by: string
  involved_persons: IncidentInvolvedPerson[]
  media: DailyLogMediaCapture[]
}

export const safetyIncidentSchema: RxJsonSchema<SafetyIncidentDoc> = {
  version: 0,
  primaryKey: 'local_uuid',
  type: 'object',
  // NFR-PRIV.1/.2: narrative text and involved-person names are the fields
  // most likely to contain sensitive personal data in this collection.
  // Encrypted fields cannot be used in query selectors or indexes (RxDB
  // constraint) — hence 'narrative' and 'involved_persons' are excluded from
  // `indexes` below; queries filter by project/severity/date only, never by
  // narrative content. Encryption is applied by the wrapped storage
  // configured in lib/db/database.ts (encryption-crypto-js) — this array
  // just tells RxDB which fields that wrapper should encrypt at rest.
  encrypted: ['narrative', 'involved_persons'],
  properties: {
    local_uuid: { type: 'string', maxLength: 64 },
    server_id: { type: ['string', 'null'] },
    sync_status: { type: 'string', enum: ['pending', 'synced', 'conflict'], maxLength: 16 },
    queued_at: { type: 'string', format: 'date-time', maxLength: 32 },
    synced_at: { type: ['string', 'null'], format: 'date-time' },
    _rev: { type: 'string' },
    project: { type: 'string', maxLength: 64 },
    incident_date: { type: 'string', maxLength: 32 },
    severity: { type: 'string', enum: ['Minor', 'Recordable', 'Lost-Time', 'Fatality'] },
    narrative: { type: 'string' },
    reported_by: { type: 'string' },
    involved_persons: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          role_on_site: { type: 'string' },
        },
      },
    },
    media: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          local_file_ref: { type: 'string' },
          file: { type: ['string', 'null'] },
          latitude: { type: ['number', 'null'] },
          longitude: { type: ['number', 'null'] },
          captured_at: { type: 'string' },
        },
      },
    },
  },
  required: ['local_uuid', 'project', 'incident_date', 'severity', 'sync_status', 'queued_at'],
  indexes: ['project', 'sync_status', 'incident_date'],
}
