import { getDatabase } from '@/lib/db/database'
import { fetchCurrentRevisionsForOfflineCache } from './documentControlApi'
import { nowIso } from '@/lib/utils/date'

// ERD §5.1: "never the file blob itself — large binaries stay fetched on
// demand." This wholesale-replaces the local cache on each successful refresh
// (no merge logic needed — it's read-only, so "latest wins" is simply correct).
export async function refreshDrawingRevisionsCache(project: string): Promise<void> {
  const revisions = await fetchCurrentRevisionsForOfflineCache(project)
  const db = await getDatabase()
  const cachedAt = nowIso()

  await db.drawing_revisions_meta.bulkUpsert(
    revisions.map((r) => ({
      name: r.name,
      drawing: r.drawing,
      drawing_number: r.drawing_number,
      revision_code: r.revision_code,
      is_current: r.is_current,
      issued_for: r.issued_for,
      cached_at: cachedAt,
    })),
  )
}
