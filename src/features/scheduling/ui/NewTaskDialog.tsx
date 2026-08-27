import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateTask } from '../model/useScheduling'
import { Plus } from 'lucide-react'

export function NewTaskDialog({ project }: { project: string }) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [duration, setDuration] = useState(1)
  const [assignedTo, setAssignedTo] = useState('') // NEW: DCMA Point 11
  const createMutation = useCreateTask(project)

  async function handleCreate() {
    await createMutation.mutateAsync({
      project,
      subject,
      duration,
      assigned_to: assignedTo || undefined,
    })
    setOpen(false)
    setSubject('')
    setDuration(1)
    setAssignedTo('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-h-11 gap-1.5">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New task
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-subject">Task name</Label>
            <Input id="task-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-duration">Duration (days)</Label>
            <Input
              id="task-duration"
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
          {/* NEW: DCMA Point 11 Resource Assignment */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-assigned-to">Assigned To (Resource/Crew)</Label>
            <Input
              id="task-assigned-to"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="e.g. Electrical Crew, John Doe, Subcontractor X"
            />
            <p className="text-xs text-muted-foreground">
              Required for DCMA compliance. Can be a user, crew, or company.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => void handleCreate()} disabled={!subject || createMutation.isPending} className="min-h-11">
            {createMutation.isPending ? 'Adding…' : 'Add task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}