import { expect, test, describe, vi } from 'vitest';
import { getCloseoutStatus, getWarrantyDocuments, type CloseoutStatus, type WarrantyNode } from '@/features/closeout/api';

vi.mock('@/lib/bffClient', () => ({
  bffRequest: vi.fn(),
}));

import { bffRequest } from '@/lib/bffClient';

describe('Project Closeout API Client', () => {
  test('getCloseoutStatus calls correct endpoint', async () => {
    const mockStatus: CloseoutStatus = {
      initiated: true, closing_record: 'CLOSE-001', status: 'SubstantialComplete',
      punch_gate_cleared: false, project_has_payment_bond: false,
      certificate: { name: 'SCC-001', status: 'PendingSignature', substantial_completion_date: '2026-08-15', warranty_start_date: '2026-08-15', owner_signed: true, architect_signed: false },
      warranties_count: 3, om_manuals_count: 2, affidavits_count: 1, final_waivers_count: 1, surety_consents_count: 0,
    };
    vi.mocked(bffRequest).mockResolvedValue(mockStatus);
    const result = await getCloseoutStatus('TEST-PROJ');
    
    expect(bffRequest).toHaveBeenCalledWith('/method/buildpolaris_bff.api.project_closeout.get_closeout_status', expect.objectContaining({ method: 'POST', body: JSON.stringify({ project: 'TEST-PROJ' }) }));
    expect(result.initiated).toBe(true);
    expect(result.status).toBe('SubstantialComplete');
  });

  test('getWarrantyDocuments calls correct endpoint', async () => {
    const mockWarranties: WarrantyNode[] = [{ name: 'WARR-001', supplier: 'HVAC Corp', system_scope: 'HVAC System', warranty_start_date: '2026-08-15', warranty_term_months: 24, status: 'Submitted' }];
    vi.mocked(bffRequest).mockResolvedValue(mockWarranties);
    const result = await getWarrantyDocuments('TEST-PROJ');
    
    expect(bffRequest).toHaveBeenCalledWith('/method/buildpolaris_bff.api.project_closeout.get_warranty_documents', expect.objectContaining({ method: 'POST', body: JSON.stringify({ project: 'TEST-PROJ' }) }));
    expect(result).toHaveLength(1);
  });
});