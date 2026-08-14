export type SyncStatus = 'pending' | 'synced' | 'conflict';

export interface SyncEnvelope {
  local_uuid: string;
  server_id: string | null;
  sync_status: SyncStatus;
  queued_at: string;
  synced_at: string | null;
  _rev: string;
}

export interface SyncMutationPayload {
  local_uuid: string;
  target_collection: 'daily_logs' | 'jsas' | 'incidents' | 'punch_items';
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, unknown>;
  base_version?: number;
}

export interface SyncResponse {
  applied: Array<{ local_uuid: string; server_id: string; server_modified: number }>;
  conflicts: Array<{ local_uuid: string; server_id: string; server_data: Record<string, unknown> }>;
  errors: Array<{ local_uuid: string; error: string; message: string }>;
  server_timestamp: number;
}
