import { expect, test, describe } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../setup';
import { getRfiList, type RFINode } from '@/features/communications/api';

describe('Communications API Integration', () => {
  test('getRfiList successfully unwraps Frappe response and returns typed data', async () => {
    // 1. Arrange: Mock the BFF endpoint using MSW
    const mockRfis: RFINode[] = [{
      name: 'RFI-001', rfi_number: 'RFI-PROJ-0001', subject: 'Test RFI',
      status: 'Open', raised_by: 'user@example.com', assigned_to: 'pm@example.com',
      requested_reply_date: '2026-08-15', cost_impact: 0, schedule_impact: 1,
    }];

    server.use(
      http.post('/api/method/buildpolaris_bff.api.communications.get_rfi_list', async ({ request }) => {
        const body = await request.json() as { project: string };
        expect(body.project).toBe('TEST-PROJ');
        
        // Simulate Frappe's standard {"message": ...} envelope
        return HttpResponse.json({ message: mockRfis });
      })
    );

    // 2. Act: Call the actual API client function
    const result = await getRfiList('TEST-PROJ');

    // 3. Assert: Verify the bffClient correctly unwrapped the envelope and returned typed data
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('Open');
    expect(result[0].rfi_number).toBe('RFI-PROJ-0001');
  });
});