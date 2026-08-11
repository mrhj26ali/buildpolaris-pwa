// src/features/closeout/api.ts
import { bffRequest } from '@/lib/clients/bffClient';

export interface CloseoutStatus {
  initiated: boolean;
  closing_record?: string;
  status?: 'Initiated' | 'SubstantialComplete' | 'DocsCollection' | 'FinalComplete';
  punch_gate_cleared?: boolean;
  project_has_payment_bond?: boolean;
  certificate?: {
    name: string;
    status: 'PendingSignature' | 'Signed';
    substantial_completion_date: string | null;
    warranty_start_date: string | null;
    owner_signed: boolean;
    architect_signed: boolean;
  } | null;
  warranties_count?: number;
  om_manuals_count?: number;
  affidavits_count?: number;
  final_waivers_count?: number;
  surety_consents_count?: number;
}

export interface WarrantyNode {
  name: string;
  supplier: string;
  system_scope: string | null;
  warranty_start_date: string | null;
  warranty_term_months: number;
  status: 'Pending' | 'Submitted' | 'Verified';
}

export interface OMManualNode {
  name: string;
  supplier: string;
  asset_reference: string | null;
  status: 'Pending' | 'Submitted' | 'Verified';
}

export interface AffidavitNode {
  name: string;
  supplier: string;
  all_debts_satisfied: number;
  sworn_at: string | null;
}

export interface LienWaiverNode {
  name: string;
  supplier: string;
  waiver_type: 'Conditional' | 'Unconditional';
  is_final: number;
  submitted_at: string | null;
}

export async function getCloseoutStatus(projectId: string): Promise<CloseoutStatus> {
  return bffRequest<CloseoutStatus>('/method/buildpolaris_bff.api.project_closeout.get_closeout_status', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getWarrantyDocuments(projectId: string): Promise<WarrantyNode[]> {
  return bffRequest<WarrantyNode[]>('/method/buildpolaris_bff.api.project_closeout.get_warranty_documents', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getOMManuals(projectId: string): Promise<OMManualNode[]> {
  return bffRequest<OMManualNode[]>('/method/buildpolaris_bff.api.project_closeout.get_om_manuals', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getAffidavits(projectId: string): Promise<AffidavitNode[]> {
  return bffRequest<AffidavitNode[]>('/method/buildpolaris_bff.api.project_closeout.get_affidavits', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getLienWaivers(projectId: string): Promise<LienWaiverNode[]> {
  return bffRequest<LienWaiverNode[]>('/method/buildpolaris_bff.api.project_closeout.get_lien_waivers', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function initiateCloseout(projectId: string, hasPaymentBond: boolean = false): Promise<string> {
  return bffRequest<string>('/method/buildpolaris_bff.application.closeout_service.initiate_closeout', {
    method: 'POST',
    body: JSON.stringify({ project: projectId, project_has_payment_bond: hasPaymentBond ? 1 : 0 }),
  });
}

export async function issueSubstantialCompletion(projectId: string, completionDate: string, terms?: string): Promise<string> {
  return bffRequest<string>('/method/buildpolaris_bff.application.closeout_service.issue_substantial_completion', {
    method: 'POST',
    body: JSON.stringify({ project: projectId, substantial_completion_date: completionDate, responsibility_terms: terms }),
  });
}

export async function signSubstantialCompletion(certificateId: string, signerRole: 'Owner' | 'Architect'): Promise<void> {
  await bffRequest('/method/buildpolaris_bff.application.closeout_service.sign_substantial_completion', {
    method: 'POST',
    body: JSON.stringify({ certificate_id: certificateId, signer_role: signerRole }),
  });
}

export async function checkFinalCompletionGate(projectId: string): Promise<{
  cleared: boolean;
  open_count: number;
  blockers: Array<{ name: string; title: string; priority: string; status: string }>;
}> {
  return bffRequest('/method/buildpolaris_bff.application.closeout_service.check_final_completion_gate', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function releaseFinalRetainage(projectId: string): Promise<{ status: string }> {
  return bffRequest<{ status: string }>('/method/buildpolaris_bff.application.closeout_service.release_final_retainage', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}




