import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getClosingRecord,
  openClosingRecord,
  getSubstantialCompletionCertificate,
  signSubstantialCompletion,
  listLienWaivers,
  requestLienWaiver,
  listCloseoutDocuments,
  uploadCloseoutDocument,
  getCloseoutReadiness,
  finalizeCloseout,
  type RequestLienWaiverPayload,
  type UploadCloseoutDocPayload,
} from './closeoutApi'

const keys = {
  record: (p: string) => ['closeout', 'record', p] as const,
  sc: (cr: string) => ['closeout', 'sc', cr] as const,
  waivers: (cr: string) => ['closeout', 'waivers', cr] as const,
  docs: (cr: string) => ['closeout', 'docs', cr] as const,
  readiness: (cr: string) => ['closeout', 'readiness', cr] as const,
}

export function useClosingRecord(project: string | undefined) {
  return useQuery({
    queryKey: keys.record(project ?? ''),
    queryFn: () => getClosingRecord(project!),
    enabled: !!project,
  })
}

export function useOpenClosingRecord(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => openClosingRecord(project),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.record(project) }),
  })
}

export function useSubstantialCompletion(closingRecord: string | undefined) {
  return useQuery({
    queryKey: keys.sc(closingRecord ?? ''),
    queryFn: () => getSubstantialCompletionCertificate(closingRecord!),
    enabled: !!closingRecord,
  })
}

export function useSignSubstantialCompletion(closingRecord: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (role: 'pm' | 'owner' | 'architect') => signSubstantialCompletion(closingRecord, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.sc(closingRecord) }),
  })
}

export function useLienWaivers(closingRecord: string | undefined) {
  return useQuery({
    queryKey: keys.waivers(closingRecord ?? ''),
    queryFn: () => listLienWaivers(closingRecord!),
    enabled: !!closingRecord,
  })
}

export function useRequestLienWaiver(closingRecord: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RequestLienWaiverPayload) => requestLienWaiver(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.waivers(closingRecord) }),
  })
}

export function useCloseoutDocuments(closingRecord: string | undefined) {
  return useQuery({
    queryKey: keys.docs(closingRecord ?? ''),
    queryFn: () => listCloseoutDocuments(closingRecord!),
    enabled: !!closingRecord,
  })
}

export function useUploadCloseoutDocument(closingRecord: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UploadCloseoutDocPayload) => uploadCloseoutDocument(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.docs(closingRecord) }),
  })
}

export function useCloseoutReadiness(closingRecord: string | undefined) {
  return useQuery({
    queryKey: keys.readiness(closingRecord ?? ''),
    queryFn: () => getCloseoutReadiness(closingRecord!),
    enabled: !!closingRecord,
  })
}

export function useFinalizeCloseout(project: string, closingRecord: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => finalizeCloseout(closingRecord),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.record(project) }),
  })
}
