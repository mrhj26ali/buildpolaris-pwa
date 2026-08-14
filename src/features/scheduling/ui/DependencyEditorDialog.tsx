import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateDependency } from '../model/useScheduling'
import type { TaskRecord, DependencyType } from '@/types/domain'
import { Link2 } from 'lucide-react'

const DEP_TYPES: DependencyType[] = ['FS', 'SS', 'FF', 'SF']

export function DependencyEditorDialog({ project, tasks }: { project: string; tasks: TaskRecord[] }) {
  const [open, setOpen] = useState(false)
  const [predecessor, setPredecessor] = useState('')
  const [successor, setSuccessor] = useState('')
  const [type, setType] = useState<DependencyType>('FS')
  const [lagDays, setLagDays] = useState(0)
  const createMutation = useCreateDependency(project)

  async function handleCreate() {
    await createMutation.mutateAsync({ project, predecessor, successor, type, lag_days: lagDays })
    setOpen(false)
    setPredecessor('')
    setSuccessor('')
    setLagDays(0)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="min-h-11 gap-1.5">
          <Link2 className="h-4 w-4" aria-hidden="true" />
          Link tasks
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add dependency</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Predecessor</Label>
            <Select value={predecessor} onValueChange={setPredecessor}>
              <SelectTrigger><SelectValue placeholder="Select task" /></SelectTrigger>
              <SelectContent>
                {tasks.map((t) => (
                  <SelectItem key={t.name} value={t.name}>{t.subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Successor</Label>
            <Select value={successor} onValueChange={setSuccessor}>
              <SelectTrigger><SelectValue placeholder="Select task" /></SelectTrigger>
              <SelectContent>
                {tasks.map((t) => (
                  <SelectItem key={t.name} value={t.name}>{t.subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as DependencyType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEP_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lag-days">Lag (days)</Label>
              <Input id="lag-days" type="number" value={lagDays} onChange={(e) => setLagDays(Number(e.target.value))} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => void handleCreate()}
            disabled={!predecessor || !successor || predecessor === successor || createMutation.isPending}
            className="min-h-11"
          >
            {createMutation.isPending ? 'Linking…' : 'Add dependency'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
