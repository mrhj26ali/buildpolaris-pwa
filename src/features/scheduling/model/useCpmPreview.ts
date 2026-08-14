import { useEffect, useState } from 'react'
import { useCpmWorker } from '@/lib/workers/useCpmWorker'
import type { TaskRecord, TaskDependency } from '@/types/domain'
import type { CpmComputation } from '@/lib/cpm'

// FR-2.3: "instant what-if feedback... never authoritative, never written
// back." This hook recomputes locally whenever the in-memory what-if edits
// (durations/dependencies the user is dragging in the Gantt, before hitting
// "Recalculate") change — the server recompute (useRecomputeSchedule) is a
// separate, explicit action.
export function useCpmPreview(tasks: TaskRecord[], dependencies: TaskDependency[]) {
  const { compute, ready } = useCpmWorker()
  const [preview, setPreview] = useState<CpmComputation | null>(null)
  const [computing, setComputing] = useState(false)

  useEffect(() => {
    if (!ready || tasks.length === 0) return
    setComputing(true)
    void compute(
      tasks.map((t) => ({ name: t.name, duration: t.duration })),
      dependencies.map((d) => ({
        predecessor: d.predecessor,
        successor: d.successor,
        type: d.type,
        lag_days: d.lag_days,
      })),
    ).then((result) => {
      setPreview(result)
      setComputing(false)
    })
  }, [ready, tasks, dependencies, compute])

  return { preview, computing }
}
