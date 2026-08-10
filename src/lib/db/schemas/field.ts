import { RxJsonSchema } from 'rxdb';

export const dailyLogSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'local_id',
  type: 'object',
  properties: {
    local_id: { type: 'string', maxLength: 100 },
    server_name: { type: 'string', default: '' },
    project: { type: 'string' },
    date: { type: 'string' },
    weather: { type: 'string' },
    notes: { type: 'string' },
    modified: { type: 'number' },
    synced: { type: 'boolean', default: false },
  },
  required: ['local_id', 'project', 'date'],
};

export const punchItemSchema: RxJsonSchema<any> = {
  version: 0,
  primaryKey: 'local_id',
  type: 'object',
  properties: {
    local_id: { type: 'string', maxLength: 100 },
    server_name: { type: 'string', default: '' },
    project: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string', enum: ['Open', 'Closed'], default: 'Open' },
    modified: { type: 'number' },
    synced: { type: 'boolean', default: false },
  },
  required: ['local_id', 'project', 'description'],
};
