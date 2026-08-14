import { useDailyLogs } from '../model/useDailyLogs'
import { SyncStatusBadge } from '@/lib/ui/SyncStatusBadge'
import { EmptyState, LoadingState } from '@/lib/ui/States'
import { formatDate } from '@/lib/utils/date'
import { Card, CardContent } from '@/components/ui/card'

export function DailyLogList({ project }: { project: string }) {
  const { logs, loading } = useDailyLogs(project)

  if (loading) return <LoadingState label="Loading daily logs…" />
  if (logs.length === 0) return <EmptyState title="No daily logs yet" description="Field entries you create work fully offline." />

  return (
    <div className="flex flex-col gap-2">
      {logs.map((log) => (
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
