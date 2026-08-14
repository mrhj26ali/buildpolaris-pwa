import type { RxJsonSchema } from 'rxdb';
import type { PunchItem } from '@/types/domain';

export const punchListItemSchema: RxJsonSchema<PunchItem> = {
  version: 0,
  primaryKey: 'local_uuid',
  type: 'object',
  properties: {
    local_uuid: { type: 'string', maxLength: 64 },
    server_id: { type: ['string', 'null'] },
    project: { type: 'string' },
    location: { type: 'string' },
    description: { type: 'string' },
    assigned_to: { type: 'string' },
    status: { type: 'string', enum: ['Open', 'InProgress', 'Closed'] },
    rfi: { type: ['string', 'null'] },
    sync_status: { type: 'string', enum: ['pending', 'synced', 'conflict'] },
    queued_at: { type: 'string', format: 'date-time' },
    synced_at: { type: ['string', 'null'], format: 'date-time' },
    _rev: { type: 'string' },
  },
  required: ['local_uuid', 'project', 'description', 'status', 'sync_status', 'queued_at', '_rev'],
  indexes: ['project', 'sync_status', 'status'],
};
