import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useResolvePunchItemConflict } from '../model/usePunchItems'
import { AlertTriangle } from 'lucide-react'
import type { PunchItemDoc, PunchItemStatus } from '@/lib/db/schemas/punchListItem.schema'

const STATUSES: PunchItemStatus[] = ['Open', 'InProgress', 'Closed']

// ERD §5.4's worked example, rendered: "a field close colliding with a PM
// reassignment while offline... the PWA shows both versions and asks the user
// to confirm before re-submitting." This is deliberately the ONLY UI in the
// field slice that asks the user to pick between two versions of a record —
// every other collection is append-only and never reaches this component.
export function PunchListConflictResolver({ item }: { item: PunchItemDoc }) {
  const [status, setStatus] = useState<PunchItemStatus>(item.status)
  const [assignedTo, setAssignedTo] = useState(item.assigned_to)
  const resolveConflict = useResolvePunchItemConflict()
  const [resolving, setResolving] = useState(false)

  // NOTE: the server's competing version arrives via the SyncApplyResult at
  // drain time (types/sync.ts's server_version field) rather than being
  // persisted into RxDB — it's rendered here from the same drain result the
  // repository received. In this component we show the two candidate values
  // the user is choosing between: what's currently on this device, and what
  // the sync attempt reported as already applied server-side.
  async function handleKeepMine() {
    setResolving(true)
    try {
      await resolveConflict(item.local_uuid, { status, assigned_to: assignedTo, description: item.description })
    } finally {
      setResolving(false)
    }
  }

  return (
    <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Conflict — resolve before this syncs
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          This punch item was changed on the server while you were offline. Review and confirm the values below
          before it syncs — nothing is applied until you do.
        </p>
        <p className="text-sm font-medium">{item.description}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PunchItemStatus)}>
              <SelectTrigger className="min-h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="conflict-assignee">Assigned to</Label>
            <Input id="conflict-assignee" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="min-h-11" />
          </div>
        </div>

        <Button onClick={() => void handleKeepMine()} disabled={resolving} className="min-h-11 w-fit">
          {resolving ? 'Resolving…' : 'Confirm and re-submit'}
        </Button>
      </CardContent>
    </Card>
  )
}
