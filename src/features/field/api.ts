import { bffRequest } from '@/lib/clients/bffClient'
import { syncEngine } from '@/lib/sync/SyncEngine'
import { getDatabase } from '@/lib/db'
import type { DailyLogDoc, JsaDoc, SafetyIncidentDoc, PunchItemDoc } from '@/lib/db/schemas/field'

export interface DailyLogNode {
  name: string
  log_date: string
  status: 'Draft' | 'Submitted' | 'Synced'
  weather_conditions: string | null
  workforce_count: number
  submitted_by: string | null
}

export interface PunchItemNode {
  name: string
  title: string
  location: string | null
  assigned_to: string | null
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'In Progress' | 'Closed'
  due_date: string | null
  closed_at: string | null
}

export interface SafetyIncidentNode {
  name: string
  incident_date: string
  incident_type: 'Near Miss' | 'First Aid' | 'Recordable' | 'Lost Time' | 'Fatality'
  severity: string
  status: 'Draft' | 'Reported' | 'Under Investigation' | 'Closed'
  osha_recordable: number
  location: string | null
}

export interface SafetyStats {
  total_incidents: number
  osha_recordable: number
  near_misses: number
  lost_time: number
  first_aid: number
}

// Read operations (online only)
export async function getDailyLogList(projectId: string): Promise<DailyLogNode[]> {
  return bffRequest<DailyLogNode[]>('/method/buildpolaris_bff.api.field_execution.get_daily_log_list', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  })
}

export async function getPunchList(projectId: string): Promise<PunchItemNode[]> {
  return bffRequest<PunchItemNode[]>('/method/buildpolaris_bff.api.field_execution.get_punch_list', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  })
}

export async function getSafetyIncidentList(projectId: string): Promise<SafetyIncidentNode[]> {
  return bffRequest<SafetyIncidentNode[]>('/method/buildpolaris_bff.api.field_execution.get_safety_incident_list', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  })
}

export async function getSafetyStatistics(projectId: string): Promise<SafetyStats> {
  return bffRequest<SafetyStats>('/method/buildpolaris_bff.api.field_execution.get_safety_statistics', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  })
}

// Write operations (offline-capable)
export async function createDailyLogOffline(data: Partial<DailyLogDoc>): Promise<string> {
  const local_id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const db = await getDatabase()
  
  const doc: DailyLogDoc = {
    local_id,
    project: data.project || 'default',
    log_date: data.log_date || new Date().toISOString().split('T')[0],
    weather: data.weather,
    notes: data.notes,
    workforce_count: data.workforce_count,
    work_performed: data.work_performed,
    modified: Date.now(),
    synced: false,
    photos: data.photos,
    lat: data.lat,
    lng: data.lng,
    captured_at: data.captured_at || new Date().toISOString(),
  }
  
  await db.daily_logs.insert(doc)
  
  await syncEngine.queueMutation({
    local_id,
    target_collection: 'daily_logs',
    operation: 'create',
    payload: doc as unknown as Record<string, unknown>,
  })
  
  return local_id
}

export async function createPunchItemOffline(data: Partial<PunchItemDoc>): Promise<string> {
  const local_id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const db = await getDatabase()
  
  const doc: PunchItemDoc = {
    local_id,
    project: data.project || 'default',
    title: data.title || '',
    description: data.description || '',
    location: data.location,
    priority: data.priority || 'Medium',
    status: 'Open',
    assigned_to: data.assigned_to,
    due_date: data.due_date,
    modified: Date.now(),
    synced: false,
  }
  
  await db.punch_items.insert(doc)
  
  await syncEngine.queueMutation({
    local_id,
    target_collection: 'punch_items',
    operation: 'create',
    payload: doc as unknown as Record<string, unknown>,
  })
  
  return local_id
}

export async function createSafetyIncidentOffline(data: Partial<SafetyIncidentDoc>): Promise<string> {
  const local_id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const db = await getDatabase()
  
  const doc: SafetyIncidentDoc = {
    local_id,
    project: data.project || 'default',
    incident_date: data.incident_date || new Date().toISOString().split('T')[0],
    incident_type: data.incident_type || 'Near Miss',
    severity: data.severity || 'Low',
    status: 'Draft',
    description: data.description,
    osha_recordable: data.osha_recordable || false,
    modified: Date.now(),
    synced: false,
    photos: data.photos,
    lat: data.lat,
    lng: data.lng,
    captured_at: data.captured_at || new Date().toISOString(),
    voice_note_uri: data.voice_note_uri,
  }
  
  await db.safety_incidents.insert(doc)
  
  await syncEngine.queueMutation({
    local_id,
    target_collection: 'safety_incidents',
    operation: 'create',
    payload: doc as unknown as Record<string, unknown>,
  })
  
  return local_id
}

export async function createJsaOffline(data: Partial<JsaDoc>): Promise<string> {
  const local_id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const db = await getDatabase()
  
  const doc: JsaDoc = {
    local_id,
    project: data.project || 'default',
    title: data.title || '',
    date: data.date || new Date().toISOString().split('T')[0],
    hazards: data.hazards,
    modified: Date.now(),
    synced: false,
  }
  
  await db.jsa.insert(doc)
  
  await syncEngine.queueMutation({
    local_id,
    target_collection: 'jsa',
    operation: 'create',
    payload: doc as unknown as Record<string, unknown>,
  })
  
  return local_id
}

// Local queries (offline-capable)
export async function getLocalDailyLogs(projectId: string): Promise<DailyLogDoc[]> {
  const db = await getDatabase()
  return db.daily_logs.find({ selector: { project: projectId } }).exec()
}

export async function getLocalPunchItems(projectId: string): Promise<PunchItemDoc[]> {
  const db = await getDatabase()
  return db.punch_items.find({ selector: { project: projectId } }).exec()
}

export async function getLocalSafetyIncidents(projectId: string): Promise<SafetyIncidentDoc[]> {
  const db = await getDatabase()
  return db.safety_incidents.find({ selector: { project: projectId } }).exec()
}

export async function checkPunchCloseoutGate(projectId: string): Promise<{
  cleared: boolean
  open_count: number
  blockers: PunchItemNode[]
}> {
  return bffRequest('/method/buildpolaris_bff.application.field_service.check_punch_closeout_gate', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  })
}
