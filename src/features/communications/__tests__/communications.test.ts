// src/features/communications/__tests__/communications.test.ts
import { expect, test, describe, vi } from 'vitest';
import { getRfiList, type RFINode } from '../api';

// Mock the bffClient module before importing it
vi.mock('@/lib/bffClient', () => ({
  bffRequest: vi.fn(),
}));

import { bffRequest } from '@/lib/bffClient';

describe('Communications API Client', () => {
  test('getRfiList calls correct endpoint', async () => {
    const mockRfis: RFINode[] = [
      {
        name: 'RFI-001',
        rfi_number: 'RFI-PROJ-0001',
        subject: 'Test RFI',
        status: 'Open',
        raised_by: 'user@example.com',
        assigned_to: 'pm@example.com',
        requested_reply_date: '2026-08-15',
        cost_impact: 0,
        schedule_impact: 1,
      },
    ];

    vi.mocked(bffRequest).mockResolvedValue(mockRfis);

    const result = await getRfiList('TEST-PROJ');
    
    expect(bffRequest).toHaveBeenCalledWith(
      '/method/buildpolaris_bff.api.communications.get_rfi_list',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ project: 'TEST-PROJ' }),
      })
    );
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('Open');
  });
});