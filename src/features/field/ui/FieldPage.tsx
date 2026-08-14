import { useProjectContext } from '@/app/providers/ProjectContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DailyLogForm } from './DailyLogForm'
import { DailyLogList } from './DailyLogList'
import { JsaForm } from './JsaForm'
import { IncidentReportForm } from './IncidentReportForm'
import { IncidentList } from './IncidentList'
import { PunchListBoard } from './PunchListBoard'
import { ScheduleLookaheadWidget } from './ScheduleLookaheadWidget'
import { EmptyState } from '@/lib/ui/States'
import { useJsas } from '../model/useJsas'
import { SyncStatusBadge } from '@/lib/ui/SyncStatusBadge'
import { formatDate } from '@/lib/utils/date'
import { LoadingState } from '@/lib/ui/States'
import { Card, CardContent } from '@/components/ui/card'

function JsaTab({ project }: { project: string }) {
  const { jsas, loading } = useJsas(project)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <JsaForm project={project} />
      </div>
      {loading ? (
        <LoadingState label="Loading JSAs…" />
      ) : jsas.length === 0 ? (
        <EmptyState title="No JSAs yet" />
      ) : (
        <div className="flex flex-col gap-2">
          {jsas.map((jsa) => (
            <Card key={jsa.local_uuid}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{jsa.crew}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(jsa.jsa_date)} · {jsa.hazard_lines.length} hazard(s)</p>
                </div>
                <SyncStatusBadge status={jsa.sync_status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FieldPage() {
  const { activeProject } = useProjectContext()

  if (!activeProject) {
    return (
      <div className="p-6">
        <EmptyState title="No project selected" />
      </div>
    )
  }

  const project = activeProject.name

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Field</h1>
        <p className="text-sm text-muted-foreground">Works fully offline — entries sync automatically when reconnected</p>
      </div>

      <Tabs defaultValue="daily-logs">
        <TabsList>
          <TabsTrigger value="daily-logs" className="min-h-11">Daily Logs</TabsTrigger>
          <TabsTrigger value="jsa" className="min-h-11">JSA</TabsTrigger>
          <TabsTrigger value="incidents" className="min-h-11">Incidents</TabsTrigger>
          <TabsTrigger value="punch-list" className="min-h-11">Punch List</TabsTrigger>
          <TabsTrigger value="lookahead" className="min-h-11">Look-ahead</TabsTrigger>
        </TabsList>
        <TabsContent value="daily-logs" className="mt-4 flex flex-col gap-4">
          <div className="flex justify-end">
            <DailyLogForm project={project} />
          </div>
          <DailyLogList project={project} />
        </TabsContent>
        <TabsContent value="jsa" className="mt-4">
          <JsaTab project={project} />
        </TabsContent>
        <TabsContent value="incidents" className="mt-4 flex flex-col gap-4">
          <div className="flex justify-end">
            <IncidentReportForm project={project} />
          </div>
          <IncidentList project={project} />
        </TabsContent>
        <TabsContent value="punch-list" className="mt-4">
          <PunchListBoard project={project} />
        </TabsContent>
        <TabsContent value="lookahead" className="mt-4">
          <ScheduleLookaheadWidget project={project} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
