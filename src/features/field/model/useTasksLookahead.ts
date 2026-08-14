import { useEffect, useState } from 'react'
import { getDatabase } from '@/lib/db/database'
import type { TaskLookaheadDoc } from '@/lib/db/schemas/tasksLookahead.schema'

export function useTasksLookahead(project: string | undefined) {
  const [tasks, setTasks] = useState<TaskLookaheadDoc[]>([])

  useEffect(() => {
    if (!project) return
    let subscription: { unsubscribe: () => void } | undefined

    void getDatabase().then((db) => {
      subscription = db.tasks_lookahead
        .find({ selector: { project }, sort: [{ early_start: 'asc' }] })
        .$.subscribe((docs) => setTasks(docs.map((d) => d.toJSON())))
    })

    return () => subscription?.unsubscribe()
  }, [project])

  return tasks
}
