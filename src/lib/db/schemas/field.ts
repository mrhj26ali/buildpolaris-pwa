import { RxJsonSchema } from 'rxdb';

export interface DailyLogDoc {
  local_id: string;
  server_name?: string;
  project: string;
  log_date: string;
  weather?: string;
  notes?: string;
  modified: number;
  synced: boolean;
}

export interface PunchItemDoc {
  local_id: string;
  server_name?: string;
  project: string;
  description: string;
  status?: string;
  modified: number;
  synced: boolean;
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
    modified: { type: 'number' },
    synced: { type: 'boolean' },
  },
  required: ['local_id', 'project', 'log_date'],
};

export const punchItemSchema: RxJsonSchema<PunchItemDoc> = {
  version: 0,
  primaryKey: 'local_id',
  type: 'object',
  properties: {
    local_id: { type: 'string', maxLength: 100 },
    server_name: { type: 'string' },
    project: { type: 'string' },
    description: { type: 'string' },
    status: { type: 'string' },
    modified: { type: 'number' },
    synced: { type: 'boolean' },
  },
  required: ['local_id', 'project', 'description'],
};
