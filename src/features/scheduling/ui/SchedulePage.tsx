import { useProjectContext } from '@/app/providers/ProjectContext'
import { useTasks, useDependencies, useRecomputeSchedule } from '../model/useScheduling'
import { useCpmPreview } from '../model/useCpmPreview'
import { VirtualizedGantt } from './VirtualizedGantt'
import { NewTaskDialog } from './NewTaskDialog'
import { DependencyEditorDialog } from './DependencyEditorDialog'
import { BaselinePanel } from './BaselinePanel'
import { DcmaHealthReport } from './DcmaHealthReport' // ADD THIS
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { Button } from '@/components/ui/button'
import { RefreshCw, Undo2 } from 'lucide-react'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
// Import the Project type here
import { getProject, getProjectHolidays, type Project } from '@/features/projects/model/projectsApi' 
import type { TaskDependency } from '@/types/domain' // Add this import if not already present
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils/date'

// 1. Add these stable constants at the top of the file (outside the component)
const EMPTY_DEPS: TaskDependency[] = []

export default function SchedulePage() {
  const { activeProject } = useProjectContext()
  const project = activeProject?.name
  
  const tasksQuery = useTasks(project)
  const depsQuery = useDependencies(project)
  const recomputeMutation = useRecomputeSchedule(project ?? '')

  // ADD THIS: Fetch the project's holidays
  const { data: holidays } = useQuery({
    queryKey: ['project-holidays', project],
    queryFn: () => getProjectHolidays(project!),
    enabled: !!project,
  })

  // Use the actual Project type instead of a custom inline object
  const [projectDetails, setProjectDetails] = useState<Project | null>(null)
  
  useEffect(() => {
    if (project) {
      getProject(project).then(setProjectDetails).catch(console.error)
    }
  }, [project])

  const [whatIfTasks, setWhatIfTasks] = useState(tasksQuery.data ?? [])
  
  useEffect(() => {
    if (tasksQuery.data) {
      setWhatIfTasks(tasksQuery.data)
    }
  }, [tasksQuery.data])

  // FIX 1: Extract actual holiday dates
  const holidayDates = useMemo(() => {
    return (holidays || []).map(h => h.date)
  }, [holidays])

  // FIX 2: Pass them to the CPM engine (Replace EMPTY_HOLIDAYS)
  const { preview, computing } = useCpmPreview(
    whatIfTasks,
    depsQuery.data ?? EMPTY_DEPS,
    projectDetails?.expected_start_date ?? '',
    holidayDates // <--- FIXED
  )

  const previewByName = useMemo(() => {
    if (!preview) return undefined
    return new Map(preview.result.rows.map((row) => [row.name, row]))
  }, [preview])

  const handleDurationChange = useCallback((taskName: string, newDuration: number) => {
    setWhatIfTasks((prev) =>
      prev.map((t) => (t.name === taskName ? { ...t, duration: newDuration } : t))
    )
  }, [])

  const handleResetWhatIf = useCallback(() => {
    if (tasksQuery.data) {
      setWhatIfTasks(tasksQuery.data)
    }
  }, [tasksQuery.data])

  if (!project) {
    return <div className="p-6"><EmptyState title="No project selected" /></div>
  }

  if (tasksQuery.isLoading || depsQuery.isLoading) return <LoadingState label="Loading schedule…" />
  if (tasksQuery.isError) return <ErrorState message={tasksQuery.error.message} onRetry={() => void tasksQuery.refetch()} />

  const tasks = tasksQuery.data ?? []
  const isWhatIfActive = JSON.stringify(whatIfTasks) !== JSON.stringify(tasks)

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
          {isWhatIfActive && (
            <Button variant="outline" className="min-h-11 gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={handleResetWhatIf}>
              <Undo2 className="h-4 w-4" aria-hidden="true" /> Reset What-If
            </Button>
          )}
          <DependencyEditorDialog project={project} tasks={tasks} />
          <NewTaskDialog project={project} />
          <Button variant="outline" className="min-h-11 gap-1.5" disabled={recomputeMutation.isPending} onClick={() => void recomputeMutation.mutateAsync()}>
            <RefreshCw className={recomputeMutation.isPending ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} aria-hidden="true" /> Recalculate & Save
          </Button>
        </div>
      </div>

      {/* ADD THIS: The authoritative DCMA 14-point report */}
      <DcmaHealthReport project={project} />

      {tasks.length === 0 ? (
        <EmptyState title="No tasks yet" description="Add your first task to start building the schedule." />
      ) : (
        <VirtualizedGantt
          tasks={whatIfTasks}
          previewByName={previewByName}
          projectDuration={preview ? preview.result.project_duration : 30}
          onDurationChange={handleDurationChange}
        />
      )}

      {preview && preview.health.negative_float_tasks.length > 0 && (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {preview.health.negative_float_tasks.length} task(s) have negative float — the schedule is infeasible as currently constrained.
        </div>
      )}
      
      <BaselinePanel project={project} />

      {/* FIX 3: Fix the holiday list rendering at the bottom of the file */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Holidays (Non-Working Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {holidays && holidays.length > 0 ? (
            <ul className="flex flex-col gap-1 text-sm">
              {holidays.map((h, i) => (
                <li key={i} className="flex justify-between border-b pb-1">
                  <span className="font-medium">{formatDate(h.date)}</span> {/* Fixed from h.holiday_date */}
                  <span className="text-muted-foreground">{h.description || 'Holiday'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No holidays defined. The CPM engine will use standard working days.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}