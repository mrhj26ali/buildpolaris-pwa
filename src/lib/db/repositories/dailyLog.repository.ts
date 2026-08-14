import { getDatabase } from '../database'
import type { DailyLogDoc } from '../schemas/dailyLog.schema'
import { nowIso } from '@/lib/utils/date'

export type DailyLogInput = Omit<
  DailyLogDoc,
  'local_uuid' | 'server_id' | 'sync_status' | 'queued_at' | 'synced_at' | '_rev'
>

export async function insertDailyLog(input: DailyLogInput): Promise<DailyLogDoc> {
  const db = await getDatabase()
  const doc: DailyLogDoc = {
    ...input,
    local_uuid: crypto.randomUUID(),
    server_id: null,
    sync_status: 'pending',
    queued_at: nowIso(),
    synced_at: null,
    _rev: '',
  }
  const inserted = await db.daily_logs.insert(doc)
  return inserted.toJSON()
}

export async function listDailyLogs(project: string): Promise<DailyLogDoc[]> {
  const db = await getDatabase()
  const docs = await db.daily_logs
    .find({ selector: { project }, sort: [{ log_date: 'desc' }] })
    .exec()
  return docs.map((d) => d.toJSON())
}

export async function findPendingDailyLogs(): Promise<DailyLogDoc[]> {
  const db = await getDatabase()
  const docs = await db.daily_logs.find({ selector: { sync_status: 'pending' } }).exec()
  return docs.map((d) => d.toJSON())
}

export async function markDailyLogSynced(localUuid: string, serverId: string): Promise<void> {
  const db = await getDatabase()
  const doc = await db.daily_logs.findOne(localUuid).exec()
  if (!doc) return
  await doc.patch({ server_id: serverId, sync_status: 'synced', synced_at: nowIso() })
}
