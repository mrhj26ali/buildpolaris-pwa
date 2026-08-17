import { bffRequest } from '@/lib/clients/bffClient'
import type { TaskRecord, TaskDependency, ScheduleBaseline } from '@/types/domain'

export async function listTasks(project: string): Promise<TaskRecord[]> {
  return bffRequest<TaskRecord[]>(
    `/method/buildpolaris_bff.scheduling.api.list_tasks?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}

export async function listDependencies(project: string): Promise<TaskDependency[]> {
  return bffRequest<TaskDependency[]>(
    `/method/buildpolaris_bff.scheduling.api.list_dependencies?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}

export interface CreateTaskPayload {
  project: string
  subject: string
  duration: number
  depends_on?: string
}

export async function createTask(payload: CreateTaskPayload): Promise<TaskRecord> {
  return bffRequest<TaskRecord>('/method/buildpolaris_bff.scheduling.api.create_task', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface UpdateTaskDatesPayload {
  task: string
  duration?: number
}

export async function updateTaskDuration(payload: UpdateTaskDatesPayload): Promise<TaskRecord> {
  return bffRequest<TaskRecord>('/method/buildpolaris_bff.scheduling.api.update_task', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface CreateDependencyPayload {
  project: string
  predecessor: string
  successor: string
  type: TaskDependency['type']
  lag_days: number
}

export async function createDependency(payload: CreateDependencyPayload): Promise<TaskDependency> {
  return bffRequest<TaskDependency>('/method/buildpolaris_bff.scheduling.api.create_dependency', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// UC-2.4: server-authoritative CPM recompute — this is the source of truth;
// the worker-based client mirror (lib/cpm/) is only for instant what-if
// feedback before this call resolves (FR-2.3).
export async function recomputeSchedule(project: string): Promise<TaskRecord[]> {
  return bffRequest<TaskRecord[]>('/method/buildpolaris_bff.scheduling.api.recompute_schedule', {
    method: 'POST',
    body: JSON.stringify({ project }),
  })
}

export async function captureBaseline(project: string, label: string): Promise<ScheduleBaseline> {
  return bffRequest<ScheduleBaseline>('/method/buildpolaris_bff.scheduling.api.create_baseline', {
    method: 'POST',
    body: JSON.stringify({ project, label }),
  })
}

export async function listBaselines(project: string): Promise<ScheduleBaseline[]> {
  return bffRequest<ScheduleBaseline[]>(
    `/method/buildpolaris_bff.scheduling.api.list_baselines?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}