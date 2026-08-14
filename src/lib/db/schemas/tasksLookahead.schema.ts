import type { RxJsonSchema } from 'rxdb'

// Read-only cache (ERD §5.1): "a superintendent needs to see the look-ahead...
// offline, even though they can't edit them." Never queued, never conflicts —
// simply overwritten wholesale on each successful refresh while online.

export interface TaskLookaheadDoc {
  name: string // primary key — mirrors Task.name (BFF)
  project: string
  subject: string
  early_start: string | null
  early_finish: string | null
  is_critical: boolean
  cached_at: string
}

export const tasksLookaheadSchema: RxJsonSchema<TaskLookaheadDoc> = {
  version: 0,
  primaryKey: 'name',
  type: 'object',
  properties: {
    name: { type: 'string', maxLength: 64 },
    project: { type: 'string', maxLength: 64 },
    subject: { type: 'string' },
    early_start: { type: ['string', 'null'] },
    early_finish: { type: ['string', 'null'] },
    is_critical: { type: 'boolean' },
    cached_at: { type: 'string', format: 'date-time' },
  },
  required: ['name', 'project', 'subject', 'cached_at'],
  indexes: ['project'],
}
