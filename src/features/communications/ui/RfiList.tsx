import { useState } from 'react'
import { useRfis, useCloseRfi } from '../model/useCommunications'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { formatDate, isOverdue } from '@/lib/utils/date'
import { NewRfiDialog } from './NewRfiDialog'
import { RfiDetailSheet } from './RfiDetailSheet'
import type { Rfi, RfiStatus } from '@/types/domain'
import { cn } from '@/lib/utils'

const STATUS_VARIANT: Record<RfiStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Open: 'secondary',
  Answered: 'default',
  Closed: 'outline',
  Escalated: 'destructive',
}

export function RfiList({ project }: { project: string }) {
  const rfisQuery = useRfis(project)
  const closeMutation = useCloseRfi(project)
  const [selected, setSelected] = useState<Rfi | null>(null)

  if (rfisQuery.isLoading) return <LoadingState label="Loading RFIs…" />
  if (rfisQuery.isError) return <ErrorState message={rfisQuery.error.message} onRetry={() => void rfisQuery.refetch()} />

  const rfis = rfisQuery.data ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <NewRfiDialog project={project} />
      </div>
      {rfis.length === 0 ? (
        <EmptyState title="No RFIs yet" description="Requests for information will appear here." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Assigned to</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfis.map((rfi) => (
              <TableRow key={rfi.name} className="cursor-pointer" onClick={() => setSelected(rfi)}>
                <TableCell className="max-w-xs truncate font-medium">{rfi.subject}</TableCell>
                <TableCell>{rfi.assigned_to}</TableCell>
                <TableCell className={cn(isOverdue(rfi.due_date) && rfi.status === 'Open' && 'text-destructive font-medium')}>
                  {formatDate(rfi.due_date)}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[rfi.status]}>{rfi.status}</Badge>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  {rfi.status === 'Answered' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-11"
                      disabled={closeMutation.isPending}
                      onClick={() => void closeMutation.mutateAsync(rfi.name)}
                    >
                      Close
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <RfiDetailSheet project={project} rfi={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
