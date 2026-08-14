import { useSubstantialCompletion, useSignSubstantialCompletion } from '../model/useCloseout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState } from '@/lib/ui/States'
import { CheckCircle2 } from 'lucide-react'

const ROLES: { key: 'pm' | 'owner' | 'architect'; label: string; field: 'pm_signoff' | 'owner_signoff' | 'architect_signoff' }[] = [
  { key: 'pm', label: 'Project Manager', field: 'pm_signoff' },
  { key: 'owner', label: 'Owner', field: 'owner_signoff' },
  { key: 'architect', label: 'Architect', field: 'architect_signoff' },
]

export function SubstantialCompletionPanel({ closingRecord }: { closingRecord: string }) {
  const { data: cert, isLoading, isError, error, refetch } = useSubstantialCompletion(closingRecord)
  const signMutation = useSignSubstantialCompletion(closingRecord)

  if (isLoading) return <LoadingState label="Loading certificate…" />
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Substantial Completion Certificate</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {ROLES.map((role) => {
          const signed = cert ? Boolean(cert[role.field]) : false
          return (
            <div key={role.key} className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium">{role.label}</span>
              {signed ? (
                <span className="flex items-center gap-1.5 text-sm text-status-ontrack">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Signed
                </span>
              ) : (
                <Button
                  size="sm"
                  className="min-h-11"
                  disabled={signMutation.isPending}
                  onClick={() => void signMutation.mutateAsync(role.key)}
                >
                  Sign
                </Button>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
