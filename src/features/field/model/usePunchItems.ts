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
import { useQueryClient } from '@tanstack/react-query'

// Helper to invalidate both the specific list AND the global project summary
const invalidateAll = (qc: any, project: string, listKey: readonly any[]) => {
  qc.invalidateQueries({ queryKey: listKey })
  qc.invalidateQueries({ queryKey: ['projects', 'summary', project] })
}

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
    }).catch((error) => {
        console.error("RxDB Initialization Error:", error)
        setLoading(false) // Prevent infinite loading if DB fails
      })

    return () => subscription?.unsubscribe()
  }, [project])

  const conflicted = items.filter((i) => i.sync_status === 'conflict')

  return { items, conflicted, loading }
}

export function useCreatePunchItem(project: string) {
  const [submitting, setSubmitting] = useState(false)
  const qc = useQueryClient()
  const punchItemsKey = ['punch-items', project] as const

  const create = useCallback(async (input: PunchItemInput) => {
    setSubmitting(true)
    try {
      const doc = await insertPunchItem(input)
      void syncEngine.drainNow()
      invalidateAll(qc, project, punchItemsKey)
      return doc
    } finally {
      setSubmitting(false)
    }
  }, [qc, project])

  return { create, submitting }
}

export function useUpdatePunchItemStatus(project: string) {
  const qc = useQueryClient()
  const punchItemsKey = ['punch-items', project] as const

  return useCallback(async (localUuid: string, status: PunchItemStatus) => {
    await updatePunchItemStatus(localUuid, status)
    void syncEngine.drainNow()
    invalidateAll(qc, project, punchItemsKey)
  }, [qc, project])
}

// ERD §5.4: "user resolves explicitly" — the resolution UI calls this with the
// user's chosen final state, which re-queues the write (sync_status back to
// 'pending') rather than silently picking either side.
export function useResolvePunchItemConflict(project: string) {
  const qc = useQueryClient()
  const punchItemsKey = ['punch-items', project] as const

  return useCallback(
    async (localUuid: string, resolved: Partial<Pick<PunchItemDoc, 'status' | 'assigned_to' | 'description'>>) => {
      await resolvePunchItemConflict(localUuid, resolved)
      void syncEngine.drainNow()
      invalidateAll(qc, project, punchItemsKey)
    },
    [qc, project],
  )
}