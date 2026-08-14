import { bffRequest } from '@/lib/clients/bffClient'
import type { AgentActionApproval } from '@/types/copilot'

// FR-8.6: "every gated write goes through the same single approval mechanism
// regardless of which agent proposed it." One list, one approve, one reject —
// never a per-agent variant.
export async function listPendingApprovals(project?: string): Promise<AgentActionApproval[]> {
  const query = project ? `?project=${encodeURIComponent(project)}` : ''
  return bffRequest<AgentActionApproval[]>(
    `/method/buildpolaris_bff.ai_copilot.api.list_pending_approvals${query}`,
    { method: 'GET' },
  )
}

export async function approveAction(approvalName: string): Promise<AgentActionApproval> {
  return bffRequest<AgentActionApproval>('/method/buildpolaris_bff.ai_copilot.api.approve_action', {
    method: 'POST',
    body: JSON.stringify({ name: approvalName }),
  }, { idempotencyKey: `approval-approve:${approvalName}` })
}

export async function rejectAction(approvalName: string, reason?: string): Promise<AgentActionApproval> {
  return bffRequest<AgentActionApproval>('/method/buildpolaris_bff.ai_copilot.api.reject_action', {
    method: 'POST',
    body: JSON.stringify({ name: approvalName, reason }),
  }, { idempotencyKey: `approval-reject:${approvalName}` })
}
