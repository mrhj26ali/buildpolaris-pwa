import type { RxJsonSchema } from 'rxdb'

export interface DailyLogDoc {
  local_id: string
  server_name?: string
  project: string
  log_date: string
  weather?: string
  notes?: string
  workforce_count?: number
  work_performed?: string
  modified: number
  synced: boolean
  lat?: number
  lng?: number
  captured_at?: string
  photos?: Array<{
    local_file_uri: string
    gps_lat?: number
    gps_lng?: number
    captured_at: string
  }>
}

export interface JsaDoc {
  local_id: string
  server_name?: string
  project: string
  title: string
  date: string
  hazards?: Array<{
    description: string
    risk_level: string
    control_measure: string
  }>
  modified: number
  synced: boolean
}

export interface SafetyIncidentDoc {
  local_id: string
  server_name?: string
  project: string
  incident_date: string
  incident_type: string
  severity: string
  status: string
  description?: string
  osha_recordable: boolean
  modified: number
  synced: boolean
  lat?: number
  lng?: number
  captured_at?: string
  photos?: Array<{
    local_file_uri: string
    gps_lat?: number
    gps_lng?: number
    captured_at: string
  }>
  voice_note_uri?: string
}

export interface PunchItemDoc {
  local_id: string
  server_name?: string
  project: string
  title: string
  description: string
  location?: string
  priority: string
  status?: string
  assigned_to?: string
  due_date?: string
  modified: number
  synced: boolean
}

export interface MutationQueueDoc {
  local_id: string
  target_collection: 'daily_logs' | 'jsa' | 'safety_incidents' | 'punch_items'
  operation: 'create' | 'update' | 'delete'
  payload: Record<string, unknown>
  project: string
  created_at: string
  modified: number
  retry_count: number
  last_error?: string
  base_version?: number
  status: 'pending' | 'failed' | 'conflict'
}

export const dailyLogSchema: RxJsonSchema<DailyLogDoc> = {
  version: 0,
  primaryKey: 'local_id',
  type: 'object',
  properties: {
    local_id: { type: 'string', maxLength: 100 },
    server_name: { type: 'string' },
    project: { type: 'string' },
    log_date: { type: 'string' },
    weather: { type: 'string' },
    notes: { type: 'string' },
    workforce_count: { type: 'number' },
    work_performed: { type: 'string' },
    modified: { type: 'number' },
    synced: { type: 'boolean' },
    lat: { type: 'number' },
    lng: { type: 'number' },
    captured_at: { type: 'string' },
    photos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          local_file_uri: { type: 'string' },
          gps_lat: { type: 'number' },
          gps_lng: { type: 'number' },
          captured_at: { type: 'string' },
        },
      },
    },
  },
  required: ['local_id', 'project', 'log_date', 'modified', 'synced'],
  indexes: ['project', 'synced', 'log_date'],
}

export const jsaSchema: RxJsonSchema<JsaDoc> = {
  version: 0,
  primaryKey: 'local_id',
  type: 'object',
  properties: {
    local_id: { type: 'string', maxLength: 100 },
    server_name: { type: 'string' },
    project: { type: 'string' },
    title: { type: 'string' },
    date: { type: 'string' },
    hazards: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          risk_level: { type: 'string' },
          control_measure: { type: 'string' },
        },
      },
    },
    modified: { type: 'number' },
    synced: { type: 'boolean' },
  },
  required: ['local_id', 'project', 'title', 'date', 'modified', 'synced'],
  indexes: ['project', 'synced'],
}

export const safetyIncidentSchema: RxJsonSchema<SafetyIncidentDoc> = {
  version: 0,
  primaryKey: 'local_id',
  type: 'object',
  properties: {
    local_id: { type: 'string', maxLength: 100 },
    server_name: { type: 'string' },
    project: { type: 'string' },
    incident_date: { type: 'string' },
    incident_type: { type: 'string' },
    severity: { type: 'string' },
    status: { type: 'string' },
    description: { type: 'string' },
    osha_recordable: { type: 'boolean' },
    modified: { type: 'number' },
    synced: { type: 'boolean' },
    lat: { type: 'number' },
    lng: { type: 'number' },
    captured_at: { type: 'string' },
    photos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          local_file_uri: { type: 'string' },
          gps_lat: { type: 'number' },
          gps_lng: { type: 'number' },
          captured_at: { type: 'string' },
        },
      },
    },
    voice_note_uri: { type: 'string' },
  },
  required: ['local_id', 'project', 'incident_date', 'incident_type', 'severity', 'status', 'osha_recordable', 'modified', 'synced'],
  indexes: ['project', 'synced', 'incident_date'],
}

export const punchItemSchema: RxJsonSchema<PunchItemDoc> = {
  version: 0,
  primaryKey: 'local_id',
  type: 'object',
  properties: {
    local_id: { type: 'string', maxLength: 100 },
    server_name: { type: 'string' },
    project: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    location: { type: 'string' },
    priority: { type: 'string' },
    status: { type: 'string' },
    assigned_to: { type: 'string' },
    due_date: { type: 'string' },
    modified: { type: 'number' },
    synced: { type: 'boolean' },
  },
  required: ['local_id', 'project', 'title', 'description', 'priority', 'modified', 'synced'],
  indexes: ['project', 'synced', 'status'],
}

export const mutationQueueSchema: RxJsonSchema<MutationQueueDoc> = {
  version: 0,
  primaryKey: 'local_id',
  type: 'object',
  properties: {
    local_id: { type: 'string', maxLength: 100 },
    target_collection: { type: 'string' },
    operation: { type: 'string' },
    payload: { type: 'object' },
    project: { type: 'string' },
    created_at: { type: 'string' },
    modified: { type: 'number' },
    retry_count: { type: 'number' },
    last_error: { type: 'string' },
    base_version: { type: 'number' },
    status: { type: 'string' },
  },
  required: ['local_id', 'target_collection', 'operation', 'payload', 'project', 'created_at', 'modified', 'retry_count', 'status'],
  indexes: ['status', 'modified'],
}
