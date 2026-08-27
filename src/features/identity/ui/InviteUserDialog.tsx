import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useInviteUser } from '../model/useTeam'
import { listProjects, type Project } from '@/features/projects/model/projectsApi'
import type { FrappeRole } from '@/types/domain'

const ALL_ROLES: FrappeRole[] = [
  'Project Manager', 'Accounting', 'Document Controller', 
  'Site Superintendent', 'Safety Officer', 'Subcontractor'
]

export function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [roles, setRoles] = useState<FrappeRole[]>([])
  const [availableProjects, setAvailableProjects] = useState<Project[]>([])
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  
  const inviteMutation = useInviteUser()

  useEffect(() => {
    if (open) {
      listProjects().then(setAvailableProjects).catch(console.error)
    }
  }, [open])

  function toggleRole(role: FrappeRole) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  function toggleProject(projectName: string) {
    setSelectedProjects((prev) =>
      prev.includes(projectName) ? prev.filter((p) => p !== projectName) : [...prev, projectName]
    )
  }

  async function handleInvite() {
    await inviteMutation.mutateAsync({ 
      email, 
      first_name: firstName, 
      roles, 
      project_names: selectedProjects // Only assign selected projects
    })
    setOpen(false)
    setEmail(''); setFirstName(''); setRoles([]); setSelectedProjects([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-h-11">Invite team member</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>First name</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Roles</Label>
            <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
              {ALL_ROLES.map((role) => (
                <label key={role} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={roles.includes(role)} onCheckedChange={() => toggleRole(role)} />
                  {role}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Assign to Projects ({selectedProjects.length} selected)</Label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-3 flex flex-col gap-2">
              {availableProjects.length === 0 ? (
                <p className="text-xs text-muted-foreground">No projects available.</p>
              ) : (
                availableProjects.map((p) => (
                  <label key={p.name} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox 
                      checked={selectedProjects.includes(p.name)} 
                      onCheckedChange={() => toggleProject(p.name)} 
                    />
                    {p.project_name}
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Users will only see and access the projects you select.
            </p>
          </div>
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