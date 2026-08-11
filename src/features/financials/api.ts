// src/features/financials/api.ts
import { bffRequest } from '@/lib/clients/bffClient';

export interface CostCodeNode {
  name: string;
  code: string;
  title: string;
  original_budget: number;
  revised_budget: number;
  committed_amount: number;
  spent_to_date: number;
  projected_final: number;
  variance: number;
}

export interface CommitmentNode {
  name: string;
  vendor: string;
  commitment_type: 'Subcontract' | 'Purchase Order' | 'Other';
  original_amount: number;
  approved_changes: number;
  revised_amount: number;
  retainage_percent: number;
  status: 'Draft' | 'Approved' | 'Closed';
}

export interface ChangeEventNode {
  name: string;
  title: string;
  change_type: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  amount: number;
  linked_commitment: string | null;
  approved_by: string | null;
  approved_at: string | null;
}

export interface PayApplicationNode {
  name: string;
  commitment: string;
  application_number: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  period_start: string | null;
  period_end: string | null;
  total_completed: number;
  retainage_amount: number;
  net_due: number;
}

export interface FinancialDashboard {
  budget: {
    cost_codes: CostCodeNode[];
    total_budget: number;
    total_committed: number;
    remaining: number;
  };
  total_commitments: number;
  total_approved_changes: number;
  total_paid_to_date: number;
  open_change_events: number;
  open_pay_apps: number;
}

export async function getBudgetSummary(projectId: string): Promise<FinancialDashboard['budget']> {
  return bffRequest<FinancialDashboard['budget']>('/method/buildpolaris_bff.api.financial_control.get_budget_summary', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getCommitmentList(projectId: string): Promise<CommitmentNode[]> {
  return bffRequest<CommitmentNode[]>('/method/buildpolaris_bff.api.financial_control.get_commitment_list', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getChangeEventList(projectId: string): Promise<ChangeEventNode[]> {
  return bffRequest<ChangeEventNode[]>('/method/buildpolaris_bff.api.financial_control.get_change_event_list', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getPayApplicationList(projectId: string): Promise<PayApplicationNode[]> {
  return bffRequest<PayApplicationNode[]>('/method/buildpolaris_bff.api.financial_control.get_pay_application_list', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getFinancialDashboard(projectId: string): Promise<FinancialDashboard> {
  return bffRequest<FinancialDashboard>('/method/buildpolaris_bff.api.financial_control.get_financial_dashboard', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}




