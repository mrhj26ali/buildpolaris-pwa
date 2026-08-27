import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { listProjects, type Project } from '@/features/projects/model/projectsApi'
import { useUpdateUserProjects } from '../model/useTeam'
import { Settings2 } from 'lucide-react'

export function AssignProjectsDialog({ userEmail, currentProjects }: { userEmail: string; currentProjects: string[] }) {
  const [open, setOpen] = useState(false)
  const [availableProjects, setAvailableProjects] = useState<Project[]>([])
  const [selectedProjects, setSelectedProjects] = useState<string[]>(currentProjects)
  const updateMutation = useUpdateUserProjects()

  useEffect(() => {
    if (open) {
      listProjects().then(setAvailableProjects).catch(console.error)
    }
  }, [open])

  function toggleProject(projectName: string) {
    setSelectedProjects((prev) =>
      prev.includes(projectName) ? prev.filter((p) => p !== projectName) : [...prev, projectName]
    )
  }

  async function handleSave() {
    await updateMutation.mutateAsync({ email: userEmail, projectNames: selectedProjects })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="min-h-11 gap-1.5">
          <Settings2 className="h-4 w-4" /> Projects
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Project Access for {userEmail}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label>Assign to Projects ({selectedProjects.length} selected)</Label>
          <div className="max-h-60 overflow-y-auto border rounded-md p-3 flex flex-col gap-2">
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
        <DialogFooter>
          <Button
            onClick={() => void handleSave()}
            disabled={updateMutation.isPending}
            className="min-h-11"
          >
            {updateMutation.isPending ? 'Saving…' : 'Save assignments'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}