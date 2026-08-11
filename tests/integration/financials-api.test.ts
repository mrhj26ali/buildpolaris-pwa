import { expect, test, describe, vi } from 'vitest';
import { getBudgetSummary, getCommitmentList, type CostCodeNode, type CommitmentNode } from '@/features/financials/api';

vi.mock('@/lib/clients/bffClient', () => ({ bffRequest: vi.fn() }));
import { bffRequest } from '@/lib/clients/bffClient';

describe('Financial Control API Client', () => {
  test('getBudgetSummary calls correct endpoint', async () => {
    const mockBudget = { cost_codes: [{ name: 'CC-001', code: '03 30 00', title: 'Concrete', original_budget: 150000, revised_budget: 150000, committed_amount: 120000, spent_to_date: 0, projected_final: 145000, variance: 5000 }] as CostCodeNode[], total_budget: 150000, total_committed: 120000, remaining: 30000 };
    vi.mocked(bffRequest).mockResolvedValue(mockBudget);
    const result = await getBudgetSummary('TEST-PROJ');
    
    expect(bffRequest).toHaveBeenCalledWith('/method/buildpolaris_bff.api.financial_control.get_budget_summary', expect.objectContaining({ method: 'POST', body: JSON.stringify({ project: 'TEST-PROJ' }) }));
    expect(result.total_budget).toBe(150000);
  });

  test('getCommitmentList calls correct endpoint', async () => {
    const mockCommitments: CommitmentNode[] = [{ name: 'COM-001', vendor: 'Steel Fabricators Inc', commitment_type: 'Subcontract', original_amount: 180000, approved_changes: 5000, revised_amount: 185000, retainage_percent: 10, status: 'Approved' }];
    vi.mocked(bffRequest).mockResolvedValue(mockCommitments);
    const result = await getCommitmentList('TEST-PROJ');
    
    expect(bffRequest).toHaveBeenCalledWith('/method/buildpolaris_bff.api.financial_control.get_commitment_list', expect.objectContaining({ method: 'POST', body: JSON.stringify({ project: 'TEST-PROJ' }) }));
    expect(result[0].revised_amount).toBe(185000);
  });
});
