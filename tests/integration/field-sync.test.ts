/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test } from 'vitest'
import { http, HttpResponse } from 'msw'

import { server } from '../setup'
import { syncFieldMutations } from '@/features/field/api/sync'

describe('Field Sync API', () => {
  test('sends batch mutations to BFF and receives applied list', async () => {
    server.use(
      http.post('/api/method/buildpolaris_bff.api.field.sync_field_mutations', async ({ request }) => {
        const body = await request.json() as any
        expect(body.mutations).toHaveLength(1)
        return HttpResponse.json({
          message: {
            success: true,
            data: {
              applied: [{ local_id: 'uuid-1', server_name: 'DAILY-001', action: 'created' }],
              conflicts: [],
              server_timestamp: 1700000000000,
            },
          },
        })
      })
    )

    const result = await syncFieldMutations([{ local_id: 'uuid-1', doctype: 'Daily Log', action: 'create', data: {} }], 0)
    
    // bffRequest already unwraps the envelope, so result IS the SyncResponse data
    expect(result.applied[0].server_name).toBe('DAILY-001')
    expect(result.applied[0].action).toBe('created')
    expect(result.server_timestamp).toBe(1700000000000)
  })
})


