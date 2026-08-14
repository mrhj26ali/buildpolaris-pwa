import type { RxJsonSchema } from 'rxdb';
import type { DailyLog } from '@/types/domain';

export const dailyLogSchema: RxJsonSchema<DailyLog> = {
  version: 0,
  primaryKey: 'local_uuid',
  type: 'object',
  properties: {
    local_uuid: { type: 'string', maxLength: 64 },
    server_id: { type: ['string', 'null'] },
    project: { type: 'string' },
    log_date: { type: 'string' },
    weather: { type: 'string' },
    notes: { type: 'string' },
    workforce_count: { type: 'number' },
    work_performed: { type: 'string' },
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
    sync_status: { type: 'string', enum: ['pending', 'synced', 'conflict'] },
    queued_at: { type: 'string', format: 'date-time' },
    synced_at: { type: ['string', 'null'], format: 'date-time' },
    _rev: { type: 'string' },
  },
  required: ['local_uuid', 'project', 'log_date', 'sync_status', 'queued_at', '_rev'],
  indexes: ['project', 'sync_status', 'log_date'],
};
