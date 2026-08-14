import type { RxJsonSchema } from 'rxdb'

// Read-only cache (ERD §5.1): metadata only, "never the file blob itself —
// large binaries stay fetched on demand." This is what lets a superintendent
// see which revision is current and whether it's superseded (FR-5.5) offline,
// without the PWA trying to cache every drawing PDF locally.

export interface DrawingRevisionMetaDoc {
  name: string // primary key — mirrors Drawing Revision.name (BFF)
  drawing: string
  drawing_number: string
  revision_code: string
  is_current: boolean
  issued_for: string
  cached_at: string
}

export const drawingRevisionsMetaSchema: RxJsonSchema<DrawingRevisionMetaDoc> = {
  version: 0,
  primaryKey: 'name',
  type: 'object',
  properties: {
    name: { type: 'string', maxLength: 64 },
    drawing: { type: 'string', maxLength: 64 },
    drawing_number: { type: 'string' },
    revision_code: { type: 'string' },
    is_current: { type: 'boolean' },
    issued_for: { type: 'string' },
    cached_at: { type: 'string', format: 'date-time' },
  },
  required: ['name', 'drawing', 'revision_code', 'is_current', 'cached_at'],
  indexes: ['drawing'],
}
