import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listTeamMembers, inviteUser, updateUserRoles, disableUser, type InviteUserPayload } from './identityApi'
import type { FrappeRole } from '@/types/domain'

const TEAM_QUERY_KEY = ['identity', 'team'] as const

export function useTeamMembers() {
  return useQuery({ queryKey: TEAM_QUERY_KEY, queryFn: listTeamMembers })
}

export function useInviteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: InviteUserPayload) => inviteUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY }),
  })
}

export function useUpdateUserRoles() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, roles }: { email: string; roles: FrappeRole[] }) => updateUserRoles(email, roles),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY }),
  })
}

export function useDisableUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => disableUser(email),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEY }),
  })
}
