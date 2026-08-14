import { useCallback, useEffect, useState } from 'react'
import { getDatabase } from '@/lib/db/database'
import { insertDailyLog, type DailyLogInput } from '@/lib/db/repositories/dailyLog.repository'
import type { DailyLogDoc } from '@/lib/db/schemas/dailyLog.schema'
import { syncEngine } from '@/lib/sync/SyncEngine'

// Field-execution hooks talk to RxDB directly (never bffClient) — the whole
// point of these 4 collections is that writes succeed with zero connectivity
// (FR-6.5). A live RxDB query subscription is what makes the UI reflect a
// pending -> synced transition without the component polling or refetching.
export function useDailyLogs(project: string | undefined) {
  const [logs, setLogs] = useState<DailyLogDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!project) return
    let subscription: { unsubscribe: () => void } | undefined

    void getDatabase().then((db) => {
      subscription = db.daily_logs
        .find({ selector: { project }, sort: [{ log_date: 'desc' }] })
        .$.subscribe((docs) => {
          setLogs(docs.map((d) => d.toJSON()))
          setLoading(false)
        })
    })

    return () => subscription?.unsubscribe()
  }, [project])

  return { logs, loading }
}

export function useCreateDailyLog() {
  const [submitting, setSubmitting] = useState(false)

  const create = useCallback(async (input: DailyLogInput) => {
    setSubmitting(true)
    try {
      const doc = await insertDailyLog(input)
      // UC-6.5: attempt an immediate sync if online, but the insert above has
      // already succeeded locally regardless — this is best-effort, not a
      // precondition for the write being considered "saved."
      void syncEngine.drainNow()
      return doc
    } finally {
      setSubmitting(false)
    }
  }, [])

  return { create, submitting }
}
