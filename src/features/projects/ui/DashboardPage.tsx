import { Link } from 'react-router-dom'
import { useProjectContext } from '@/app/providers/ProjectContext'
import { useProjectSummary } from '../model/useProjectSummary'
import { ScheduleHealthBadge } from './ScheduleHealthBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { formatDate } from '@/lib/utils/date'

export default function DashboardPage() {
  const { activeProject } = useProjectContext()
  const { data: summary, isLoading, isError, error, refetch } = useProjectSummary(activeProject?.name)

  if (!activeProject) {
    return (
      <div className="p-6">
        <EmptyState title="No project selected" description="Choose a project from the header to get started." />
      </div>
    )
  }

  if (isLoading) return <LoadingState label="Loading project summary…" />
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />
  if (!summary) return null

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{activeProject.title}</h1>
          <p className="text-sm text-muted-foreground">Project overview</p>
        </div>
        <ScheduleHealthBadge health={summary.schedule_health} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Open RFIs" value={summary.open_rfi_count} to="/communications" />
        <SummaryCard title="Open Submittals" value={summary.open_submittal_count} to="/communications" />
        <SummaryCard title="Open Punch Items" value={summary.open_punch_item_count} to="/field" />
        <SummaryCard
          title="Pay Application"
          value={summary.pending_pay_application ? 'Pending' : 'Up to date'}
          to="/financials"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Earned Value</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-6">
            <div>
              <p className="text-xs text-muted-foreground">CPI</p>
              <p className="text-2xl font-semibold">{summary.cpi?.toFixed(2) ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">SPI</p>
              <p className="text-2xl font-semibold">{summary.spi?.toFixed(2) ?? '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next milestone</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.next_milestone ? (
              <>
                <p className="font-medium">{summary.next_milestone.subject}</p>
                <p className="text-sm text-muted-foreground">
                  Due {formatDate(summary.next_milestone.early_finish)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming milestones</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SummaryCard({ title, value, to }: { title: string; value: string | number; to: string }) {
  return (
    <Link to={to}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{value}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
