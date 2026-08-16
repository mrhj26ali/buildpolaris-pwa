import { getDatabase } from '../database'
import type { PunchItemDoc, PunchItemStatus } from '../schemas/punchListItem.schema'
import { nowIso } from '@/lib/utils/date'
import { toMutable } from '../toMutable'

export type PunchItemInput = Omit<
  PunchItemDoc,
  'local_uuid' | 'server_id' | 'sync_status' | 'queued_at' | 'synced_at' | '_rev'
>

export async function insertPunchItem(input: PunchItemInput): Promise<PunchItemDoc> {
  const db = await getDatabase()
  const doc: PunchItemDoc = {
    ...input,
    local_uuid: crypto.randomUUID(),
    server_id: null,
    sync_status: 'pending',
    queued_at: nowIso(),
    synced_at: null,
    _rev: '',
  }
  const inserted = await db.punch_items.insert(doc)
  return toMutable(inserted.toJSON())
}

export async function listPunchItems(project: string): Promise<PunchItemDoc[]> {
  const db = await getDatabase()
  const docs = await db.punch_items.find({ selector: { project } }).exec()
  return docs.map((d) => toMutable(d.toJSON()))
}

export async function findPendingPunchItems(): Promise<PunchItemDoc[]> {
  const db = await getDatabase()
  const docs = await db.punch_items.find({ selector: { sync_status: 'pending' } }).exec()
  return docs.map((d) => toMutable(d.toJSON()))
}

export async function findConflictedPunchItems(): Promise<PunchItemDoc[]> {
  const db = await getDatabase()
  const docs = await db.punch_items.find({ selector: { sync_status: 'conflict' } }).exec()
  return docs.map((d) => toMutable(d.toJSON()))
}

export async function updatePunchItemStatus(localUuid: string, status: PunchItemStatus): Promise<void> {
  const db = await getDatabase()
  const doc = await db.punch_items.findOne(localUuid).exec()
  if (!doc) return
  await doc.patch({ status, sync_status: 'pending', queued_at: nowIso() })
}

export async function markPunchItemSynced(localUuid: string, serverId: string): Promise<void> {
  const db = await getDatabase()
  const doc = await db.punch_items.findOne(localUuid).exec()
  if (!doc) return
  await doc.patch({ server_id: serverId, sync_status: 'synced', synced_at: nowIso() })
}

// ERD §5.4: "the PWA shows both versions and asks the user to confirm before
// re-submitting." This marks the local doc as conflicted; the server version is
// held by the caller (SyncEngine) and surfaced via PunchListConflictResolver.tsx,
// not persisted into RxDB itself (it's a transient UI concern, not local state).
export async function markPunchItemConflict(localUuid: string): Promise<void> {
  const db = await getDatabase()
  const doc = await db.punch_items.findOne(localUuid).exec()
  if (!doc) return
  await doc.patch({ sync_status: 'conflict' })
}

// User has explicitly resolved a conflict (ERD §5.4 step: "user resolves
// explicitly") — re-queue with the user's chosen final state.
export async function resolvePunchItemConflict(
  localUuid: string,
  resolved: Partial<Pick<PunchItemDoc, 'status' | 'assigned_to' | 'description'>>,
): Promise<void> {
  const db = await getDatabase()
  const doc = await db.punch_items.findOne(localUuid).exec()
  if (!doc) return
  await doc.patch({ ...resolved, sync_status: 'pending', queued_at: nowIso() })
}
