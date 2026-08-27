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
  issueTransmittal,
  searchCommunications,
  type CreateRfiPayload,
  type CreateSubmittalPayload,
  type IssueTransmittalPayload,
  type UnifiedSearchResult,
} from './communicationsApi'

const keys = {
  rfis: (p: string) => ['communications', 'rfis', p] as const,
  submittals: (p: string) => ['communications', 'submittals', p] as const,
  transmittals: (p: string) => ['communications', 'transmittals', p] as const,
  meetingSeries: (p: string) => ['communications', 'meeting-series', p] as const,
  meetingMinutes: (s: string) => ['communications', 'meeting-minutes', s] as const,
  actionItems: (p: string) => ['communications', 'action-items', p] as const,
}

// Helper to invalidate both the specific list AND the global project summary
const invalidateAll = (qc: any, project: string, listKey: readonly any[]) => {
  qc.invalidateQueries({ queryKey: listKey })
  qc.invalidateQueries({ queryKey: ['projects', 'summary', project] })
}

export function useRfis(project: string | undefined) {
  return useQuery({ queryKey: keys.rfis(project ?? ''), queryFn: () => listRfis(project!), enabled: !!project })
}

export function useCreateRfi(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRfiPayload) => createRfi(payload),
    onSuccess: () => invalidateAll(qc, project, keys.rfis(project)),
  })
}

export function useRespondToRfi(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, response }: { name: string; response: string }) => respondToRfi(name, response),
    onSuccess: () => invalidateAll(qc, project, keys.rfis(project)),
  })
}

export function useCloseRfi(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => closeRfi(name),
    onSuccess: () => invalidateAll(qc, project, keys.rfis(project)),
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
    onSuccess: () => invalidateAll(qc, project, keys.submittals(project)),
  })
}

export function useReviewSubmittalLine(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ submittal, line, status }: { submittal: string; line: string; status: SubmittalLineStatus }) =>
      reviewSubmittalLine(submittal, line, status),
    onSuccess: () => invalidateAll(qc, project, keys.submittals(project)),
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
    onSuccess: () => invalidateAll(qc, project, keys.actionItems(project)),
  })
}

export function useIssueTransmittal(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: IssueTransmittalPayload) => issueTransmittal(payload),
    onSuccess: () => invalidateAll(qc, project, keys.transmittals(project)),
  })
}

export function useUnifiedSearch(project: string | undefined, status?: string, assignee?: string) {
  return useQuery<UnifiedSearchResult>({
    queryKey: ['communications', 'unified-search', project, status, assignee],
    queryFn: () => searchCommunications(project!, status, assignee),
    enabled: !!project,
  })
}