import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listProjectRequests, createProjectRequest } from './api'
import type { CreateProjectRequestPayload, ProjectRequestRecord } from './types'

export function useProjectRequests(projectId?: string) {
  return useQuery<ProjectRequestRecord[]>({
    queryKey: ['projectRequests', projectId ?? 'all'],
    queryFn: () => listProjectRequests(projectId),
  })
}

export function useCreateProjectRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProjectRequestPayload) => createProjectRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectRequests'] })
    },
  })
}