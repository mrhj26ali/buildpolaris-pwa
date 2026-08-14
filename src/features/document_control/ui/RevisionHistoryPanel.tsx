import { useRevisions } from '../model/useDocumentControl'
import { Badge } from '@/components/ui/badge'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { UploadRevisionDialog } from './UploadRevisionDialog'
import type { Drawing } from '@/types/domain'
import { cn } from '@/lib/utils'

export function RevisionHistoryPanel({ drawing }: { drawing: Drawing }) {
  const revisionsQuery = useRevisions(drawing.name)

  if (revisionsQuery.isLoading) return <LoadingState label="Loading revisions…" />
  if (revisionsQuery.isError)
    return <ErrorState message={revisionsQuery.error.message} onRetry={() => void revisionsQuery.refetch()} />

  const revisions = revisionsQuery.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">{drawing.title}</h2>
        <UploadRevisionDialog drawing={drawing.name} />
      </div>

      {revisions.length === 0 ? (
        <EmptyState title="No revisions uploaded" />
      ) : (
        <ul className="flex flex-col gap-2">
          {revisions.map((rev) => (
            <li
              key={rev.name}
              className={cn(
                'flex items-center justify-between rounded-md border p-3',
                rev.is_current && 'border-primary bg-primary/5',
              )}
            >
              <div>
                <p className="font-medium">Rev {rev.revision_code}</p>
                <p className="text-xs text-muted-foreground">Issued for {rev.issued_for}</p>
              </div>
              {rev.is_current ? (
                <Badge>Current</Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Superseded
                </Badge>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
