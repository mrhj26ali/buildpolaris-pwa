import { useMeetingSeries, useActionItems, useCompleteActionItem } from '../model/useCommunications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { formatDate, isOverdue } from '@/lib/utils/date'
import { cn } from '@/lib/utils'

export function MeetingsAndActionItems({ project }: { project: string }) {
  const seriesQuery = useMeetingSeries(project)
  const actionItemsQuery = useActionItems(project)
  const completeMutation = useCompleteActionItem(project)

  if (seriesQuery.isLoading || actionItemsQuery.isLoading) return <LoadingState label="Loading meetings…" />
  if (seriesQuery.isError) return <ErrorState message={seriesQuery.error.message} onRetry={() => void seriesQuery.refetch()} />

  const series = seriesQuery.data ?? []
  const actionItems = actionItemsQuery.data ?? []

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Recurring meetings</CardTitle></CardHeader>
        <CardContent>
          {series.length === 0 ? (
            <EmptyState title="No meeting series yet" />
          ) : (
            <ul className="flex flex-col gap-2">
              {series.map((s) => (
                <li key={s.name} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                  <span className="font-medium">{s.title}</span>
                  <span className="text-xs text-muted-foreground">{s.recurrence_rule}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Action items</CardTitle></CardHeader>
        <CardContent>
          {actionItems.length === 0 ? (
            <EmptyState title="No open action items" />
          ) : (
            <ul className="flex flex-col gap-2">
              {actionItems.map((item) => (
                <li key={item.name} className="flex items-center gap-3 rounded-md border p-2.5 text-sm">
                  <Checkbox
                    checked={item.status === 'Done'}
                    disabled={item.status === 'Done' || completeMutation.isPending}
                    onCheckedChange={() => void completeMutation.mutateAsync(item.name)}
                  />
                  <div className="flex-1">
                    <p className={cn(item.status === 'Done' && 'text-muted-foreground line-through')}>
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.assignee}</p>
                  </div>
                  <Badge
                    variant={
                      item.status === 'Done' ? 'default' : isOverdue(item.due_date) ? 'destructive' : 'outline'
                    }
                  >
                    {item.status === 'Done' ? 'Done' : formatDate(item.due_date)}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
