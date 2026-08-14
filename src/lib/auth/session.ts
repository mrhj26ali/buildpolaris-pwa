// Session lifecycle against buildpolaris_bff. Frappe issues the sid cookie on
// login; this module never manages tokens itself (ARCH §3.1 — "never a custom
// JWT layer"). get_session_context is FR-1.5's single bootstrap call.

import { bffRequest } from '@/lib/clients/bffClient'
import { clearCsrfToken } from '@/lib/clients/csrf'
import type { SessionContext } from '@/types/domain'

export async function login(usr: string, pwd: string): Promise<void> {
  await bffRequest<unknown>(
    '/method/login',
    { method: 'POST', body: JSON.stringify({ usr, pwd }) },
  )
}

export async function logout(): Promise<void> {
  try {
    await bffRequest<unknown>('/method/logout', { method: 'POST' })
  } finally {
    clearCsrfToken()
  }
}

export async function getSessionContext(): Promise<SessionContext> {
  return bffRequest<SessionContext>(
    '/method/buildpolaris_bff.identity.api.get_session_context',
    { method: 'GET' },
  )
}

export interface RegisterTenantPayload {
  company_name: string
  admin_email: string
  admin_first_name: string
  country: string
}

export async function registerTenant(payload: RegisterTenantPayload): Promise<void> {
  await bffRequest<unknown>(
    '/method/buildpolaris_bff.identity.api.register_tenant',
    { method: 'POST', body: JSON.stringify(payload) },
  )
}

export async function activateAccount(token: string, password: string): Promise<void> {
  await bffRequest<unknown>(
    '/method/buildpolaris_bff.identity.api.activate_account',
    { method: 'POST', body: JSON.stringify({ token, password }) },
  )
}
