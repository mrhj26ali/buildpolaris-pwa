import { bffRequest } from '@/lib/bffClient';

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
}

export interface FinancialChangeEvent {
  name: string;
  cost_code?: string;
  amount?: number;
  description?: string;
  status?: string;
}

export interface FinancialPayApplication {
  name: string;
  commitment?: string;
  period_start?: string;
  period_end?: string;
  amount?: number;
  status?: string;
}

export interface FinancialBudgetSummary {
  project: string;
  cost_codes: FinancialCostCode[];
  total_committed: number;
  total_change_events: number;
  approved_change_events: number;
  total_pay_applications: number;
  projected_total: number;
}

export async function getBudgetSummary(project: string) {
  return bffRequest<FinancialBudgetSummary>('/method/buildpolaris_bff.api.financials.get_budget_summary', {
    method: 'POST',
    body: JSON.stringify({ project }),
  });
}

export async function listCostCodes(project: string) {
  return bffRequest<FinancialCostCode[]>('/method/buildpolaris_bff.api.financials.list_cost_codes', {
    method: 'POST',
    body: JSON.stringify({ project }),
  });
}

export async function createCostCode(project: string, code: string, label?: string, description?: string) {
  return bffRequest<{ name: string }>('/method/buildpolaris_bff.api.financials.create_cost_code', {
    method: 'POST',
    body: JSON.stringify({ project, code, label, description }),
  });
}

export async function listCommitments(project: string) {
  return bffRequest<FinancialCommitment[]>('/method/buildpolaris_bff.api.financials.list_commitments', {
    method: 'POST',
    body: JSON.stringify({ project }),
  });
}

export async function createCommitment(payload: {
  project: string;
  cost_code: string;
  amount: number;
  supplier?: string;
  date?: string;
  description?: string;
  status?: string;
  title?: string;
}) {
  return bffRequest<{ name: string }>('/method/buildpolaris_bff.api.financials.create_commitment', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listChangeEvents(project: string) {
  return bffRequest<FinancialChangeEvent[]>('/method/buildpolaris_bff.api.financials.list_change_events', {
    method: 'POST',
    body: JSON.stringify({ project }),
  });
}

export async function createChangeEvent(payload: {
  project: string;
  cost_code: string;
  amount: number;
  description?: string;
  status?: string;
  title?: string;
}) {
  return bffRequest<{ name: string }>('/method/buildpolaris_bff.api.financials.create_change_event', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listPayApplications(project: string) {
  return bffRequest<FinancialPayApplication[]>('/method/buildpolaris_bff.api.financials.list_pay_applications', {
    method: 'POST',
    body: JSON.stringify({ project }),
  });
}

export async function createPayApplication(payload: {
  project: string;
  commitment: string;
  period_start?: string;
  period_end?: string;
  status?: string;
  title?: string;
  lines: { cost_code?: string; amount: number; description?: string }[];
}) {
  return bffRequest<{ name: string; total: number }>('/method/buildpolaris_bff.api.financials.create_pay_application', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
