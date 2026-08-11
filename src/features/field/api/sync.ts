import { bffRequest } from '@/lib/clients/bffClient';

export interface FieldMutation {
  local_id: string;
  server_name?: string;
  doctype: string;
  action: 'create' | 'update' | 'delete';
  data?: Record<string, unknown>;
}

export interface SyncResponse {
  applied: { local_id: string; server_name: string; action: string; server_modified?: number }[];
  conflicts: { local_id: string; server_name: string; server_data: Record<string, unknown> }[];
  errors: { local_id: string; error: string; message: string }[];
  server_timestamp: number;
}

export async function syncFieldMutations(mutations: FieldMutation[], lastSyncTimestamp: number) {
  return bffRequest<SyncResponse>('/method/buildpolaris_bff.api.field.sync_field_mutations', {
    method: 'POST',
    body: JSON.stringify({ mutations, last_sync_timestamp: lastSyncTimestamp }),
  });
}
