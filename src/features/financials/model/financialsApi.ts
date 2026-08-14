import { bffRequest } from '@/lib/clients/bffClient'
import type {
  CostCode,
  Commitment,
  ChangeEvent,
  PayApplication,
  EvmSnapshot,
  CommitmentType,
  ChangeEventCategory,
} from '@/types/domain'

export async function listCostCodes(project: string): Promise<CostCode[]> {
  return bffRequest<CostCode[]>(
    `/method/buildpolaris_bff.financials.api.list_cost_codes?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}

export async function listCommitments(project: string): Promise<Commitment[]> {
  return bffRequest<Commitment[]>(
    `/method/buildpolaris_bff.financials.api.list_commitments?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}

export interface CreateCommitmentPayload {
  project: string
  cost_code: string
  supplier: string
  type: CommitmentType
  original_amount: number
}

export async function createCommitment(payload: CreateCommitmentPayload): Promise<Commitment> {
  return bffRequest<Commitment>('/method/buildpolaris_bff.financials.api.create_commitment', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function approveCommitment(name: string): Promise<Commitment> {
  return bffRequest<Commitment>('/method/buildpolaris_bff.financials.api.approve_commitment', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function listChangeEvents(project: string): Promise<ChangeEvent[]> {
  return bffRequest<ChangeEvent[]>(
    `/method/buildpolaris_bff.financials.api.list_change_events?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}

export interface CreateChangeEventPayload {
  project: string
  commitment: string
  category: ChangeEventCategory
  outcome_reason: string
  amount_delta: number
  originating_rfi?: string
}

export async function createChangeEvent(payload: CreateChangeEventPayload): Promise<ChangeEvent> {
  return bffRequest<ChangeEvent>('/method/buildpolaris_bff.financials.api.create_change_event', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function approveChangeEvent(name: string): Promise<ChangeEvent> {
  return bffRequest<ChangeEvent>('/method/buildpolaris_bff.financials.api.approve_change_event', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function listPayApplications(project: string): Promise<PayApplication[]> {
  return bffRequest<PayApplication[]>(
    `/method/buildpolaris_bff.financials.api.list_pay_applications?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}

export async function submitPayApplication(name: string): Promise<PayApplication> {
  return bffRequest<PayApplication>('/method/buildpolaris_bff.financials.api.submit_pay_application', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function approvePayApplication(name: string): Promise<PayApplication> {
  return bffRequest<PayApplication>('/method/buildpolaris_bff.financials.api.approve_pay_application', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function getEvmSnapshot(project: string): Promise<EvmSnapshot> {
  return bffRequest<EvmSnapshot>(
    `/method/buildpolaris_bff.financials.api.get_evm_snapshot?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}
