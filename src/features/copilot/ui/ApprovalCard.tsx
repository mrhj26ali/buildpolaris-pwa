import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AiDisclosureWrapper } from '@/lib/ui/AiDisclosureWrapper'
import { useApproveAction, useRejectAction } from '../model/useApprovals'
import type { AgentActionApproval } from '@/types/copilot'
import { Check, X } from 'lucide-react'

// FR-8.6: "every gated write goes through the same single approval mechanism
// regardless of which agent proposed it — no agent implements its own
// approval flow." One component renders every AgentActionApproval regardless
// of agent_type; nothing here branches per-agent.
export function ApprovalCard({ approval, project }: { approval: AgentActionApproval; project?: string }) {
  const approveMutation = useApproveAction(project)
  const rejectMutation = useRejectAction(project)
  const [showPayload, setShowPayload] = useState(false)

  return (
    <Card className="border-violet-300 dark:border-violet-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Pending approval — {approval.target_doctype}</CardTitle>
          <Badge variant="outline" className="text-xs">{approval.agent_type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AiDisclosureWrapper>
          <p className="text-sm">
            An AI agent has drafted a change to <span className="font-medium">{approval.target_doctype}</span>.
            Nothing has been applied yet — review below before approving.
          </p>
          <button
            type="button"
            className="mt-2 text-xs font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
            onClick={() => setShowPayload((v) => !v)}
          >
            {showPayload ? 'Hide details' : 'Show proposed changes'}
          </button>
          {showPayload && (
            <pre className="mt-2 max-h-48 overflow-auto rounded bg-black/5 p-2 text-xs dark:bg-white/5">
              {JSON.stringify(approval.proposed_payload, null, 2)}
            </pre>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Model {approval.model_version} · Confidence {(approval.confidence * 100).toFixed(0)}%
          </p>
        </AiDisclosureWrapper>

        <div className="flex gap-2">
          <Button
            className="min-h-11 gap-1.5"
            disabled={approveMutation.isPending || rejectMutation.isPending}
            onClick={() => void approveMutation.mutateAsync(approval.name)}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Approve
          </Button>
          <Button
            variant="outline"
            className="min-h-11 gap-1.5"
            disabled={approveMutation.isPending || rejectMutation.isPending}
            onClick={() => void rejectMutation.mutateAsync({ name: approval.name })}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
