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
  // NOTE: Field-level encryption has been temporarily removed pending a
  // decision on RxDB premium licensing. The 'narrative' and 'involved_persons'
  // fields may contain sensitive personal data (NFR-PRIV.1/.2). If encryption
  // is required for production, the team needs to either:
  //   1. Obtain an RxDB premium license and restore the encryption plugin, OR
  //   2. Implement field-level encryption at the application layer before
  //      writing to RxDB.
  // This is a known gap that should be tracked and addressed before production.
  properties: {
    local_uuid: { type: 'string', maxLength: 64 },
    server_id: { type: ['string', 'null'] },
    sync_status: { type: 'string', enum: ['pending', 'synced', 'conflict'], maxLength: 16 },
    queued_at: { type: 'string', format: 'date-time', maxLength: 32 },
    synced_at: { type: ['string', 'null'], format: 'date-time' },
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