import { expect, test, describe, vi } from 'vitest';
import { getDailyLogList, getPunchList, type DailyLogNode, type PunchItemNode } from '@/features/field/api';

vi.mock('@/lib/clients/bffClient', () => ({ bffRequest: vi.fn() }));
import { bffRequest } from '@/lib/clients/bffClient';

describe('Field Execution API Client', () => {
  test('getDailyLogList calls correct endpoint', async () => {
    const mockLogs: DailyLogNode[] = [{ name: 'DL-001', log_date: '2026-08-08', status: 'Submitted', weather_conditions: 'Sunny', workforce_count: 12, submitted_by: 'admin@example.com' }];
    vi.mocked(bffRequest).mockResolvedValue(mockLogs);
    const result = await getDailyLogList('TEST-PROJ');
    
    expect(bffRequest).toHaveBeenCalledWith('/method/buildpolaris_bff.api.field_execution.get_daily_log_list', expect.objectContaining({ method: 'POST', body: JSON.stringify({ project: 'TEST-PROJ' }) }));
    expect(result[0].status).toBe('Submitted');
  });

  test('getPunchList calls correct endpoint', async () => {
    const mockItems: PunchItemNode[] = [{ name: 'PUNCH-001', title: 'Fix cracked tile', location: 'Lobby', assigned_to: null, priority: 'High', status: 'Open', due_date: '2026-08-15', closed_at: null }];
    vi.mocked(bffRequest).mockResolvedValue(mockItems);
    const result = await getPunchList('TEST-PROJ');
    
    expect(bffRequest).toHaveBeenCalledWith('/method/buildpolaris_bff.api.field_execution.get_punch_list', expect.objectContaining({ method: 'POST', body: JSON.stringify({ project: 'TEST-PROJ' }) }));
    expect(result[0].priority).toBe('High');
  });
});
