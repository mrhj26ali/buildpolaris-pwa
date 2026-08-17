import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { SubmittalLineStatus } from '@/types/domain'
import {
  listRfis,
  createRfi,
  respondToRfi,
  closeRfi,
  listSubmittals,
  createSubmittal,
  reviewSubmittalLine,
  listTransmittals,
  listMeetingSeries,
  listMeetingMinutes,
  listActionItems,
  completeActionItem,
  type CreateRfiPayload,
  type CreateSubmittalPayload,
} from './communicationsApi'

const keys = {
  rfis: (p: string) => ['communications', 'rfis', p] as const,
  submittals: (p: string) => ['communications', 'submittals', p] as const,
  transmittals: (p: string) => ['communications', 'transmittals', p] as const,
  meetingSeries: (p: string) => ['communications', 'meeting-series', p] as const,
  meetingMinutes: (s: string) => ['communications', 'meeting-minutes', s] as const,
  actionItems: (p: string) => ['communications', 'action-items', p] as const,
}

export function useRfis(project: string | undefined) {
  return useQuery({ queryKey: keys.rfis(project ?? ''), queryFn: () => listRfis(project!), enabled: !!project })
}

export function useCreateRfi(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRfiPayload) => createRfi(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.rfis(project) }),
  })
}

export function useRespondToRfi(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, response }: { name: string; response: string }) => respondToRfi(name, response),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.rfis(project) }),
  })
}

export function useCloseRfi(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => closeRfi(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.rfis(project) }),
  })
}

export function useSubmittals(project: string | undefined) {
  return useQuery({
    queryKey: keys.submittals(project ?? ''),
    queryFn: () => listSubmittals(project!),
    enabled: !!project,
  })
}

export function useCreateSubmittal(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSubmittalPayload) => createSubmittal(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.submittals(project) }),
  })
}

export function useReviewSubmittalLine(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ submittal, line, status }: { submittal: string; line: string; status: SubmittalLineStatus }) =>
      reviewSubmittalLine(submittal, line, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.submittals(project) }),
  })
}

export function useTransmittals(project: string | undefined) {
  return useQuery({
    queryKey: keys.transmittals(project ?? ''),
    queryFn: () => listTransmittals(project!),
    enabled: !!project,
  })
}

export function useMeetingSeries(project: string | undefined) {
  return useQuery({
    queryKey: keys.meetingSeries(project ?? ''),
    queryFn: () => listMeetingSeries(project!),
    enabled: !!project,
  })
}

export function useMeetingMinutes(series: string | undefined) {
  return useQuery({
    queryKey: keys.meetingMinutes(series ?? ''),
    queryFn: () => listMeetingMinutes(series!),
    enabled: !!series,
  })
}

export function useActionItems(project: string | undefined) {
  return useQuery({
    queryKey: keys.actionItems(project ?? ''),
    queryFn: () => listActionItems(project!),
    enabled: !!project,
  })
}

export function useCompleteActionItem(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => completeActionItem(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.actionItems(project) }),
  })
}