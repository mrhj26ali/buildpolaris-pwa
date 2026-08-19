import { useProjectContext } from '@/app/providers/ProjectContext'
import { useTasks, useDependencies, useRecomputeSchedule } from '../model/useScheduling'
import { useCpmPreview } from '../model/useCpmPreview'
import { VirtualizedGantt } from './VirtualizedGantt'
import { NewTaskDialog } from './NewTaskDialog'
import { DependencyEditorDialog } from './DependencyEditorDialog'
import { BaselinePanel } from './BaselinePanel'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { useMemo } from 'react'

export default function SchedulePage() {
  const { activeProject } = useProjectContext()
  const project = activeProject?.name

  const tasksQuery = useTasks(project)
  const depsQuery = useDependencies(project)
  const recomputeMutation = useRecomputeSchedule(project ?? '')

  const { preview, computing } = useCpmPreview(tasksQuery.data ?? [], depsQuery.data ?? [])

  const previewByName = useMemo(() => {
    if (!preview) return undefined
    return new Map(preview.result.rows.map((row) => [row.name, row]))
  }, [preview])

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState title="No project selected" />
      </div>
    )
  }

  if (tasksQuery.isLoading || depsQuery.isLoading) return <LoadingState label="Loading schedule…" />
  if (tasksQuery.isError) return <ErrorState message={tasksQuery.error.message} onRetry={() => void tasksQuery.refetch()} />

  const tasks = tasksQuery.data ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Schedule</h1>
          <p className="text-sm text-muted-foreground">
            {preview ? `Project duration: ${preview.result.project_duration} days` : 'Critical Path Method'}
            {computing && ' · recalculating…'}
          </p>
        </div>
        <div className="flex gap-2">
          <DependencyEditorDialog project={project} tasks={tasks} />
          <NewTaskDialog project={project} />
          <Button
            variant="outline"
            className="min-h-11 gap-1.5"
            disabled={recomputeMutation.isPending}
            onClick={() => void recomputeMutation.mutateAsync()}
          >
            <RefreshCw className={recomputeMutation.isPending ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} aria-hidden="true" />
            Recalculate
          </Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState title="No tasks yet" description="Add your first task to start building the schedule." />
      ) : (
        <VirtualizedGantt 
          tasks={tasks} 
          previewByName={previewByName} 
          projectDuration={preview ? preview.result.project_duration : 30}
        />
      )}

      {preview && preview.health.negative_float_tasks.length > 0 && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {preview.health.negative_float_tasks.length} task(s) have negative float — the schedule is infeasible as
          currently constrained.
        </div>
      )}

      <BaselinePanel project={project} />
    </div>
  )
}