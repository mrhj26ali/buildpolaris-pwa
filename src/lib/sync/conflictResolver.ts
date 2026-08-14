// ERD §5.4's table, encoded as executable strategy, not a generic rule:
//
// | Collection    | Resolution                                             |
// |---------------|---------------------------------------------------------|
// | daily_logs    | Deterministic — not a conflict. Append-only.             |
// | jsas          | Same — append-only, deterministic.                       |
// | incidents     | Same — append-only, deterministic. Never merged/overwritten. |
// | punch_items   | NOT deterministic — surfaced to the user explicitly.     |
//
// ARCH §3.2: "a generic rule here would silently violate FR-6.5's 'never
// silently dropped' for exactly the one collection where a silent drop is most
// consequential." This map is why that can't happen by accident — every
// collection must have an explicit entry, and only punch_items's entry ever
// returns `surface: true`.

import type { WritableFieldCollection, SyncApplyResult } from '@/types/sync'

export interface ConflictDecision {
  // 'apply-deterministic': BFF already resolved it server-side (append-only
  //   collections can't actually conflict — this branch exists for completeness
  //   and defensive logging, not because the BFF is expected to return it).
  // 'surface': show both versions, block until the user resolves explicitly.
  action: 'apply-deterministic' | 'surface'
}

const STRATEGY: Record<WritableFieldCollection, (result: SyncApplyResult) => ConflictDecision> = {
  daily_logs: () => ({ action: 'apply-deterministic' }),
  jsas: () => ({ action: 'apply-deterministic' }),
  incidents: () => ({ action: 'apply-deterministic' }),
  punch_items: () => ({ action: 'surface' }),
}

export function resolveConflict(
  collection: WritableFieldCollection,
  result: SyncApplyResult,
): ConflictDecision {
  return STRATEGY[collection](result)
}
