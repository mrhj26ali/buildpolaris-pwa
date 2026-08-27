import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateSafetyIncident } from '../model/useSafetyIncidents'
import { useAuth } from '@/lib/auth/useAuth'
import { getCurrentCoordinates } from '../lib/geolocation'
import { storePendingMedia } from '@/lib/db/mediaCache'
import { isOnline } from '@/lib/sync/reconnectListener'
import { uploadFile } from '@/lib/clients/bffClient'
import { AlertTriangle, Camera } from 'lucide-react'
import type { IncidentSeverity } from '@/lib/db/schemas/safetyIncident.schema'
import type { DailyLogMediaCapture } from '@/lib/db/schemas/dailyLog.schema'

const SEVERITIES: IncidentSeverity[] = ['Minor', 'Recordable', 'Lost-Time', 'Fatality']

export function IncidentReportForm({ project }: { project: string }) {
  const [open, setOpen] = useState(false)
  const [severity, setSeverity] = useState<IncidentSeverity>('Minor')
  const [narrative, setNarrative] = useState('')
  const [media, setMedia] = useState<DailyLogMediaCapture[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { session } = useAuth()
  const { create, submitting } = useCreateSafetyIncident()

  function handlePhotoClick() { fileInputRef.current?.click() }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

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
      project,
      incident_date: new Date().toISOString(),
      severity,
      narrative,
      reported_by: session?.email ?? '',
      involved_persons: [],
      media,
    })
    setOpen(false)
    setNarrative('')
    setSeverity('Minor')
    setMedia([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="min-h-11 gap-1.5">
          <AlertTriangle className="h-4 w-4" /> Report incident
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Safety incident report</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Severity</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as IncidentSeverity)}>
              <SelectTrigger className="min-h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEVERITIES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <Label>What happened</Label>
            <Textarea rows={5} value={narrative} onChange={(e) => setNarrative(e.target.value)} />
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
          <Button variant="destructive" onClick={() => void handleSubmit()} disabled={!narrative || submitting} className="min-h-11">
            {submitting ? 'Saving…' : 'Submit report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}