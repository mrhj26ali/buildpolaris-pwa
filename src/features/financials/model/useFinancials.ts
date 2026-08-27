import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listCostCodes,
  listCommitments,
  createCommitment,
  approveCommitment,
  listChangeEvents,
  createChangeEvent,
  approveChangeEvent,
  listPayApplications,
  submitPayApplication,
  approvePayApplication,
  getEvmSnapshot,
  createCostCode,
  createPayApplication,
  type CreateCommitmentPayload,
  type CreateChangeEventPayload,
  type CreateCostCodePayload,
  type CreatePayApplicationPayload,
} from './financialsApi'

const keys = {
  costCodes: (p: string) => ['financials', 'cost-codes', p] as const,
  commitments: (p: string) => ['financials', 'commitments', p] as const,
  changeEvents: (p: string) => ['financials', 'change-events', p] as const,
  payApps: (p: string) => ['financials', 'pay-apps', p] as const,
  evm: (p: string) => ['financials', 'evm', p] as const,
}

// Helper to invalidate both the specific list AND the global project summary
const invalidateAll = (qc: any, project: string, listKey: readonly any[]) => {
  qc.invalidateQueries({ queryKey: listKey })
  qc.invalidateQueries({ queryKey: ['projects', 'summary', project] })
}

export function useCostCodes(project: string | undefined) {
  return useQuery({ queryKey: keys.costCodes(project ?? ''), queryFn: () => listCostCodes(project!), enabled: !!project })
}

export function useCommitments(project: string | undefined) {
  return useQuery({
    queryKey: keys.commitments(project ?? ''),
    queryFn: () => listCommitments(project!),
    enabled: !!project,
  })
}

export function useCreateCommitment(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCommitmentPayload) => createCommitment(payload),
    onSuccess: () => invalidateAll(qc, project, keys.commitments(project)),
  })
}

export function useApproveCommitment(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => approveCommitment(name),
    onSuccess: () => invalidateAll(qc, project, keys.commitments(project)),
  })
}

export function useChangeEvents(project: string | undefined) {
  return useQuery({
    queryKey: keys.changeEvents(project ?? ''),
    queryFn: () => listChangeEvents(project!),
    enabled: !!project,
  })
}

export function useCreateChangeEvent(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateChangeEventPayload) => createChangeEvent(payload),
    onSuccess: () => invalidateAll(qc, project, keys.changeEvents(project)),
  })
}

export function useApproveChangeEvent(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => approveChangeEvent(name),
    onSuccess: () => {
      invalidateAll(qc, project, keys.changeEvents(project))
      // Also invalidate commitments as approving a change event may affect commitment amounts
      qc.invalidateQueries({ queryKey: keys.commitments(project) })
    },
  })
}

export function usePayApplications(project: string | undefined) {
  return useQuery({
    queryKey: keys.payApps(project ?? ''),
    queryFn: () => listPayApplications(project!),
    enabled: !!project,
  })
}

export function useSubmitPayApplication(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => submitPayApplication(name),
    onSuccess: () => invalidateAll(qc, project, keys.payApps(project)),
  })
}

export function useApprovePayApplication(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => approvePayApplication(name),
    onSuccess: () => invalidateAll(qc, project, keys.payApps(project)),
  })
}

export function useEvmSnapshot(project: string | undefined) {
  return useQuery({ queryKey: keys.evm(project ?? ''), queryFn: () => getEvmSnapshot(project!), enabled: !!project })
}

export function useCreateCostCode(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCostCodePayload) => createCostCode(payload),
    onSuccess: () => invalidateAll(qc, project, keys.costCodes(project)),
  })
}

export function useCreatePayApplication(project: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePayApplicationPayload) => createPayApplication(payload),
    onSuccess: () => invalidateAll(qc, project, keys.payApps(project)),
  })
}