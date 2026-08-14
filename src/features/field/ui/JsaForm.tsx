import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateJsa } from '../model/useJsas'
import { useAuth } from '@/lib/auth/useAuth'
import { toIsoDate } from '@/lib/utils/date'
import { Plus, Trash2 } from 'lucide-react'
import type { JsaHazardLine } from '@/lib/db/schemas/jsa.schema'

export function JsaForm({ project }: { project: string }) {
  const [open, setOpen] = useState(false)
  const [jsaDate, setJsaDate] = useState(toIsoDate(new Date()))
  const [crew, setCrew] = useState('')
  const [hazardLines, setHazardLines] = useState<JsaHazardLine[]>([{ hazard: '', mitigation: '' }])
  const { session } = useAuth()
  const { create, submitting } = useCreateJsa()

  function updateLine(index: number, patch: Partial<JsaHazardLine>) {
    setHazardLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  async function handleSubmit() {
    await create({
      project,
      jsa_date: jsaDate,
      crew,
      prepared_by: session?.email ?? '',
      hazard_lines: hazardLines.filter((l) => l.hazard),
    })
    setOpen(false)
    setCrew('')
    setHazardLines([{ hazard: '', mitigation: '' }])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="min-h-11 gap-1.5">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New JSA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Job Safety Analysis</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jsa-date">Date</Label>
              <Input id="jsa-date" type="date" value={jsaDate} onChange={(e) => setJsaDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="jsa-crew">Crew</Label>
              <Input id="jsa-crew" value={crew} onChange={(e) => setCrew(e.target.value)} />
            </div>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">Hazards & mitigations</legend>
            {hazardLines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Hazard"
                  value={line.hazard}
                  onChange={(e) => updateLine(i, { hazard: e.target.value })}
                  className="min-h-11 flex-1"
                />
                <Input
                  placeholder="Mitigation"
                  value={line.mitigation}
                  onChange={(e) => updateLine(i, { mitigation: e.target.value })}
                  className="min-h-11 flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11"
                  onClick={() => setHazardLines((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="min-h-11 w-fit gap-1.5"
              onClick={() => setHazardLines((prev) => [...prev, { hazard: '', mitigation: '' }])}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add hazard
            </Button>
          </fieldset>
        </div>
        <DialogFooter>
          <Button onClick={() => void handleSubmit()} disabled={submitting || !crew} className="min-h-11">
            {submitting ? 'Saving…' : 'Save JSA'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
