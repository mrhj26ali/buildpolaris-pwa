import { useChangeEvents, useApproveChangeEvent } from '../model/useFinancials'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { formatCurrency } from '@/lib/utils/currency'
import { useAuth } from '@/lib/auth/useAuth'

export function ChangeEventsTable({ project }: { project: string }) {
  const changeEventsQuery = useChangeEvents(project)
  const approveMutation = useApproveChangeEvent(project)
  const { session, isAdmin } = useAuth()
  const canApprove = isAdmin || session?.roles.some((r) => r === 'Owner' || r === 'Project Manager')

  if (changeEventsQuery.isLoading) return <LoadingState label="Loading change events…" />
  if (changeEventsQuery.isError)
    return <ErrorState message={changeEventsQuery.error.message} onRetry={() => void changeEventsQuery.refetch()} />

  const events = changeEventsQuery.data ?? []
  if (events.length === 0) {
    return <EmptyState title="No change events" description="Cost or scope changes originating from RFIs or field conditions will appear here." />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          {canApprove && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((ce) => (
          <TableRow key={ce.name}>
            <TableCell>
              <Badge variant="outline">{ce.category}</Badge>
            </TableCell>
            <TableCell className="max-w-xs truncate">{ce.outcome_reason}</TableCell>
            <TableCell className={`text-right ${ce.amount_delta < 0 ? 'text-status-ontrack' : ''}`}>
              {formatCurrency(ce.amount_delta)}
            </TableCell>
            <TableCell>
              <Badge variant={ce.status === 'Approved' ? 'default' : ce.status === 'Rejected' ? 'destructive' : 'secondary'}>
                {ce.status}
              </Badge>
            </TableCell>
            {canApprove && (
              <TableCell className="text-right">
                {ce.status === 'Open' && (
                  <Button
                    size="sm"
                    className="min-h-11"
                    disabled={approveMutation.isPending}
                    onClick={() => void approveMutation.mutateAsync(ce.name)}
                  >
                    Approve
                  </Button>
                )}
                {ce.is_immutable && <span className="text-xs text-muted-foreground">Locked</span>}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
