import { bffRequest } from '@/lib/clients/bffClient'
import type { PlatformRole, TenantUser, VersionEntry } from '@/types/auth'

export async function listUsers(): Promise<TenantUser[]> {
  return await bffRequest<TenantUser[]>(
    '/method/buildpolaris_bff.api.v1.users.list_users',
  )
}

export async function availableRoles(): Promise<PlatformRole[]> {
  return await bffRequest<PlatformRole[]>(
    '/method/buildpolaris_bff.api.v1.users.available_roles',
  )
}

export async function inviteUser(email: string, fullName: string, roles: string[]) {
  return await bffRequest<{ status: string }>(
    '/method/buildpolaris_bff.api.v1.users.invite_user',
    { method: 'POST', body: JSON.stringify({ email, full_name: fullName, roles }) },
  )
}

export async function resendInvite(email: string) {
  return await bffRequest<{ status: string }>(
    '/method/buildpolaris_bff.api.v1.users.resend_invite',
    { method: 'POST', body: JSON.stringify({ email }) },
  )
}

export async function updateUserRoles(email: string, roles: string[]) {
  return await bffRequest<{ status: string }>(
    '/method/buildpolaris_bff.api.v1.users.update_user_roles',
    { method: 'POST', body: JSON.stringify({ email, roles }) },
  )
}

export async function setUserEnabled(email: string, enabled: boolean) {
  return await bffRequest<{ status: string }>(
    '/method/buildpolaris_bff.api.v1.users.set_user_enabled',
    { method: 'POST', body: JSON.stringify({ email, enabled }) },
  )
}

export async function getHistory(doctype: string, name: string): Promise<VersionEntry[]> {
  return await bffRequest<VersionEntry[]>(
    '/method/buildpolaris_bff.api.v1.audit.get_history',
    { method: 'POST', body: JSON.stringify({ doctype, name }) },
  )
}
