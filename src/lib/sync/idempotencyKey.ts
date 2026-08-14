// ARCH §3.2: "one Idempotency-Key per queued write (derived from local_uuid),
// so a retried replay after a dropped response never double-creates a record
// server-side." Deriving deterministically (not randomly re-generated per
// attempt) is what makes a retried replay idempotent — the key must be stable
// across attempts for the same logical write.

import type { WritableFieldCollection } from '@/types/sync'

export function deriveIdempotencyKey(collection: WritableFieldCollection, localUuid: string): string {
  return `${collection}:${localUuid}`
}
