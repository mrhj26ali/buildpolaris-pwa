import { getDatabase } from '../database'
import type { JsaDoc } from '../schemas/jsa.schema'
import { nowIso } from '@/lib/utils/date'
import { toMutable } from '../toMutable'

export type JsaInput = Omit<
  JsaDoc,
  'local_uuid' | 'server_id' | 'sync_status' | 'queued_at' | 'synced_at' | '_rev'
>

export async function insertJsa(input: JsaInput): Promise<JsaDoc> {
  const db = await getDatabase()
  const doc: JsaDoc = {
    ...input,
    local_uuid: crypto.randomUUID(),
    server_id: null,
    sync_status: 'pending',
    queued_at: nowIso(),
    synced_at: null,
    _rev: '',
  }
  const inserted = await db.jsas.insert(doc)
  return toMutable(inserted.toJSON())
}

export async function listJsas(project: string): Promise<JsaDoc[]> {
  const db = await getDatabase()
  const docs = await db.jsas.find({ selector: { project }, sort: [{ jsa_date: 'desc' }] }).exec()
  return docs.map((d) => toMutable(d.toJSON()))
}

export async function findPendingJsas(): Promise<JsaDoc[]> {
  const db = await getDatabase()
  const docs = await db.jsas.find({ selector: { sync_status: 'pending' } }).exec()
  return docs.map((d) => toMutable(d.toJSON()))
}

export async function markJsaSynced(localUuid: string, serverId: string): Promise<void> {
  const db = await getDatabase()
  const doc = await db.jsas.findOne(localUuid).exec()
  if (!doc) return
  await doc.patch({ server_id: serverId, sync_status: 'synced', synced_at: nowIso() })
}
