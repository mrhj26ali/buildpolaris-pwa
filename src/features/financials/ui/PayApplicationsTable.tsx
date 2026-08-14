import { usePayApplications, useSubmitPayApplication, useApprovePayApplication } from '../model/useFinancials'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { formatDate } from '@/lib/utils/date'
import { useAuth } from '@/lib/auth/useAuth'
import type { PayApplicationStatus } from '@/types/domain'

const STATUS_VARIANT: Record<PayApplicationStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Draft: 'outline',
  PendingApproval: 'secondary',
  Approved: 'default',
  Rejected: 'destructive',
  Paid: 'default',
}

export function PayApplicationsTable({ project }: { project: string }) {
  const payAppsQuery = usePayApplications(project)
  const submitMutation = useSubmitPayApplication(project)
  const approveMutation = useApprovePayApplication(project)
  const { session, isAdmin } = useAuth()
  const canApprove = isAdmin || session?.roles.some((r) => r === 'Owner' || r === 'Accounting')

  if (payAppsQuery.isLoading) return <LoadingState label="Loading pay applications…" />
  if (payAppsQuery.isError)
    return <ErrorState message={payAppsQuery.error.message} onRetry={() => void payAppsQuery.refetch()} />

  const payApps = payAppsQuery.data ?? []
  if (payApps.length === 0) {
    return <EmptyState title="No pay applications yet" />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Period end</TableHead>
          <TableHead>Retainage</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payApps.map((pa) => (
          <TableRow key={pa.name}>
            <TableCell>{formatDate(pa.period_end)}</TableCell>
            <TableCell>{pa.retainage_pct}%</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[pa.status]}>{pa.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              {pa.status === 'Draft' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="min-h-11"
                  disabled={submitMutation.isPending}
                  onClick={() => void submitMutation.mutateAsync(pa.name)}
                >
                  Submit
                </Button>
              )}
              {pa.status === 'PendingApproval' && canApprove && (
                <Button
                  size="sm"
                  className="min-h-11"
                  disabled={approveMutation.isPending}
                  onClick={() => void approveMutation.mutateAsync(pa.name)}
                >
                  Approve
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
