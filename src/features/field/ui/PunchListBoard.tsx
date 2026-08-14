import { useState } from 'react'
import { usePunchItems, useUpdatePunchItemStatus, useCreatePunchItem } from '../model/usePunchItems'
import { SyncStatusBadge } from '@/lib/ui/SyncStatusBadge'
import { EmptyState, LoadingState } from '@/lib/ui/States'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth/useAuth'
import { Plus } from 'lucide-react'
import type { PunchItemStatus } from '@/lib/db/schemas/punchListItem.schema'
import { PunchListConflictResolver } from './PunchListConflictResolver'

const STATUSES: PunchItemStatus[] = ['Open', 'InProgress', 'Closed']

export function PunchListBoard({ project }: { project: string }) {
  const { items, conflicted, loading } = usePunchItems(project)
  const updateStatus = useUpdatePunchItemStatus()

  if (loading) return <LoadingState label="Loading punch list…" />

  const openItems = items.filter((i) => i.sync_status !== 'conflict')

  return (
    <div className="flex flex-col gap-4">
      {conflicted.length > 0 && (
        <div className="flex flex-col gap-2">
          {conflicted.map((item) => (
            <PunchListConflictResolver key={item.local_uuid} item={item} />
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <NewPunchItemDialog project={project} />
      </div>

      {openItems.length === 0 ? (
        <EmptyState title="No punch list items" />
      ) : (
        <div className="flex flex-col gap-2">
          {openItems.map((item) => (
            <Card key={item.local_uuid}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.location} · {item.assigned_to}
                  </p>
                </div>
                <Select
                  value={item.status}
                  onValueChange={(status) => void updateStatus(item.local_uuid, status as PunchItemStatus)}
                >
                  <SelectTrigger className="min-h-11 w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <SyncStatusBadge status={item.sync_status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function NewPunchItemDialog({ project }: { project: string }) {
  const [open, setOpen] = useState(false)
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const { session } = useAuth()
  const { create, submitting } = useCreatePunchItem()

  async function handleCreate() {
    await create({
      project,
      location,
      description,
      assigned_to: assignedTo || session?.email || '',
      status: 'Open',
      rfi: null,
    })
    setOpen(false)
    setLocation('')
    setDescription('')
    setAssignedTo('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-h-11 gap-1.5">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New punch item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add punch list item</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="punch-location">Location</Label>
            <Input id="punch-location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="punch-description">Description</Label>
            <Input id="punch-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="punch-assignee">Assigned to</Label>
            <Input id="punch-assignee" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => void handleCreate()} disabled={!description || submitting} className="min-h-11">
            {submitting ? 'Adding…' : 'Add item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
