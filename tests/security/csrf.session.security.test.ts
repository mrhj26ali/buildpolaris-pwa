import { describe, expect, test } from 'vitest'
import { http, HttpResponse } from 'msw'

import { server } from '../setup'
import { BffApiError, bffRequest } from '@/lib/clients/bffClient'

describe('BFF client security boundary', () => {
  test('mutating requests include CSRF token and credentials', async () => {
    let capturedRequest: Request | undefined

    server.use(
      http.post('/api/method/buildpolaris_bff.api.health.ping', ({ request }) => {
        capturedRequest = request
        return HttpResponse.json({
          message: {
            status: 'ok',
          },
        })
      }),
    )

    await bffRequest('/method/buildpolaris_bff.api.health.ping', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    expect(capturedRequest).toBeDefined()
    expect(capturedRequest?.headers.get('x-frappe-csrf-token')).toBeTruthy()
    expect(capturedRequest?.credentials).toBe('include')
  })

  test('GET requests do not require CSRF header but still include credentials', async () => {
    let capturedRequest: Request | undefined

    server.use(
      http.get('/api/method/buildpolaris_bff.api.health.ping', ({ request }) => {
        capturedRequest = request
        return HttpResponse.json({
          message: {
            status: 'ok',
          },
        })
      }),
    )

    await bffRequest('/method/buildpolaris_bff.api.health.ping', {
      method: 'GET',
    })

    expect(capturedRequest).toBeDefined()
    expect(capturedRequest?.credentials).toBe('include')
  })

  test('401 responses surface authentication errors', async () => {
    server.use(
      http.get('/api/method/buildpolaris_bff.api.health.ping', () => {
        return HttpResponse.json(
          {
            message: 'Authentication required',
          },
          {
            status: 401,
          },
        )
      }),
    )

    await expect(
      bffRequest('/method/buildpolaris_bff.api.health.ping', {
        method: 'GET',
      }),
    ).rejects.toBeInstanceOf(BffApiError)
  })
})

