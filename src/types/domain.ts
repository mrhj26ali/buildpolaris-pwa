import type { SyncEnvelope } from './sync';

export interface DailyLog extends SyncEnvelope {
  project: string;
  log_date: string;
  weather: string;
  notes: string;
  workforce_count: number;
  work_performed: string;
  photos?: Array<{ local_file_uri: string; gps_lat?: number; gps_lng?: number; captured_at: string }>;
}

export interface JSA extends SyncEnvelope {
  project: string;
  title: string;
  date: string;
  hazards?: Array<{ description: string; risk_level: string; control_measure: string }>;
}

export interface SafetyIncident extends SyncEnvelope {
  project: string;
  incident_date: string;
  incident_type: string;
  severity: string;
  status: string;
  description: string;
  osha_recordable: boolean;
  photos?: Array<{ local_file_uri: string; gps_lat?: number; gps_lng?: number; captured_at: string }>;
  voice_note_uri?: string;
}

export interface PunchItem extends SyncEnvelope {
  project: string;
  location: string;
  description: string;
  assigned_to: string;
  status: 'Open' | 'InProgress' | 'Closed';
  rfi: string | null;
}
