import { useMemo } from 'react'
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core'
import type { TaskRecord } from './types'
import { useUpdateTaskStatus } from './hooks'

const statusColumns = ['Open', 'Working', 'Pending Review', 'Overdue', 'Completed', 'Cancelled']

interface KanbanViewProps {
  projectId: string
  tasks: TaskRecord[]
}

function TaskCard({ task }: { task: TaskRecord }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.name,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
      className={`rounded-lg border border-surface-border bg-surface-card p-3 shadow-sm transition ${isDragging ? 'opacity-80' : 'opacity-100'}`}
      {...listeners}
      {...attributes}
    >
      <div className="mb-2 text-sm font-semibold text-brand-900">{task.subject}</div>
      <div className="text-xs text-gray-600">Priority: {task.priority || 'N/A'}</div>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-500">
        <span>{task.exp_start_date || 'TBD'}</span>
        <span>{task.progress}%</span>
      </div>
    </div>
  )
}

function Column({ status, tasks }: { status: string; tasks: TaskRecord[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border p-4 transition ${isOver ? 'border-brand-500 bg-brand-50' : 'border-surface-border bg-white'}`}
      style={{ minHeight: 220 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-brand-900">{status}</h2>
        <span className="text-xs text-gray-500">{tasks.length}</span>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.name} task={task} />
        ))}
      </div>
    </div>
  )
}

export function KanbanView({ projectId, tasks }: KanbanViewProps) {
  const updateStatus = useUpdateTaskStatus(projectId)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const grouped = useMemo(
    () =>
      statusColumns.reduce<Record<string, TaskRecord[]>>((acc, status) => {
        acc[status] = tasks.filter((task) => task.status === status)
        return acc
      }, {}),
    [tasks]
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const targetStatus = statusColumns.find((status) => status === String(over.id))
    if (!targetStatus) return

    const taskName = String(active.id)
    void updateStatus.mutateAsync({ taskName, status: targetStatus })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid gap-4 lg:grid-cols-4">
        {statusColumns.map((status) => (
          <Column key={status} status={status} tasks={grouped[status]} />
        ))}
      </div>
      {updateStatus.isError && (
        <div className="mt-4 rounded-md border border-status-overdue/30 bg-status-overdue/10 p-3 text-sm text-status-overdue">
          Could not update task status. Drag again or refresh the page.
        </div>
      )}
    </DndContext>
  )
}
