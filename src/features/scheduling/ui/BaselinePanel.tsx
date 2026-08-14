import { useState } from 'react'
import { useBaselines, useCaptureBaseline } from '../model/useScheduling'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils/date'
import { Camera } from 'lucide-react'

export function BaselinePanel({ project }: { project: string }) {
  const { data: baselines } = useBaselines(project)
  const captureMutation = useCaptureBaseline(project)
  const [label, setLabel] = useState('')

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Baselines</h3>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Baseline label (e.g. Contract Baseline)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="min-h-11"
        />
        <Button
          variant="outline"
          className="min-h-11 shrink-0 gap-1.5"
          disabled={!label || captureMutation.isPending}
          onClick={() => {
            void captureMutation.mutateAsync(label).then(() => setLabel(''))
          }}
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
          Capture
        </Button>
      </div>
      {baselines && baselines.length > 0 && (
        <ul className="flex flex-col gap-1.5 text-sm">
          {baselines.map((b) => (
            <li key={b.name} className="flex justify-between text-muted-foreground">
              <span>{b.label}</span>
              <span>{formatDate(b.captured_at)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
