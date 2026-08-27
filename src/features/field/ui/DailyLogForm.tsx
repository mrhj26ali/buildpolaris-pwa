import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateDailyLog } from '../model/useDailyLogs'
import { useAuth } from '@/lib/auth/useAuth'
import { toIsoDate } from '@/lib/utils/date'
import { getCurrentCoordinates } from '../lib/geolocation'
import { storePendingMedia } from '@/lib/db/mediaCache'
import { isOnline } from '@/lib/sync/reconnectListener'
import { uploadFile } from '@/lib/clients/bffClient'
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { session } = useAuth()
  const { create, submitting } = useCreateDailyLog()

  function addLaborLine() { setLaborLines((prev) => [...prev, { trade: '', headcount: 1, hours: 8 }]) }
  function updateLaborLine(index: number, patch: Partial<DailyLogLaborLine>) { setLaborLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line))) }
  function removeLaborLine(index: number) { setLaborLines((prev) => prev.filter((_, i) => i !== index)) }
  function addEquipmentLine() { setEquipmentLines((prev) => [...prev, { equipment: '', hours_used: 1 }]) }
  function updateEquipmentLine(index: number, patch: Partial<DailyLogEquipmentLine>) { setEquipmentLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line))) }
  function removeEquipmentLine(index: number) { setEquipmentLines((prev) => prev.filter((_, i) => i !== index)) }

  function handlePhotoClick() { fileInputRef.current?.click() }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = '' // Reset input so the same file can be selected again if needed

    const coords = await getCurrentCoordinates()
    const localRef = crypto.randomUUID()
    let frappeFileName: string | null = null

    if (isOnline()) {
      try { frappeFileName = await uploadFile(file) } 
      catch (err) { console.error('Online upload failed, caching locally', err) }
    }

    if (!frappeFileName) { await storePendingMedia(localRef, file) }

    setMedia((prev) => [
      ...prev,
      {
        local_file_ref: localRef,
        file: frappeFileName,
        latitude: coords.latitude,
        longitude: coords.longitude,
        captured_at: new Date().toISOString(),
      },
    ])
  }

  async function handleSubmit() {
    await create({
      project, log_date: logDate, submitted_by: session?.email ?? '',
      weather, notes,
      labor_lines: laborLines.filter((l) => l.trade),
      equipment_lines: equipmentLines, media,
    })
    setOpen(false)
    setWeather(''); setNotes('')
    setLaborLines([{ trade: '', headcount: 1, hours: 8 }])
    setEquipmentLines([]); setMedia([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-h-11 gap-1.5"><Plus className="h-4 w-4" /> New daily log</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Daily Log</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Date</Label>
              <Input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Weather</Label>
              <Input value={weather} onChange={(e) => setWeather(e.target.value)} placeholder="e.g. Clear, 72°F" />
            </div>
          </div>
          
          {/* ✅ FIX: Labor Fieldset with proper placeholders */}
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">Labor</legend>
            {laborLines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input 
                  placeholder="Trade (e.g. Electrician)" 
                  value={line.trade} 
                  onChange={(e) => updateLaborLine(i, { trade: e.target.value })} 
                  className="min-h-11 flex-1" 
                />
                <Input 
                  type="number"
                  placeholder="Headcount" 
                  value={line.headcount} 
                  onChange={(e) => updateLaborLine(i, { headcount: Number(e.target.value) })} 
                  className="min-h-11 w-28" 
                />
                <Input 
                  type="number"
                  placeholder="Hours" 
                  value={line.hours} 
                  onChange={(e) => updateLaborLine(i, { hours: Number(e.target.value) })} 
                  className="min-h-11 w-24" 
                />
                {laborLines.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeLaborLine(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="w-fit gap-1.5" onClick={addLaborLine}>
              <Plus className="h-3 w-3" /> Add Trade
            </Button>
          </fieldset>

          {/* ✅ FIX: Equipment Fieldset with proper placeholders */}
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">Equipment</legend>
            {equipmentLines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input 
                  placeholder="Equipment (e.g. Excavator)" 
                  value={line.equipment} 
                  onChange={(e) => updateEquipmentLine(i, { equipment: e.target.value })} 
                  className="min-h-11 flex-1" 
                />
                <Input 
                  type="number"
                  placeholder="Hours Used" 
                  value={line.hours_used} 
                  onChange={(e) => updateEquipmentLine(i, { hours_used: Number(e.target.value) })} 
                  className="min-h-11 w-32" 
                />
                {equipmentLines.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeEquipmentLine(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="w-fit gap-1.5" onClick={addEquipmentLine}>
              <Plus className="h-3 w-3" /> Add Equipment
            </Button>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <Label>Notes</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Photos ({media.length})</Label>
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <Button variant="outline" size="sm" className="min-h-11 w-fit gap-1.5" onClick={handlePhotoClick}>
              <Camera className="h-4 w-4" /> Add Photo
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