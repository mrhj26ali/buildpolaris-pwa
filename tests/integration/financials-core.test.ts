import { describe, expect, test } from 'vitest'
import { http, HttpResponse } from 'msw'

import { server } from '../setup'
import {
  createCommitment,
  createCostCode,
  createPayApplication,
  getBudgetSummary,
} from '@/features/financials/api/core'

describe('Financial Core API', () => {
  test('creates cost code and commitment', async () => {
    server.use(
      http.post('/api/method/buildpolaris_bff.api.financials.create_cost_code', async ({ request }) => {
        const body = (await request.json()) as any
        expect(body.project).toBe('PROJ-001')
        expect(body.code).toBe('CC-100')

        return HttpResponse.json({
          message: {
            success: true,
            data: { name: 'COST-001' },
          },
        })
      }),
    )

    server.use(
      http.post('/api/method/buildpolaris_bff.api.financials.create_commitment', async ({ request }) => {
        const body = (await request.json()) as any
        expect(body.cost_code).toBe('COST-001')
        expect(body.amount).toBe(1000)

        return HttpResponse.json({
          message: {
            success: true,
            data: { name: 'COMMIT-001' },
          },
        })
      }),
    )

    const costCode = await createCostCode('PROJ-001', 'CC-100', 'Concrete')
    expect(costCode.name).toBe('COST-001')

    const commitment = await createCommitment({
      project: 'PROJ-001',
      cost_code: 'COST-001',
      amount: 1000,
      supplier: 'Supplier A',
    })

    expect(commitment.name).toBe('COMMIT-001')
  })

  test('creates pay application and reads budget summary', async () => {
    server.use(
      http.post('/api/method/buildpolaris_bff.api.financials.create_pay_application', async ({ request }) => {
        const body = (await request.json()) as any
        expect(body.lines).toHaveLength(1)
        expect(body.lines[0].amount).toBe(500)

        return HttpResponse.json({
          message: {
            success: true,
            data: { name: 'PAY-001', total: 500 },
          },
        })
      }),
    )

    server.use(
      http.post('/api/method/buildpolaris_bff.api.financials.get_budget_summary', () => {
        return HttpResponse.json({
          message: {
            success: true,
            data: {
              project: 'PROJ-001',
              cost_codes: [{ name: 'COST-001', code: 'CC-100' }],
              total_committed: 1000,
              total_change_events: 250,
              approved_change_events: 250,
              total_pay_applications: 500,
              projected_total: 1250,
            },
          },
        })
      }),
    )

    const payApp = await createPayApplication({
      project: 'PROJ-001',
      commitment: 'COMMIT-001',
      period_start: '2026-08-01',
      period_end: '2026-08-31',
      lines: [{ cost_code: 'COST-001', amount: 500 }],
    })

    expect(payApp.total).toBe(500)

    const summary = await getBudgetSummary('PROJ-001')
    expect(summary.total_committed).toBe(1000)
    expect(summary.total_pay_applications).toBe(500)
    expect(summary.projected_total).toBe(1250)
  })
})
