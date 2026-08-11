import { describe, expect, test } from 'vitest'
import { http, HttpResponse } from 'msw'

import { server } from '../setup'
import { registerTenantRequest } from '@/features/auth/api'

describe('Auth API security boundary', () => {
  test('registration sends secrets in POST body only, not URL', async () => {
    let capturedUrl: string | undefined
    let capturedBody: Record<string, unknown> | undefined

    server.use(
      http.post(
        '/api/method/buildpolaris_bff.api.auth.register_tenant',
        async ({ request }) => {
          capturedUrl = request.url
          capturedBody = (await request.json()) as Record<string, unknown>

          return HttpResponse.json({
            message: {
              success: true,
              data: {
                status: 'success',
                company: 'Acme Construction LLC',
              },
              message: 'Tenant registered successfully',
            },
          })
        },
      ),
    )

    await registerTenantRequest({
      company_name: 'Acme Construction LLC',
      admin_email: 'admin@acme.test',
      admin_name: 'Admin User',
      admin_password: 'SecretPass123!',
      country: 'United States',
      currency: 'USD',
    })

    expect(capturedUrl).toBeDefined()
    expect(capturedUrl).not.toContain('SecretPass123')

    expect(capturedBody).toBeDefined()
    expect(capturedBody?.admin_password).toBe('SecretPass123!')
    expect(capturedBody?.company_name).toBe('Acme Construction LLC')
    expect(capturedBody?.admin_email).toBe('admin@acme.test')
  })
})

