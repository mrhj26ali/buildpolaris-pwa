import { useProjectContext } from '@/app/providers/ProjectContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BudgetTable } from './BudgetTable'
import { CommitmentsPanel } from './CommitmentsPanel'
import { ChangeEventsTable } from './ChangeEventsTable'
import { PayApplicationsTable } from './PayApplicationsTable'
import { EvmDashboard } from './EvmDashboard'
import { EmptyState } from '@/lib/ui/States'

export default function FinancialsPage() {
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
        <h1 className="text-2xl font-semibold">Financials</h1>
        <p className="text-sm text-muted-foreground">Budget, commitments, and billing for {activeProject.title}</p>
      </div>

      <Tabs defaultValue="evm">
        <TabsList>
          <TabsTrigger value="evm" className="min-h-11">Overview</TabsTrigger>
          <TabsTrigger value="budget" className="min-h-11">Budget</TabsTrigger>
          <TabsTrigger value="commitments" className="min-h-11">Commitments</TabsTrigger>
          <TabsTrigger value="change-events" className="min-h-11">Change Events</TabsTrigger>
          <TabsTrigger value="pay-apps" className="min-h-11">Pay Applications</TabsTrigger>
        </TabsList>
        <TabsContent value="evm" className="mt-4">
          <EvmDashboard project={activeProject.name} />
        </TabsContent>
        <TabsContent value="budget" className="mt-4">
          <BudgetTable project={activeProject.name} />
        </TabsContent>
        <TabsContent value="commitments" className="mt-4">
          <CommitmentsPanel project={activeProject.name} />
        </TabsContent>
        <TabsContent value="change-events" className="mt-4">
          <ChangeEventsTable project={activeProject.name} />
        </TabsContent>
        <TabsContent value="pay-apps" className="mt-4">
          <PayApplicationsTable project={activeProject.name} />
        </TabsContent>
      </Tabs>
    </div>
  )
}