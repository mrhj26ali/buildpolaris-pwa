import { useTeamMembers, useDisableUser } from '../model/useTeam'
import { InviteUserDialog } from './InviteUserDialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'

export default function TeamPage() {
  const { data: members, isLoading, isError, error, refetch } = useTeamMembers()
  const disableMutation = useDisableUser()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team</h1>
          <p className="text-sm text-muted-foreground">Manage who has access to this workspace</p>
        </div>
        <InviteUserDialog />
      </div>

      {isLoading && <LoadingState label="Loading team…" />}
      {isError && <ErrorState message={error.message} onRetry={() => void refetch()} />}
      {!isLoading && !isError && members?.length === 0 && (
        <EmptyState title="No team members yet" description="Invite someone to get started." />
      )}

      {!isLoading && !isError && members && members.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.email}>
                <TableCell className="font-medium">{member.full_name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {member.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={member.status === 'Active' ? 'default' : 'outline'}>{member.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {member.status !== 'Disabled' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-11"
                      onClick={() => void disableMutation.mutateAsync(member.email)}
                    >
                      Disable
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
