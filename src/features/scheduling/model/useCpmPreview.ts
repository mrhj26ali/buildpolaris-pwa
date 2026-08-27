import { useEffect, useState, useMemo } from 'react'
import { useCpmWorker } from '@/lib/workers/useCpmWorker'
import type { TaskRecord, TaskDependency } from '@/types/domain'
import type { CpmComputation } from '@/lib/cpm'

function getHolidayOffsets(holidays: string[], projectStartDate: string): number[] {
  if (!holidays.length || !projectStartDate) return []
  const start = new Date(projectStartDate)
  start.setHours(0, 0, 0, 0)
  
  return holidays.map(h => {
    const hDate = new Date(h)
    hDate.setHours(0, 0, 0, 0)
    const diffTime = hDate.getTime() - start.getTime()
    return Math.round(diffTime / (1000 * 60 * 60 * 24))
  }).filter(offset => offset >= 0)
}

export function useCpmPreview(
  tasks: TaskRecord[], 
  dependencies: TaskDependency[], 
  projectStartDate: string,
  holidays: string[]
) {
  const { compute, ready } = useCpmWorker()
  const [preview, setPreview] = useState<CpmComputation | null>(null)
  const [computing, setComputing] = useState(false)
  
  const holidayOffsets = useMemo(() => getHolidayOffsets(holidays, projectStartDate), [holidays, projectStartDate])

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
      holidayOffsets
    ).then((result) => {
      setPreview(result)
      setComputing(false)
    })
  }, [ready, tasks, dependencies, holidayOffsets, compute])

  return { preview, computing }
}