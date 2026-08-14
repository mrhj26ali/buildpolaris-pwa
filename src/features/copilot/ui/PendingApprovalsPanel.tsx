import { usePendingApprovals } from '../model/useApprovals'
import { ApprovalCard } from './ApprovalCard'
import { LoadingState, EmptyState } from '@/lib/ui/States'

export function PendingApprovalsPanel({ project }: { project?: string }) {
  const { data: approvals, isLoading } = usePendingApprovals(project)

  if (isLoading) return <LoadingState label="Checking for pending approvals…" />

  const pending = (approvals ?? []).filter((a) => a.status === 'Pending')

  if (pending.length === 0) {
    return <EmptyState title="No pending approvals" description="AI-proposed writes will appear here for review." />
  }

  return (
    <div className="flex flex-col gap-3">
      {pending.map((approval) => (
        <ApprovalCard key={approval.name} approval={approval} project={project} />
      ))}
    </div>
  )
}
