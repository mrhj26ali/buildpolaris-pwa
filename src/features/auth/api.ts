import { bffRequest } from '@/lib/bffClient'
import type { LoginPayload, PlatformRole, TenantUser, User, VersionEntry } from '@/types/auth'

export interface RegisterTenantPayload {
  company_name: string
  admin_email: string
  admin_name: string
  admin_password: string
  country: string
  currency: string
}

// ---------------- UC-01 ----------------
export async function registerTenantRequest(payload: RegisterTenantPayload) {
  // bffRequest already unwraps the { message: ... } envelope
  return await bffRequest<{ status: string; company: string; message: string }>(
    '/method/buildpolaris_bff.api.auth.register_tenant',
    { method: 'POST', body: JSON.stringify(payload) },
  )
}

export async function activateAccount(token: string, password?: string) {
  return await bffRequest<{ status: string }>(
    '/method/buildpolaris_bff.api.auth.activate_account',
    { method: 'POST', body: JSON.stringify({ token, password: password ?? null }) },
  )
}

export async function resendActivation(email: string) {
  return await bffRequest<{ status: string }>(
    '/method/buildpolaris_bff.api.auth.resend_activation',
    { method: 'POST', body: JSON.stringify({ email }) },
  )
}

// ---------------- UC-03 ----------------
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
  const m = await bffRequest<{
    user: string
    full_name: string
    roles: string[]
    persona: string
    company: string | null
    is_admin: boolean
  }>('/method/buildpolaris_bff.api.auth.get_session_context')
  
  return {
    email: m.user,
    fullName: m.full_name,
    roles: m.roles,
    persona: m.persona,
    company: m.company,
    isAdmin: m.is_admin,
  }
}

// ---------------- UC-02 / UC-07 (User Management) ----------------
export async function listUsers(): Promise<TenantUser[]> {
  return await bffRequest<TenantUser[]>(
    '/method/buildpolaris_bff.api.users.list_users',
  )
}

export async function availableRoles(): Promise<PlatformRole[]> {
  return await bffRequest<PlatformRole[]>(
    '/method/buildpolaris_bff.api.users.available_roles',
  )
}

export async function inviteUser(email: string, fullName: string, roles: string[]) {
  return await bffRequest<{ status: string }>(
    '/method/buildpolaris_bff.api.users.invite_user',
    { method: 'POST', body: JSON.stringify({ email, full_name: fullName, roles }) },
  )
}

export async function resendInvite(email: string) {
  return await bffRequest<{ status: string }>(
    '/method/buildpolaris_bff.api.users.resend_invite',
    { method: 'POST', body: JSON.stringify({ email }) },
  )
}

export async function updateUserRoles(email: string, roles: string[]) {
  return await bffRequest<{ status: string }>(
    '/method/buildpolaris_bff.api.users.update_user_roles',
    { method: 'POST', body: JSON.stringify({ email, roles }) },
  )
}

export async function setUserEnabled(email: string, enabled: boolean) {
  return await bffRequest<{ status: string }>(
    '/method/buildpolaris_bff.api.users.set_user_enabled',
    { method: 'POST', body: JSON.stringify({ email, enabled }) },
  )
}

// ---------------- UC-06 ----------------
export async function getHistory(doctype: string, name: string): Promise<VersionEntry[]> {
  return await bffRequest<VersionEntry[]>(
    '/method/buildpolaris_bff.api.audit.get_history',
    { method: 'POST', body: JSON.stringify({ doctype, name }) },
  )
}