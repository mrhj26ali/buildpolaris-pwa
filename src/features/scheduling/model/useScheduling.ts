import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listTasks,
  listDependencies,
  createTask,
  updateTaskDuration,
  createDependency,
  recomputeSchedule,
  captureBaseline,
  listBaselines,
  type CreateTaskPayload,
  type UpdateTaskDatesPayload,
  type CreateDependencyPayload,
} from './schedulingApi'

function taskKeys(project: string) {
  return ['scheduling', 'tasks', project] as const
}
function depKeys(project: string) {
  return ['scheduling', 'dependencies', project] as const
}
function baselineKeys(project: string) {
  return ['scheduling', 'baselines', project] as const
}

export function useTasks(project: string | undefined) {
  return useQuery({
    queryKey: taskKeys(project ?? ''),
    queryFn: () => listTasks(project!),
    enabled: !!project,
  })
}

export function useDependencies(project: string | undefined) {
  return useQuery({
    queryKey: depKeys(project ?? ''),
    queryFn: () => listDependencies(project!),
    enabled: !!project,
  })
}

export function useBaselines(project: string | undefined) {
  return useQuery({
    queryKey: baselineKeys(project ?? ''),
    queryFn: () => listBaselines(project!),
    enabled: !!project,
  })
}

export function useCreateTask(project: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys(project) }),
  })
}

export function useUpdateTaskDuration(project: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateTaskDatesPayload) => updateTaskDuration(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys(project) }),
  })
}

export function useCreateDependency(project: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDependencyPayload) => createDependency(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: depKeys(project) })
      void queryClient.invalidateQueries({ queryKey: taskKeys(project) })
    },
  })
}

export function useRecomputeSchedule(project: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => recomputeSchedule(project),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys(project) }),
  })
}

export function useCaptureBaseline(project: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (label: string) => captureBaseline(project, label),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: baselineKeys(project) }),
  })
}
