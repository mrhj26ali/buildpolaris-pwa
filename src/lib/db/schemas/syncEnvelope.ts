// The sync envelope every writable collection's RxJsonSchema embeds (ERD §5.2).
// Kept as a spreadable fragment (not a shared base schema) because RxDB schemas
// are flat JSON-Schema objects — composition happens at the properties/required
// level, not via inheritance.

export const syncEnvelopeProperties = {
  local_uuid: { type: 'string', maxLength: 64 } as const,
  server_id: { type: ['string', 'null'] } as const,
  sync_status: { type: 'string', enum: ['pending', 'synced', 'conflict'] } as const,
  queued_at: { type: 'string', format: 'date-time' } as const,
  synced_at: { type: ['string', 'null'], format: 'date-time' } as const,
  // _rev removed as requested
}

export const syncEnvelopeRequired = ['local_uuid', 'sync_status', 'queued_at'] as const