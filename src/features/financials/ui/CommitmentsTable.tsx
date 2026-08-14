import { useCommitments, useApproveCommitment } from '../model/useFinancials'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { formatCurrency } from '@/lib/utils/currency'
import { useAuth } from '@/lib/auth/useAuth'
import type { CommitmentStatus } from '@/types/domain'

const STATUS_VARIANT: Record<CommitmentStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Draft: 'outline',
  PendingApproval: 'secondary',
  Approved: 'default',
  Rejected: 'destructive',
}

export function CommitmentsTable({ project }: { project: string }) {
  const commitmentsQuery = useCommitments(project)
  const approveMutation = useApproveCommitment(project)
  const { session, isAdmin } = useAuth()
  const canApprove = isAdmin || session?.roles.some((r) => r === 'Owner' || r === 'Project Manager')

  if (commitmentsQuery.isLoading) return <LoadingState label="Loading commitments…" />
  if (commitmentsQuery.isError)
    return <ErrorState message={commitmentsQuery.error.message} onRetry={() => void commitmentsQuery.refetch()} />

  const commitments = commitmentsQuery.data ?? []
  if (commitments.length === 0) {
    return <EmptyState title="No commitments yet" description="Subcontracts and purchase orders will appear here." />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Supplier</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          {canApprove && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {commitments.map((c) => (
          <TableRow key={c.name}>
            <TableCell className="font-medium">{c.supplier}</TableCell>
            <TableCell>{c.type}</TableCell>
            <TableCell className="text-right">{formatCurrency(c.revised_amount)}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
            </TableCell>
            {canApprove && (
              <TableCell className="text-right">
                {c.status === 'PendingApproval' && (
                  <Button
                    size="sm"
                    className="min-h-11"
                    disabled={approveMutation.isPending}
                    onClick={() => void approveMutation.mutateAsync(c.name)}
                  >
                    Approve
                  </Button>
                )}
                {c.is_immutable && <span className="text-xs text-muted-foreground">Locked</span>}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
