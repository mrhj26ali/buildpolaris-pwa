import type { RxJsonSchema } from 'rxdb'
import type { SyncEnvelope } from '@/types/sync'

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
  local_file_ref: string
  file: string | null
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
    synced_at: { type: ['string', 'null'], format: 'date-time', maxLength: 32 },
    project: { type: 'string', maxLength: 64 },
    log_date: { type: 'string', maxLength: 10 },
    submitted_by: { type: 'string', maxLength: 128 },
    weather: { type: 'string', maxLength: 128 },
    notes: { type: 'string', maxLength: 2048 },
    labor_lines: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          trade: { type: 'string', maxLength: 128 },
          headcount: { type: 'number' },
          hours: { type: 'number' },
        },
        required: ['trade', 'headcount', 'hours'],
      },
    },
    equipment_lines: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          equipment: { type: 'string', maxLength: 128 },
          hours_used: { type: 'number' },
        },
        required: ['equipment', 'hours_used'],
      },
    },
    media: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          local_file_ref: { type: 'string', maxLength: 128 },
          file: { type: ['string', 'null'], maxLength: 256 },
          latitude: { type: ['number', 'null'] },
          longitude: { type: ['number', 'null'] },
          captured_at: { type: 'string', format: 'date-time', maxLength: 32 },
        },
        required: ['local_file_ref', 'captured_at'],
      },
    },
  },
  required: ['local_uuid', 'project', 'log_date', 'sync_status', 'queued_at'],
}