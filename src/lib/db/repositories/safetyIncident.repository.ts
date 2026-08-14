import { getDatabase } from '../database'
import type { SafetyIncidentDoc } from '../schemas/safetyIncident.schema'
import { nowIso } from '@/lib/utils/date'

export type SafetyIncidentInput = Omit<
  SafetyIncidentDoc,
  'local_uuid' | 'server_id' | 'sync_status' | 'queued_at' | 'synced_at' | '_rev'
>

export async function insertSafetyIncident(input: SafetyIncidentInput): Promise<SafetyIncidentDoc> {
  const db = await getDatabase()
  const doc: SafetyIncidentDoc = {
    ...input,
    local_uuid: crypto.randomUUID(),
    server_id: null,
    sync_status: 'pending',
    queued_at: nowIso(),
    synced_at: null,
    _rev: '',
  }
  const inserted = await db.incidents.insert(doc)
  return inserted.toJSON()
}

export async function listSafetyIncidents(project: string): Promise<SafetyIncidentDoc[]> {
  const db = await getDatabase()
  const docs = await db.incidents
    .find({ selector: { project }, sort: [{ incident_date: 'desc' }] })
    .exec()
  return docs.map((d) => d.toJSON())
}

export async function findPendingSafetyIncidents(): Promise<SafetyIncidentDoc[]> {
  const db = await getDatabase()
  const docs = await db.incidents.find({ selector: { sync_status: 'pending' } }).exec()
  return docs.map((d) => d.toJSON())
}

export async function markSafetyIncidentSynced(localUuid: string, serverId: string): Promise<void> {
  const db = await getDatabase()
  const doc = await db.incidents.findOne(localUuid).exec()
  if (!doc) return
  await doc.patch({ server_id: serverId, sync_status: 'synced', synced_at: nowIso() })
}
