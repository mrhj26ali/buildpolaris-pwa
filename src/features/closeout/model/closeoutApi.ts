import { bffRequest } from '@/lib/clients/bffClient'
import type {
  ClosingRecord,
  SubstantialCompletionCertificate,
  LienWaiver,
  CloseoutDocument,
  LienWaiverType,
  CloseoutDocCategory,
} from '@/types/domain'

export async function getClosingRecord(project: string): Promise<ClosingRecord | null> {
  return bffRequest<ClosingRecord | null>(
    `/method/buildpolaris_bff.closeout.api.get_closing_record?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}

export async function openClosingRecord(project: string): Promise<ClosingRecord> {
  return bffRequest<ClosingRecord>('/method/buildpolaris_bff.closeout.api.open_closing_record', {
    method: 'POST',
    body: JSON.stringify({ project }),
  })
}

export async function getSubstantialCompletionCertificate(
  closingRecord: string,
): Promise<SubstantialCompletionCertificate | null> {
  return bffRequest<SubstantialCompletionCertificate | null>(
    `/method/buildpolaris_bff.closeout.api.get_substantial_completion?closing_record=${encodeURIComponent(closingRecord)}`,
    { method: 'GET' },
  )
}

export async function signSubstantialCompletion(
  closingRecord: string,
  signoffRole: 'pm' | 'owner' | 'architect',
): Promise<SubstantialCompletionCertificate> {
  return bffRequest<SubstantialCompletionCertificate>(
    '/method/buildpolaris_bff.closeout.api.sign_substantial_completion',
    { method: 'POST', body: JSON.stringify({ closing_record: closingRecord, signoff_role: signoffRole }) },
  )
}

export async function listLienWaivers(closingRecord: string): Promise<LienWaiver[]> {
  return bffRequest<LienWaiver[]>(
    `/method/buildpolaris_bff.closeout.api.list_lien_waivers?closing_record=${encodeURIComponent(closingRecord)}`,
    { method: 'GET' },
  )
}

export interface RequestLienWaiverPayload {
  closing_record: string
  supplier: string
  type: LienWaiverType
  pay_application?: string
}

export async function requestLienWaiver(payload: RequestLienWaiverPayload): Promise<LienWaiver> {
  return bffRequest<LienWaiver>('/method/buildpolaris_bff.closeout.api.request_lien_waiver', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listCloseoutDocuments(closingRecord: string): Promise<CloseoutDocument[]> {
  return bffRequest<CloseoutDocument[]>(
    `/method/buildpolaris_bff.closeout.api.list_closeout_documents?closing_record=${encodeURIComponent(closingRecord)}`,
    { method: 'GET' },
  )
}

export interface UploadCloseoutDocPayload {
  closing_record: string
  category: CloseoutDocCategory
  file: File
}

export async function uploadCloseoutDocument(payload: UploadCloseoutDocPayload): Promise<CloseoutDocument> {
  const formData = new FormData()
  formData.append('closing_record', payload.closing_record)
  formData.append('category', payload.category)
  formData.append('file', payload.file)

  return bffRequest<CloseoutDocument>('/method/buildpolaris_bff.closeout.api.upload_closeout_document', {
    method: 'POST',
    body: formData,
  })
}

// FR-7.5: "the closeout gate is deliberately blocked until punch items are
// closed and final payment can issue" — this is the server-computed readiness
// check the UI surfaces before allowing finalization.
export interface CloseoutReadiness {
  all_punch_items_closed: boolean
  final_payment_issued: boolean
  substantial_completion_signed: boolean
  ready_to_finalize: boolean
}

export async function getCloseoutReadiness(closingRecord: string): Promise<CloseoutReadiness> {
  return bffRequest<CloseoutReadiness>(
    `/method/buildpolaris_bff.closeout.api.get_readiness?closing_record=${encodeURIComponent(closingRecord)}`,
    { method: 'GET' },
  )
}

export async function finalizeCloseout(closingRecord: string): Promise<ClosingRecord> {
  return bffRequest<ClosingRecord>('/method/buildpolaris_bff.closeout.api.finalize', {
    method: 'POST',
    body: JSON.stringify({ closing_record: closingRecord }),
  })
}
