import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateSafetyIncident } from '../model/useSafetyIncidents'
import { useAuth } from '@/lib/auth/useAuth'
import { AlertTriangle } from 'lucide-react'
import type { IncidentSeverity } from '@/lib/db/schemas/safetyIncident.schema'

const SEVERITIES: IncidentSeverity[] = ['Minor', 'Recordable', 'Lost-Time', 'Fatality']

export function IncidentReportForm({ project }: { project: string }) {
  const [open, setOpen] = useState(false)
  const [severity, setSeverity] = useState<IncidentSeverity>('Minor')
  const [narrative, setNarrative] = useState('')
  const { session } = useAuth()
  const { create, submitting } = useCreateSafetyIncident()

  async function handleSubmit() {
    await create({
      project,
      incident_date: new Date().toISOString(),
      severity,
      narrative,
      reported_by: session?.email ?? '',
      involved_persons: [],
      media: [],
    })
    setOpen(false)
    setNarrative('')
    setSeverity('Minor')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="min-h-11 gap-1.5">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Report incident
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Safety incident report</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Severity</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as IncidentSeverity)}>
              <SelectTrigger className="min-h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEVERITIES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="incident-narrative">What happened</Label>
            <Textarea id="incident-narrative" rows={5} value={narrative} onChange={(e) => setNarrative(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => void handleSubmit()}
            disabled={!narrative || submitting}
            className="min-h-11"
          >
            {submitting ? 'Saving…' : 'Submit report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
