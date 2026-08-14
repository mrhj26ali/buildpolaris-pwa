import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateRfi } from '../model/useCommunications'
import { toIsoDate, addDays } from '@/lib/utils/date'
import { Plus } from 'lucide-react'

export function NewRfiDialog({ project }: { project: string }) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [question, setQuestion] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState(addDays(toIsoDate(new Date()), 7))
  const createMutation = useCreateRfi(project)

  async function handleCreate() {
    await createMutation.mutateAsync({ project, subject, question, assigned_to: assignedTo, due_date: dueDate })
    setOpen(false)
    setSubject('')
    setQuestion('')
    setAssignedTo('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-h-11 gap-1.5">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New RFI
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Request for Information</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rfi-subject">Subject</Label>
            <Input id="rfi-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rfi-question">Question</Label>
            <Textarea id="rfi-question" rows={4} value={question} onChange={(e) => setQuestion(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rfi-assignee">Assigned to</Label>
              <Input id="rfi-assignee" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rfi-due">Due date</Label>
              <Input id="rfi-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => void handleCreate()}
            disabled={!subject || !question || !assignedTo || createMutation.isPending}
            className="min-h-11"
          >
            {createMutation.isPending ? 'Sending…' : 'Send RFI'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
