import { useCloseoutReadiness, useFinalizeCloseout } from '../model/useCloseout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState } from '@/lib/ui/States'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

// FR-7.5: "the closeout gate is deliberately blocked until punch items are
// closed and final payment can issue." This component renders that gate
// visibly rather than just disabling a button silently — every unmet
// condition is named so the PM knows exactly what's outstanding.
export function CloseoutReadinessGate({ project, closingRecord }: { project: string; closingRecord: string }) {
  const { data: readiness, isLoading, isError, error, refetch } = useCloseoutReadiness(closingRecord)
  const finalizeMutation = useFinalizeCloseout(project, closingRecord)

  if (isLoading) return <LoadingState label="Checking readiness…" />
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />
  if (!readiness) return null

  const checks = [
    { label: 'All punch items closed', met: readiness.all_punch_items_closed },
    { label: 'Substantial completion signed', met: readiness.substantial_completion_signed },
    { label: 'Final payment issued', met: readiness.final_payment_issued },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Closeout readiness</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2">
          {checks.map((check) => (
            <li key={check.label} className="flex items-center gap-2 text-sm">
              {check.met ? (
                <CheckCircle2 className="h-4 w-4 text-status-ontrack" aria-hidden="true" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
              <span className={cn(!check.met && 'text-muted-foreground')}>{check.label}</span>
            </li>
          ))}
        </ul>
        <Button
          disabled={!readiness.ready_to_finalize || finalizeMutation.isPending}
          onClick={() => void finalizeMutation.mutateAsync()}
          className="min-h-11 w-fit"
        >
          {finalizeMutation.isPending ? 'Finalizing…' : 'Finalize project closeout'}
        </Button>
      </CardContent>
    </Card>
  )
}
