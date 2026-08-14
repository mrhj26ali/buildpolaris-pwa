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
  const createMutation = useCreateTask(project)

  async function handleCreate() {
    await createMutation.mutateAsync({ project, subject, duration })
    setOpen(false)
    setSubject('')
    setDuration(1)
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
