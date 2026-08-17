import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { recordMinutes, type RecordMinutesPayload } from '../model/communicationsApi'
import { FileText, Plus, Trash2 } from 'lucide-react'

export function MeetingMinutesDialog({ series, project }: { series: string; project: string }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [actionItems, setActionItems] = useState([{ description: '', assignee: '', due_date: '' }])

  const mutation = useMutation({
    mutationFn: (payload: RecordMinutesPayload) => recordMinutes(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings', project] })
      queryClient.invalidateQueries({ queryKey: ['actionItems', project] })
      setOpen(false)
      setNotes('')
      setActionItems([{ description: '', assignee: '', due_date: '' }])
    },
  })

  const addActionItem = () => setActionItems([...actionItems, { description: '', assignee: '', due_date: '' }])
  const removeActionItem = (idx: number) => setActionItems(actionItems.filter((_, i) => i !== idx))
  const updateActionItem = (idx: number, field: string, value: string) => {
    const updated = [...actionItems]
    updated[idx] = { ...updated[idx], [field]: value }
    setActionItems(updated)
  }

  const handleSubmit = () => {
    const payload: RecordMinutesPayload = {
      series,
      occurred_at: occurredAt,
      notes,
      action_items: actionItems
        .filter(i => i.description.trim())
        .map(i => ({
          subject: i.description,
          assigned_to: i.assignee,
          due_date: i.due_date,
        })),
    }
    mutation.mutate(payload)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-2" /> Record Minutes</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Record Meeting Minutes</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Date Occurred</Label>
            <Input type="date" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Notes / Discussion</Label>
            <Textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Key discussion points..." />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <Label>Action Items Generated</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addActionItem}><Plus className="h-4 w-4" /></Button>
            </div>
            {actionItems.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <div className="col-span-6">
                  <Input placeholder="Description" value={item.description} onChange={(e) => updateActionItem(idx, 'description', e.target.value)} />
                </div>
                <div className="col-span-3">
                  <Input placeholder="Assignee" value={item.assignee} onChange={(e) => updateActionItem(idx, 'assignee', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input type="date" value={item.due_date} onChange={(e) => updateActionItem(idx, 'due_date', e.target.value)} />
                </div>
                <div className="col-span-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeActionItem(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={mutation.isPending || !notes.trim()}
          >
            {mutation.isPending ? 'Saving...' : 'Save Minutes & Action Items'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}