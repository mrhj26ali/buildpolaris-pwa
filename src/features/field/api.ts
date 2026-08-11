// src/features/field/api.ts
import { bffRequest } from '@/lib/clients/bffClient';

export interface DailyLogNode {
  name: string;
  log_date: string;
  status: 'Draft' | 'Submitted' | 'Synced';
  weather_conditions: string | null;
  workforce_count: number;
  submitted_by: string | null;
}

export interface PunchItemNode {
  name: string;
  title: string;
  location: string | null;
  assigned_to: string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Closed';
  due_date: string | null;
  closed_at: string | null;
}

export interface SafetyIncidentNode {
  name: string;
  incident_date: string;
  incident_type: 'Near Miss' | 'First Aid' | 'Recordable' | 'Lost Time' | 'Fatality';
  severity: string;
  status: 'Draft' | 'Reported' | 'Under Investigation' | 'Closed';
  osha_recordable: number;
  location: string | null;
}

export interface SafetyStats {
  total_incidents: number;
  osha_recordable: number;
  near_misses: number;
  lost_time: number;
  first_aid: number;
}

export async function getDailyLogList(projectId: string): Promise<DailyLogNode[]> {
  return bffRequest<DailyLogNode[]>('/method/buildpolaris_bff.api.field_execution.get_daily_log_list', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getPunchList(projectId: string): Promise<PunchItemNode[]> {
  return bffRequest<PunchItemNode[]>('/method/buildpolaris_bff.api.field_execution.get_punch_list', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getSafetyIncidentList(projectId: string): Promise<SafetyIncidentNode[]> {
  return bffRequest<SafetyIncidentNode[]>('/method/buildpolaris_bff.api.field_execution.get_safety_incident_list', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getSafetyStatistics(projectId: string): Promise<SafetyStats> {
  return bffRequest<SafetyStats>('/method/buildpolaris_bff.api.field_execution.get_safety_statistics', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function createDailyLog(payload: {
  project: string;
  log_date: string;
  weather_conditions?: string;
  workforce_count?: number;
  work_performed?: string;
}): Promise<string> {
  return bffRequest<string>('/method/buildpolaris_bff.application.field_service.create_daily_log', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitDailyLog(logId: string): Promise<void> {
  await bffRequest('/method/buildpolaris_bff.application.field_service.submit_daily_log', {
    method: 'POST',
    body: JSON.stringify({ log_id: logId }),
  });
}

export async function createPunchItem(payload: {
  project: string;
  title: string;
  location?: string;
  priority?: string;
}): Promise<string> {
  return bffRequest<string>('/method/buildpolaris_bff.application.field_service.create_punch_item', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function closePunchItem(punchItemId: string, notes?: string): Promise<void> {
  await bffRequest('/method/buildpolaris_bff.application.field_service.close_punch_item', {
    method: 'POST',
    body: JSON.stringify({ punch_item_id: punchItemId, notes }),
  });
}

export async function checkPunchCloseoutGate(projectId: string): Promise<{
  cleared: boolean;
  open_count: number;
  blockers: PunchItemNode[];
}> {
  return bffRequest('/method/buildpolaris_bff.application.field_service.check_punch_closeout_gate', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}




