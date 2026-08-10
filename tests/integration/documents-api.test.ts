import { expect, test, describe, vi } from 'vitest';
import { getDrawingRegister, getPublishedDrawings, type DrawingNode } from '@/features/documents/api';

vi.mock('@/lib/bffClient', () => ({ bffRequest: vi.fn() }));
import { bffRequest } from '@/lib/bffClient';

describe('Document Control API Client', () => {
  test('getDrawingRegister calls correct endpoint', async () => {
    const mockDrawings: DrawingNode[] = [{ name: 'DWG-001', sheet_number: 'A-101', discipline: 'Architectural', title: 'First Floor Plan', classification_code: '03 30 00', current_revision: 'REV-00001', revision_count: 2 }];
    vi.mocked(bffRequest).mockResolvedValue(mockDrawings);
    const result = await getDrawingRegister('TEST-PROJ');
    
    expect(bffRequest).toHaveBeenCalledWith('/method/buildpolaris_bff.api.document_control.get_drawing_register', expect.objectContaining({ method: 'POST', body: JSON.stringify({ project: 'TEST-PROJ' }) }));
    expect(result[0].sheet_number).toBe('A-101');
  });

  test('getPublishedDrawings calls correct endpoint for IFC set', async () => {
    const mockPublished: DrawingNode[] = [{ name: 'DWG-001', sheet_number: 'A-101', discipline: 'Architectural', title: 'First Floor Plan', classification_code: null, current_revision: 'REV-00001', revision_count: 1 }];
    vi.mocked(bffRequest).mockResolvedValue(mockPublished);
    const result = await getPublishedDrawings('TEST-PROJ');
    
    expect(bffRequest).toHaveBeenCalledWith('/method/buildpolaris_bff.api.document_control.get_published_drawings', expect.objectContaining({ method: 'POST', body: JSON.stringify({ project: 'TEST-PROJ' }) }));
    expect(result).toHaveLength(1);
  });
});