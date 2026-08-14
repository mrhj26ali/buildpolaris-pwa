import { bffRequest } from '@/lib/clients/bffClient'
import type { LoginPayload, User } from '@/types/auth'

export interface RegisterTenantPayload {
  company_name: string
  admin_email: string
  admin_name: string
  country: string
  currency: string
}

interface SessionContextResponse {
  user: string
  full_name: string
  roles: string[]
  persona: string
  company: string | null
  is_admin: boolean
  projects?: Array<{ name: string; project_name?: string }>
}

export async function registerTenantRequest(payload: RegisterTenantPayload) {
  return await bffRequest<{ status: string; company: string; message: string }>(
    '/method/buildpolaris_bff.api.v1.auth.register_tenant',
    { method: 'POST', body: JSON.stringify(payload) },
  )
}

export async function activateAccount(token: string, password?: string) {
  return await bffRequest<{ status: string }>(
    '/method/buildpolaris_bff.api.v1.auth.activate_account',
    { method: 'POST', body: JSON.stringify({ token, password: password ?? null }) },
  )
}

export async function resendActivation(email: string) {
  return await bffRequest<{ status: string }>(
    '/method/buildpolaris_bff.api.v1.auth.resend_activation',
    { method: 'POST', body: JSON.stringify({ email }) },
  )
}

export async function loginRequest(payload: LoginPayload): Promise<void> {
  await bffRequest('/method/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ usr: payload.usr, pwd: payload.pwd }),
  })
}

export async function logoutRequest(): Promise<void> {
  await bffRequest('/method/logout', { method: 'POST' })
}

export async function getSessionContext(): Promise<User> {
  const m = await bffRequest<SessionContextResponse>(
    '/method/buildpolaris_bff.api.v1.auth.get_session_context',
  )
  return {
    email: m.user,
    fullName: m.full_name,
    roles: m.roles,
    persona: m.persona,
    company: m.company,
    isAdmin: m.is_admin,
    projects: (m.projects ?? []).map((p) => ({ name: p.name, title: p.project_name ?? p.name })),
  }
}
