import type { RxJsonSchema } from 'rxdb'
import type { SyncEnvelope } from '@/types/sync'

// Mirrors BFF "Daily Log" + child tables (ERD §3.4). Field names are kept
// identical to the BFF DocType's own field names deliberately (ERD §3.4 design
// note): "keeping the BFF-side field names identical to the RxDB collection
// field names... is what keeps the sync mapping a straight pass-through."

export interface DailyLogLaborLine {
  trade: string
  headcount: number
  hours: number
}

export interface DailyLogEquipmentLine {
  equipment: string
  hours_used: number
}

export interface DailyLogMediaCapture {
  local_file_ref: string // client-side blob/File reference before upload
  file: string | null // MariaDB File.name once uploaded (UC-5.3)
  latitude: number | null
  longitude: number | null
  captured_at: string
}

export interface DailyLogDoc extends SyncEnvelope {
  project: string
  log_date: string
  submitted_by: string
  weather: string
  notes: string
  labor_lines: DailyLogLaborLine[]
  equipment_lines: DailyLogEquipmentLine[]
  media: DailyLogMediaCapture[]
}

export const dailyLogSchema: RxJsonSchema<DailyLogDoc> = {
  version: 0,
  primaryKey: 'local_uuid',
  type: 'object',
  properties: {
    local_uuid: { type: 'string', maxLength: 64 },
    server_id: { type: ['string', 'null'] },
    sync_status: { type: 'string', enum: ['pending', 'synced', 'conflict'], maxLength: 16 },
    queued_at: { type: 'string', format: 'date-time', maxLength: 32 },
    synced_at: { type: ['string', 'null'], format: 'date-time' },
    project: { type: 'string', maxLength: 64 },
    log_date: { type: 'string', maxLength: 10 },
    submitted_by: { type: 'string' },
    weather: { type: 'string' },
    notes: { type: 'string' },
    labor_lines: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          trade: { type: 'string' },
          headcount: { type: 'number' },
          hours: { type: 'number' },
        },
      },
    },
    equipment_lines: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          equipment: { type: 'string' },
          hours_used: { type: 'number' },
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
  required: ['local_uuid', 'project', 'log_date', 'sync_status', 'queued_at'],
  indexes: ['project', 'sync_status', 'log_date'],
}
