/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../setup'
import { runCpmEngine, createBaseline } from '@/features/scheduling/api/scheduling'

describe('Scheduling API', () => {
  test('runs CPM engine and returns critical path', async () => {
    server.use(
      http.post('/api/method/buildpolaris_bff.api.scheduling.run_cpm_engine', async ({ request }) => {
        const body = await request.json() as any
        expect(body.tasks).toHaveLength(2)
        return HttpResponse.json({
          message: {
            success: true,
            data: {
              tasks: [
                { id: 'A', duration: 3, predecessors: [], start_date: '2026-08-11', finish_date: '2026-08-14', total_float: 0, is_critical: true },
                { id: 'B', duration: 5, predecessors: ['A'], start_date: '2026-08-14', finish_date: '2026-08-19', total_float: 0, is_critical: true }
              ],
              critical_path: ['A', 'B'],
              project_duration: 8,
              project_finish_date: '2026-08-19'
            },
          },
        })
      })
    )

    const result = await runCpmEngine([
      { id: 'A', duration: 3, predecessors: [] },
      { id: 'B', duration: 5, predecessors: ['A'] }
    ], '2026-08-11')
    
    expect(result.project_duration).toBe(8)
    expect(result.critical_path).toContain('B')
    expect(result.tasks[1].start_date).toBe('2026-08-14')
  })

  test('creates a schedule baseline', async () => {
    server.use(
      http.post('/api/method/buildpolaris_bff.api.scheduling.create_baseline', async ({ request }) => {
        const body = await request.json() as any
        expect(body.project).toBe('PROJ-001')
        return HttpResponse.json({
          message: {
            success: true,
            data: {
              baseline: 'BASELINE-001'
            },
          },
        })
      })
    )

    const result = await createBaseline('PROJ-001', 'Initial Baseline')
    expect(result.baseline).toBe('BASELINE-001')
  })
})


