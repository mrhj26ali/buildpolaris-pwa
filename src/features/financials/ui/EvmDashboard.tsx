import { useEvmSnapshot } from '../model/useFinancials'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState, ErrorState } from '@/lib/ui/States'
import { formatCurrency, formatCompactCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { cn } from '@/lib/utils'

function performanceColor(index: number): string {
  if (index >= 1) return 'text-status-ontrack'
  if (index >= 0.9) return 'text-status-atrisk'
  return 'text-status-overdue'
}

export function EvmDashboard({ project }: { project: string }) {
  const { data: evm, isLoading, isError, error, refetch } = useEvmSnapshot(project)

  if (isLoading) return <LoadingState label="Loading EVM data…" />
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />
  if (!evm) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Planned Value</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xl font-semibold">{formatCompactCurrency(evm.planned_value)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Earned Value</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xl font-semibold">{formatCompactCurrency(evm.earned_value)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Actual Cost</CardTitle>
          </CardHeader>
          <CardContent><p className="text-xl font-semibold">{formatCompactCurrency(evm.actual_cost)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">As of</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm">{formatDate(evm.as_of)}</p></CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Cost Performance Index</CardTitle></CardHeader>
          <CardContent>
            <p className={cn('text-3xl font-bold', performanceColor(evm.cpi))}>{evm.cpi.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{evm.cpi >= 1 ? 'Under budget' : 'Over budget'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Schedule Performance Index</CardTitle></CardHeader>
          <CardContent>
            <p className={cn('text-3xl font-bold', performanceColor(evm.spi))}>{evm.spi.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{evm.spi >= 1 ? 'Ahead of schedule' : 'Behind schedule'}</p>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">
        Total actual cost to date: {formatCurrency(evm.actual_cost)}
      </p>
    </div>
  )
}
