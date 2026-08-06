import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listPunchListItems, createPunchListItem } from './api'
import type { CreatePunchListItemPayload, PunchListItemRecord } from './types'

export function usePunchListItems(projectId?: string) {
  return useQuery<PunchListItemRecord[]>({
    queryKey: ['punchListItems', projectId ?? 'all'],
    queryFn: () => listPunchListItems(projectId),
  })
}

export function useCreatePunchListItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePunchListItemPayload) => createPunchListItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['punchListItems'] })
    },
  })
}