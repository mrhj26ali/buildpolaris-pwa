import { useState } from 'react'
import { useProjectContext } from '@/app/providers/ProjectContext'
import { useDrawings } from '../model/useDocumentControl'
import { DrawingList } from './DrawingList'
import { RevisionHistoryPanel } from './RevisionHistoryPanel'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import type { Drawing } from '@/types/domain'

export default function DocumentsPage() {
  const { activeProject } = useProjectContext()
  const drawingsQuery = useDrawings(activeProject?.name)
  const [selected, setSelected] = useState<Drawing | null>(null)

  if (!activeProject) {
    return (
      <div className="p-6">
        <EmptyState title="No project selected" />
      </div>
    )
  }

  if (drawingsQuery.isLoading) return <LoadingState label="Loading drawings…" />
  if (drawingsQuery.isError)
    return <ErrorState message={drawingsQuery.error.message} onRetry={() => void drawingsQuery.refetch()} />

  const drawings = drawingsQuery.data ?? []
  const current = selected ?? drawings[0] ?? null

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Documents</h1>
        <p className="text-sm text-muted-foreground">Drawings and revisions for {activeProject.title}</p>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden md:grid-cols-[280px_1fr]">
        <div className="overflow-y-auto">
          <DrawingList drawings={drawings} selected={current} onSelect={setSelected} />
        </div>
        <div className="overflow-y-auto rounded-lg border p-4">
          {current ? (
            <RevisionHistoryPanel drawing={current} />
          ) : (
            <EmptyState title="Select a drawing" description="Choose a drawing on the left to see its revisions." />
          )}
        </div>
      </div>
    </div>
  )
}
