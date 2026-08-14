import { Badge } from '@/components/ui/badge'
import type { ProjectSummary } from '../model/projectsApi'

const CONFIG: Record<ProjectSummary['schedule_health'], { label: string; className: string }> = {
  OnTrack: { label: 'On track', className: 'bg-status-ontrack/10 text-status-ontrack border-status-ontrack/30' },
  AtRisk: { label: 'At risk', className: 'bg-status-atrisk/10 text-status-atrisk border-status-atrisk/30' },
  Overdue: { label: 'Overdue', className: 'bg-status-overdue/10 text-status-overdue border-status-overdue/30' },
}

export function ScheduleHealthBadge({ health }: { health: ProjectSummary['schedule_health'] }) {
  const config = CONFIG[health]
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
