import { useTasksLookahead } from '../model/useTasksLookahead'
import { EmptyState } from '@/lib/ui/States'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/date'

// ERD §5.1: "a superintendent needs to see the look-ahead... offline, even
// though they can't edit them." Renders directly from the read-only RxDB
// cache — no bffClient call, works with zero connectivity.
export function ScheduleLookaheadWidget({ project }: { project: string }) {
  const tasks = useTasksLookahead(project)

  if (tasks.length === 0) {
    return <EmptyState title="No cached schedule data" description="Reconnect to refresh the look-ahead." />
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.slice(0, 10).map((task) => (
        <li key={task.name} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
          <span className={task.is_critical ? 'font-medium text-destructive' : ''}>{task.subject}</span>
          <div className="flex items-center gap-2">
            {task.is_critical && <Badge variant="destructive" className="text-xs">Critical</Badge>}
            <span className="text-xs text-muted-foreground">{formatDate(task.early_finish)}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
