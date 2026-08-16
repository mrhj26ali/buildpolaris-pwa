import { useCallback, useEffect, useState } from 'react'
import { getDatabase } from '@/lib/db/database'
import {
  insertPunchItem,
  updatePunchItemStatus,
  resolvePunchItemConflict,
  type PunchItemInput,
} from '@/lib/db/repositories/punchListItem.repository'
import { toMutable } from '@/lib/db/toMutable'
import type { PunchItemDoc, PunchItemStatus } from '@/lib/db/schemas/punchListItem.schema'
import { syncEngine } from '@/lib/sync/SyncEngine'

export function usePunchItems(project: string | undefined) {
  const [items, setItems] = useState<PunchItemDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!project) return
    let subscription: { unsubscribe: () => void } | undefined

    void getDatabase().then((db) => {
      subscription = db.punch_items.find({ selector: { project } }).$.subscribe((docs) => {
        setItems(docs.map((d) => toMutable(d.toJSON())))
        setLoading(false)
      })
    })

    return () => subscription?.unsubscribe()
  }, [project])

  const conflicted = items.filter((i) => i.sync_status === 'conflict')

  return { items, conflicted, loading }
}

export function useCreatePunchItem() {
  const [submitting, setSubmitting] = useState(false)

  const create = useCallback(async (input: PunchItemInput) => {
    setSubmitting(true)
    try {
      const doc = await insertPunchItem(input)
      void syncEngine.drainNow()
      return doc
    } finally {
      setSubmitting(false)
    }
  }, [])

  return { create, submitting }
}

export function useUpdatePunchItemStatus() {
  return useCallback(async (localUuid: string, status: PunchItemStatus) => {
    await updatePunchItemStatus(localUuid, status)
    void syncEngine.drainNow()
  }, [])
}

// ERD §5.4: "user resolves explicitly" — the resolution UI calls this with the
// user's chosen final state, which re-queues the write (sync_status back to
// 'pending') rather than silently picking either side.
export function useResolvePunchItemConflict() {
  return useCallback(
    async (localUuid: string, resolved: Partial<Pick<PunchItemDoc, 'status' | 'assigned_to' | 'description'>>) => {
      await resolvePunchItemConflict(localUuid, resolved)
      void syncEngine.drainNow()
    },
    [],
  )
}
