import { useCostCodes, useCommitments } from '../model/useFinancials'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { formatCurrency } from '@/lib/utils/currency'

export function BudgetTable({ project }: { project: string }) {
  const costCodesQuery = useCostCodes(project)
  const commitmentsQuery = useCommitments(project)

  if (costCodesQuery.isLoading) return <LoadingState label="Loading budget…" />
  if (costCodesQuery.isError) return <ErrorState message={costCodesQuery.error.message} onRetry={() => void costCodesQuery.refetch()} />

  const costCodes = costCodesQuery.data ?? []
  const commitments = commitmentsQuery.data ?? []

  if (costCodes.length === 0) {
    return <EmptyState title="No cost codes yet" description="Set up your budget structure to begin tracking costs." />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Budget</TableHead>
          <TableHead className="text-right">Committed</TableHead>
          <TableHead className="text-right">Remaining</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {costCodes.map((cc) => {
          const committed = commitments
            .filter((c) => c.cost_code === cc.name && c.status === 'Approved')
            .reduce((sum, c) => sum + c.revised_amount, 0)
          const remaining = cc.budget_amount - committed
          return (
            <TableRow key={cc.name}>
              <TableCell className="font-mono text-sm">{cc.code}</TableCell>
              <TableCell>{cc.description}</TableCell>
              <TableCell className="text-right">{formatCurrency(cc.budget_amount)}</TableCell>
              <TableCell className="text-right">{formatCurrency(committed)}</TableCell>
              <TableCell className={`text-right ${remaining < 0 ? 'text-destructive font-medium' : ''}`}>
                {formatCurrency(remaining)}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
