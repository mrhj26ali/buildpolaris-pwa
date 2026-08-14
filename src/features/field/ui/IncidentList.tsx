import { useSafetyIncidents } from '../model/useSafetyIncidents'
import { SyncStatusBadge } from '@/lib/ui/SyncStatusBadge'
import { EmptyState, LoadingState } from '@/lib/ui/States'
import { formatDateTime } from '@/lib/utils/date'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { IncidentSeverity } from '@/lib/db/schemas/safetyIncident.schema'

const SEVERITY_VARIANT: Record<IncidentSeverity, 'outline' | 'secondary' | 'destructive'> = {
  Minor: 'outline',
  Recordable: 'secondary',
  'Lost-Time': 'destructive',
  Fatality: 'destructive',
}

export function IncidentList({ project }: { project: string }) {
  const { incidents, loading } = useSafetyIncidents(project)

  if (loading) return <LoadingState label="Loading incidents…" />
  if (incidents.length === 0) return <EmptyState title="No incidents reported" description="Good — keep it that way." />

  return (
    <div className="flex flex-col gap-2">
      {incidents.map((incident) => (
        <Card key={incident.local_uuid}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Badge variant={SEVERITY_VARIANT[incident.severity]}>{incident.severity}</Badge>
                <span className="text-xs text-muted-foreground">{formatDateTime(incident.incident_date)}</span>
              </div>
              <p className="max-w-md truncate text-sm">{incident.narrative}</p>
            </div>
            <SyncStatusBadge status={incident.sync_status} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
