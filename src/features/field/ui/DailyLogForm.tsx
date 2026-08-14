import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateDailyLog } from '../model/useDailyLogs'
import { useAuth } from '@/lib/auth/useAuth'
import { toIsoDate } from '@/lib/utils/date'
import { getCurrentCoordinates } from '../lib/geolocation'
import { Plus, Trash2, Camera } from 'lucide-react'
import type { DailyLogLaborLine, DailyLogEquipmentLine, DailyLogMediaCapture } from '@/lib/db/schemas/dailyLog.schema'

export function DailyLogForm({ project }: { project: string }) {
  const [open, setOpen] = useState(false)
  const [logDate, setLogDate] = useState(toIsoDate(new Date()))
  const [weather, setWeather] = useState('')
  const [notes, setNotes] = useState('')
  const [laborLines, setLaborLines] = useState<DailyLogLaborLine[]>([{ trade: '', headcount: 1, hours: 8 }])
  const [equipmentLines, setEquipmentLines] = useState<DailyLogEquipmentLine[]>([])
  const [media, setMedia] = useState<DailyLogMediaCapture[]>([])
  const { session } = useAuth()
  const { create, submitting } = useCreateDailyLog()

  function addLaborLine() {
    setLaborLines((prev) => [...prev, { trade: '', headcount: 1, hours: 8 }])
  }

  function updateLaborLine(index: number, patch: Partial<DailyLogLaborLine>) {
    setLaborLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)))
  }

  function removeLaborLine(index: number) {
    setLaborLines((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleAddPhoto() {
    const coords = await getCurrentCoordinates()
    setMedia((prev) => [
      ...prev,
      {
        local_file_ref: crypto.randomUUID(),
        file: null,
        latitude: coords.latitude,
        longitude: coords.longitude,
        captured_at: new Date().toISOString(),
      },
    ])
  }

  async function handleSubmit() {
    await create({
      project,
      log_date: logDate,
      submitted_by: session?.email ?? '',
      weather,
      notes,
      labor_lines: laborLines.filter((l) => l.trade),
      equipment_lines: equipmentLines,
      media,
    })
    setOpen(false)
    setWeather('')
    setNotes('')
    setLaborLines([{ trade: '', headcount: 1, hours: 8 }])
    setMedia([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-h-11 gap-1.5">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New daily log
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Daily Log</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="log-date">Date</Label>
              <Input id="log-date" type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="log-weather">Weather</Label>
              <Input id="log-weather" value={weather} onChange={(e) => setWeather(e.target.value)} placeholder="e.g. Clear, 72°F" />
            </div>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">Labor</legend>
            {laborLines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Trade"
                  value={line.trade}
                  onChange={(e) => updateLaborLine(i, { trade: e.target.value })}
                  className="min-h-11 flex-1"
                />
                <Input
                  type="number"
                  min={0}
                  value={line.headcount}
                  onChange={(e) => updateLaborLine(i, { headcount: Number(e.target.value) })}
                  className="min-h-11 w-20"
                  aria-label="Headcount"
                />
                <Input
                  type="number"
                  min={0}
                  value={line.hours}
                  onChange={(e) => updateLaborLine(i, { hours: Number(e.target.value) })}
                  className="min-h-11 w-20"
                  aria-label="Hours"
                />
                <Button variant="ghost" size="icon" className="min-h-11 min-w-11" onClick={() => removeLaborLine(i)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="min-h-11 w-fit gap-1.5" onClick={addLaborLine}>
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add trade
            </Button>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="log-notes">Notes</Label>
            <Textarea id="log-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Photos ({media.length})</Label>
            <Button variant="outline" size="sm" className="min-h-11 w-fit gap-1.5" onClick={() => void handleAddPhoto()}>
              <Camera className="h-4 w-4" aria-hidden="true" />
              Tag GPS + add photo
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => void handleSubmit()} disabled={submitting} className="min-h-11">
            {submitting ? 'Saving…' : 'Save daily log'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
