import { useProjectContext } from '@/app/providers/ProjectContext'
import { useClosingRecord, useExportCloseoutPackage, useOpenClosingRecord } from '../model/useCloseout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { FileDown, FolderClosed} from 'lucide-react'
import type { ClosingRecordStatus } from '@/types/domain'
import { CloseoutReadinessGate } from './CloseoutReadinessGate'
import { SubstantialCompletionPanel } from './SubstantialCompletionPanel'
import { LienWaiverTracker } from './LienWaiverTracker'
import { CloseoutDocumentsPanel } from './CloseoutDocumentsPanel'

const STATUS_VARIANT: Record<ClosingRecordStatus, 'default' | 'secondary' | 'outline'> = {
    Open: 'outline',
    SubstantiallyComplete: 'secondary',
    Finalized: 'default',
}

export default function CloseoutPage() {
    const { activeProject } = useProjectContext()
    const recordQuery = useClosingRecord(activeProject?.name ?? '')
    const exportMutation = useExportCloseoutPackage()
    const openMutation = useOpenClosingRecord(activeProject?.name ?? '')

    if (!activeProject) return <div className="p-6"><EmptyState title="No project selected" /></div>
    if (recordQuery.isLoading) return <LoadingState label="Loading closeout record…" />
    if (recordQuery.isError) return <ErrorState message={recordQuery.error.message} onRetry={() => void recordQuery.refetch()} />

    const record = recordQuery.data

    async function handleExport() {
        if (!record) return
        try {
            const result = await exportMutation.mutateAsync(record.name)
            if (result.file_url) window.open(result.file_url, '_blank')
        } catch (e) { console.error('Closeout export failed', e) }
    }

    if (!record) {
        return (
            <div className="flex flex-col gap-6 p-6">
                <h1 className="text-2xl font-semibold">Project Closeout</h1>
                <EmptyState
                    title="No closeout record yet"
                    description="Open a closing record to manage completion certificates, lien waivers, and final handover packages."
                    icon={<FolderClosed className="h-10 w-10" />}
                    action={<Button onClick={() => openMutation.mutate()}>Open Closing Record</Button>}
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Project Closeout</h1>
                    <p className="text-sm text-muted-foreground">Manage completion certificates, lien waivers, and final handover packages.</p>
                </div>
                <Badge variant={STATUS_VARIANT[record.status]} className="text-sm px-3 py-1">{record.status}</Badge>
            </div>

            <CloseoutReadinessGate project={activeProject.name} closingRecord={record.name} />
            <SubstantialCompletionPanel closingRecord={record.name} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Lien Waivers</CardTitle></CardHeader>
                    <CardContent><LienWaiverTracker closingRecord={record.name} /></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Closeout Documents</CardTitle></CardHeader>
                    <CardContent><CloseoutDocumentsPanel closingRecord={record.name} /></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileDown className="h-5 w-5" /> Final Handover Package
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Generates a comprehensive PDF including all sign-offs, waivers, and financial summaries.</p>
                    <Button onClick={() => void handleExport()} disabled={exportMutation.isPending}>
                        {exportMutation.isPending ? 'Generating PDF…' : 'Export PDF Package'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}