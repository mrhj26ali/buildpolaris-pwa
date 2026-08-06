import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listDailyLogs, createDailyLog } from './api'
import type { CreateDailyLogPayload, DailyLogRecord } from './types'

export function useDailyLogs(projectId?: string) {
  return useQuery<DailyLogRecord[]>({
    queryKey: ['dailyLogs', projectId ?? 'all'],
    queryFn: () => listDailyLogs(projectId),
  })
}

export function useCreateDailyLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDailyLogPayload) => createDailyLog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLogs'] })
    },
  })
}