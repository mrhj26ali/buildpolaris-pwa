import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInviteUser } from '../model/useTeam'
import { useAuth } from '@/lib/auth/useAuth'
import type { FrappeRole } from '@/types/domain'
import { Checkbox } from '@/components/ui/checkbox'

const ALL_ROLES: FrappeRole[] = [
  'Project Manager',
  'Accounting',
  'Document Controller',
  'Site Superintendent',
  'Safety Officer',
  'Subcontractor',
]

export function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [roles, setRoles] = useState<FrappeRole[]>([])
  const { session } = useAuth()
  const inviteMutation = useInviteUser()

  function toggleRole(role: FrappeRole) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  async function handleInvite() {
    const projectNames = session?.projects.map((p) => p.name) ?? []
    await inviteMutation.mutateAsync({ email, first_name: firstName, roles, project_names: projectNames })
    setOpen(false)
    setEmail('')
    setFirstName('')
    setRoles([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-h-11">Invite team member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-first-name">First name</Label>
            <Input id="invite-first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">Roles</legend>
            {ALL_ROLES.map((role) => (
              <label key={role} className="flex min-h-11 items-center gap-2 text-sm">
                <Checkbox checked={roles.includes(role)} onCheckedChange={() => toggleRole(role)} />
                {role}
              </label>
            ))}
          </fieldset>
        </div>
        <DialogFooter>
          <Button
            onClick={() => void handleInvite()}
            disabled={!email || !firstName || roles.length === 0 || inviteMutation.isPending}
            className="min-h-11"
          >
            {inviteMutation.isPending ? 'Sending…' : 'Send invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
