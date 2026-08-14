import { useProjectContext } from '@/app/providers/ProjectContext'
import { useClosingRecord, useOpenClosingRecord } from '../model/useCloseout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CloseoutReadinessGate } from './CloseoutReadinessGate'
import { SubstantialCompletionPanel } from './SubstantialCompletionPanel'
import { LienWaiverTracker } from './LienWaiverTracker'
import { CloseoutDocumentsPanel } from './CloseoutDocumentsPanel'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { Button } from '@/components/ui/button'

export default function CloseoutPage() {
  const { activeProject } = useProjectContext()
  const recordQuery = useClosingRecord(activeProject?.name)
  const openMutation = useOpenClosingRecord(activeProject?.name ?? '')

  if (!activeProject) {
    return (
      <div className="p-6">
        <EmptyState title="No project selected" />
      </div>
    )
  }

  if (recordQuery.isLoading) return <LoadingState label="Loading closeout…" />
  if (recordQuery.isError)
    return <ErrorState message={recordQuery.error.message} onRetry={() => void recordQuery.refetch()} />

  if (!recordQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
        <h1 className="text-2xl font-semibold">Closeout not started</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Open a closing record to begin tracking substantial completion, lien waivers, and the final project package.
        </p>
        <Button
          className="min-h-11"
          disabled={openMutation.isPending}
          onClick={() => void openMutation.mutateAsync()}
        >
          {openMutation.isPending ? 'Opening…' : 'Open closing record'}
        </Button>
      </div>
    )
  }

  const record = recordQuery.data

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Closeout</h1>
        <p className="text-sm text-muted-foreground">{activeProject.title} · Status: {record.status}</p>
      </div>

      <Tabs defaultValue="readiness">
        <TabsList>
          <TabsTrigger value="readiness" className="min-h-11">Readiness</TabsTrigger>
          <TabsTrigger value="substantial-completion" className="min-h-11">Substantial Completion</TabsTrigger>
          <TabsTrigger value="lien-waivers" className="min-h-11">Lien Waivers</TabsTrigger>
          <TabsTrigger value="documents" className="min-h-11">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="readiness" className="mt-4">
          <CloseoutReadinessGate project={activeProject.name} closingRecord={record.name} />
        </TabsContent>
        <TabsContent value="substantial-completion" className="mt-4">
          <SubstantialCompletionPanel closingRecord={record.name} />
        </TabsContent>
        <TabsContent value="lien-waivers" className="mt-4">
          <LienWaiverTracker closingRecord={record.name} />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <CloseoutDocumentsPanel closingRecord={record.name} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
