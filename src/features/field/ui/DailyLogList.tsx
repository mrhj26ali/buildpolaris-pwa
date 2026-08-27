import { useMemo } from 'react'
import { useDailyLogs } from '../model/useDailyLogs'
import { SyncStatusBadge } from '@/lib/ui/SyncStatusBadge'
import { EmptyState, LoadingState } from '@/lib/ui/States'
import { formatDate } from '@/lib/utils/date'
import { Card, CardContent } from '@/components/ui/card'

export function DailyLogList({ project }: { project: string }) {
  const { logs, loading } = useDailyLogs(project)

  // ✅ FIX: Sort logs so the newest appears at the top
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      // Fallback to queued_at if log_date is missing (for unsynced items)
      const dateA = new Date(a.log_date || a.queued_at).getTime()
      const dateB = new Date(b.log_date || b.queued_at).getTime()
      return dateB - dateA // Descending order
    })
  }, [logs])

  if (loading) return <LoadingState label="Loading daily logs…" />
  if (sortedLogs.length === 0) return <EmptyState title="No daily logs yet" description="Field entries you create work fully offline." />

  return (
    <div className="flex flex-col gap-2">
      {/* ✅ FIX: Map over sortedLogs instead of logs */}
      {sortedLogs.map((log) => (
        <Card key={log.local_uuid}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{formatDate(log.log_date)}</p>
              <p className="text-sm text-muted-foreground">
                {log.labor_lines.length} trade(s) · {log.weather || 'No weather noted'}
              </p>
            </div>
            <SyncStatusBadge status={log.sync_status} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}