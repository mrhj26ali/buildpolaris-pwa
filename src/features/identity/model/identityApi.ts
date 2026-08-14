import { bffRequest } from '@/lib/clients/bffClient'
import type { FrappeRole } from '@/types/domain'

export interface TeamMember {
  email: string
  full_name: string
  roles: FrappeRole[]
  status: 'Active' | 'Invited' | 'Disabled'
  assigned_projects: string[]
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  return bffRequest<TeamMember[]>('/method/buildpolaris_bff.identity.api.list_team_members', {
    method: 'GET',
  })
}

export interface InviteUserPayload {
  email: string
  first_name: string
  roles: FrappeRole[]
  project_names: string[]
}

export async function inviteUser(payload: InviteUserPayload): Promise<void> {
  await bffRequest<unknown>('/method/buildpolaris_bff.identity.api.invite_user', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateUserRoles(email: string, roles: FrappeRole[]): Promise<void> {
  await bffRequest<unknown>('/method/buildpolaris_bff.identity.api.update_user_roles', {
    method: 'POST',
    body: JSON.stringify({ email, roles }),
  })
}

export async function disableUser(email: string): Promise<void> {
  await bffRequest<unknown>('/method/buildpolaris_bff.identity.api.disable_user', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}
