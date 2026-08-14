import { bffRequest } from '@/lib/clients/bffClient';

// ============================================================
// Types
// ============================================================

export interface FinancialCostCode {
  name: string;
  code?: string;
  label?: string;
  description?: string;
}

export interface FinancialCommitment {
  name: string;
  cost_code?: string;
  supplier?: string;
  amount?: number;
  date?: string;
  description?: string;
  status?: string;
  commitment_type?: string;
  linked_purchase_order?: string;
}

export interface FinancialChangeEvent {
  name: string;
  cost_code?: string;
  amount?: number;
  description?: string;
  status?: string;
  title?: string;
}

export interface FinancialPayApplication {
  name: string;
  commitment?: string;
  period_start?: string;
  period_end?: string;
  amount?: number;
  status?: string;
  linked_purchase_invoice?: string;
  linked_payment_entry?: string;
}

export interface FinancialBudgetSummary {
  project: string;
  cost_codes: FinancialCostCode[];
  total_committed: number;
  total_change_events: number;
  approved_change_events: number;
  total_pay_applications: number;
  projected_total: number;
  commitment_count?: number;
  change_event_count?: number;
  pay_application_count?: number;
}

export interface EvmSummary {
  project: string;
  bac: number;
  pv: number;
  ev: number;
  ac: number;
  cpi: number;
  spi: number;
  status: 'on_track' | 'at_risk';
}

export interface SupplierInfo {
  name: string;
  supplier_name: string;
  supplier_group?: string;
}

const BASE = '/method/buildpolaris_bff.api.financial_control';

// ============================================================
// Read Endpoints
// ============================================================

export async function getCommitmentList(project: string) {
  return bffRequest<FinancialCommitment[]>(`${BASE}.get_commitment_list`, {
    method: 'POST',
    body: JSON.stringify({ project }),
  });
}

export async function getChangeEventList(project: string) {
  return bffRequest<FinancialChangeEvent[]>(`${BASE}.get_change_event_list`, {
    method: 'POST',
    body: JSON.stringify({ project }),
  });
}

export async function getPayApplicationList(project: string) {
  return bffRequest<FinancialPayApplication[]>(`${BASE}.get_pay_application_list`, {
    method: 'POST',
    body: JSON.stringify({ project }),
  });
}

export async function getFinancialDashboard(project: string) {
  return bffRequest<FinancialBudgetSummary>(`${BASE}.get_financial_dashboard`, {
    method: 'POST',
    body: JSON.stringify({ project }),
  });
}

export async function getEvmSummary(project: string) {
  return bffRequest<EvmSummary>(`${BASE}.get_evm_summary`, {
    method: 'POST',
    body: JSON.stringify({ project }),
  });
}

export async function getSupplierList() {
  return bffRequest<SupplierInfo[]>(`${BASE}.get_supplier_list`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

// ============================================================
// Mutation Endpoints — Commitments
// ============================================================

export async function createCommitment(payload: {
  project: string;
  cost_code: string;
  amount: number;
  supplier: string;
  commitment_type?: string;
  date?: string;
  description?: string;
  title?: string;
}) {
  return bffRequest<{ name: string }>(`${BASE}.create_commitment`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function approveCommitment(commitmentId: string) {
  return bffRequest<{ status: string; linked_purchase_order?: string }>(`${BASE}.approve_commitment`, {
    method: 'POST',
    body: JSON.stringify({ commitment_id: commitmentId }),
  });
}

// ============================================================
// Mutation Endpoints — Change Events
// ============================================================

export async function createChangeEvent(payload: {
  project: string;
  cost_code: string;
  amount: number;
  description?: string;
  status?: string;
  title?: string;
}) {
  return bffRequest<{ name: string }>(`${BASE}.create_change_event`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function approveChangeEvent(changeEventId: string) {
  return bffRequest<{ status: string }>(`${BASE}.approve_change_event`, {
    method: 'POST',
    body: JSON.stringify({ change_event_id: changeEventId }),
  });
}

// ============================================================
// Mutation Endpoints — Pay Applications
// ============================================================

export async function createPayApplication(payload: {
  project: string;
  commitment: string;
  period_start?: string;
  period_end?: string;
  status?: string;
  title?: string;
  lines: { cost_code?: string; amount: number; description?: string }[];
}) {
  return bffRequest<{ name: string; total: number }>(`${BASE}.create_pay_application`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function approvePayApplication(payApplicationId: string, retainagePct: number = 10.0) {
  return bffRequest<{ status: string; linked_purchase_invoice?: string }>(`${BASE}.approve_pay_application`, {
    method: 'POST',
    body: JSON.stringify({ pay_application_id: payApplicationId, retainage_pct: retainagePct }),
  });
}

export async function recordPayment(payApplicationId: string) {
  return bffRequest<{ status: string; linked_payment_entry?: string }>(`${BASE}.record_payment`, {
    method: 'POST',
    body: JSON.stringify({ pay_application_id: payApplicationId }),
  });
}
