import { useProjectContext } from '@/app/providers/ProjectContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RfiList } from './RfiList'
import { SubmittalList } from './SubmittalList'
import { TransmittalList } from './TransmittalList'
import { MeetingsAndActionItems } from './MeetingsAndActionItems'
import { EmptyState } from '@/lib/ui/States'

export default function CommunicationsPage() {
  const { activeProject } = useProjectContext()

  if (!activeProject) {
    return (
      <div className="p-6">
        <EmptyState title="No project selected" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Communications</h1>
        <p className="text-sm text-muted-foreground">RFIs, submittals, and coordination for {activeProject.title}</p>
      </div>

      <Tabs defaultValue="rfis">
        <TabsList>
          <TabsTrigger value="rfis" className="min-h-11">RFIs</TabsTrigger>
          <TabsTrigger value="submittals" className="min-h-11">Submittals</TabsTrigger>
          <TabsTrigger value="transmittals" className="min-h-11">Transmittals</TabsTrigger>
          <TabsTrigger value="meetings" className="min-h-11">Meetings</TabsTrigger>
        </TabsList>
        <TabsContent value="rfis" className="mt-4">
          <RfiList project={activeProject.name} />
        </TabsContent>
        <TabsContent value="submittals" className="mt-4">
          <SubmittalList project={activeProject.name} />
        </TabsContent>
        <TabsContent value="transmittals" className="mt-4">
          <TransmittalList project={activeProject.name} />
        </TabsContent>
        <TabsContent value="meetings" className="mt-4">
          <MeetingsAndActionItems project={activeProject.name} />
        </TabsContent>
      </Tabs>
    </div>
  )
}