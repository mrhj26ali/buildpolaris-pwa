import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listPendingApprovals, approveAction, rejectAction } from './approvalsApi'

const APPROVALS_KEY = (project?: string) => ['copilot', 'approvals', project ?? 'all'] as const

export function usePendingApprovals(project?: string) {
  return useQuery({
    queryKey: APPROVALS_KEY(project),
    queryFn: () => listPendingApprovals(project),
    refetchInterval: 15000, // NFR-UX.3-adjacent: approvals should surface promptly without manual refresh
  })
}

export function useApproveAction(project?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => approveAction(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: APPROVALS_KEY(project) }),
  })
}

export function useRejectAction(project?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, reason }: { name: string; reason?: string }) => rejectAction(name, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: APPROVALS_KEY(project) }),
  })
}
