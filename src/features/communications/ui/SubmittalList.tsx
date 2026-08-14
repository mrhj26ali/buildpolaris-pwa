import { useSubmittals, useReviewSubmittalLine } from '../model/useCommunications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import type { SubmittalLineStatus, SubmittalStatus } from '@/types/domain'

const PACKAGE_STATUS_VARIANT: Record<SubmittalStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Submitted: 'secondary',
  UnderReview: 'secondary',
  Approved: 'default',
  Rejected: 'destructive',
  ResubmitRequested: 'destructive',
}

const LINE_STATUSES: SubmittalLineStatus[] = ['Pending', 'Approved', 'Revise', 'Rejected']

export function SubmittalList({ project }: { project: string }) {
  const submittalsQuery = useSubmittals(project)
  const reviewMutation = useReviewSubmittalLine(project)

  if (submittalsQuery.isLoading) return <LoadingState label="Loading submittals…" />
  if (submittalsQuery.isError)
    return <ErrorState message={submittalsQuery.error.message} onRetry={() => void submittalsQuery.refetch()} />

  const submittals = submittalsQuery.data ?? []
  if (submittals.length === 0) {
    return <EmptyState title="No submittal packages yet" />
  }

  return (
    <div className="flex flex-col gap-4">
      {submittals.map((pkg) => (
        <Card key={pkg.name}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{pkg.spec_section}</CardTitle>
            <Badge variant={PACKAGE_STATUS_VARIANT[pkg.status]}>{pkg.status}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {pkg.lines.map((line) => (
              <div key={line.name} className="flex items-center justify-between gap-3 rounded-md border p-2.5">
                <span className="text-sm">{line.description}</span>
                <Select
                  value={line.status}
                  onValueChange={(status) =>
                    void reviewMutation.mutateAsync({ submittal: pkg.name, line: line.name, status })
                  }
                >
                  <SelectTrigger className="min-h-11 w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LINE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
