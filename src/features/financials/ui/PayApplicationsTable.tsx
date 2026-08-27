import { useState } from 'react'
import { usePayApplications, useSubmitPayApplication, useApprovePayApplication, useCreatePayApplication, useCommitments, useCostCodes } from '../model/useFinancials'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { formatDate } from '@/lib/utils/date'
import { useAuth } from '@/lib/auth/useAuth'
import { Plus, Trash2 } from 'lucide-react'
import type { PayApplicationStatus } from '@/types/domain'

const STATUS_VARIANT: Record<PayApplicationStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
Draft: 'outline', PendingApproval: 'secondary', Approved: 'default', Rejected: 'destructive', Paid: 'default',
}

export function PayApplicationsTable({ project }: { project: string }) {
const payAppsQuery = usePayApplications(project)
const submitMutation = useSubmitPayApplication(project)
const approveMutation = useApprovePayApplication(project)
const createMutation = useCreatePayApplication(project)
const commitmentsQuery = useCommitments(project)
const costCodesQuery = useCostCodes(project)
const { session, isAdmin } = useAuth()
const canApprove = isAdmin || session?.roles.some((r) => r === 'Owner' || r === 'Accounting')

const [open, setOpen] = useState(false)
const [commitment, setCommitment] = useState('')
const [periodEnd, setPeriodEnd] = useState('')
const [retainage, setRetainage] = useState('10')
const [lines, setLines] = useState([{ cost_code: '', work_completed: '', materials_stored: '' }])

if (payAppsQuery.isLoading) return <LoadingState label="Loading pay applications…" />
if (payAppsQuery.isError) return <ErrorState message={payAppsQuery.error.message} onRetry={() => void payAppsQuery.refetch()} />
const payApps = payAppsQuery.data ?? []
const commitments = commitmentsQuery.data ?? []
const costCodes = costCodesQuery.data ?? []

async function handleCreate() {
await createMutation.mutateAsync({
commitment, period_end: periodEnd, retainage_pct: parseFloat(retainage) || 0,
lines: lines.filter(l => l.cost_code).map(l => ({ cost_code: l.cost_code, work_completed: parseFloat(l.work_completed) || 0, materials_stored: parseFloat(l.materials_stored) || 0 }))
})
setOpen(false); setCommitment(''); setPeriodEnd(''); setLines([{ cost_code: '', work_completed: '', materials_stored: '' }])
}

return (
<div className="flex flex-col gap-4">
<div className="flex justify-end">
<Dialog open={open} onOpenChange={setOpen}>
<DialogTrigger asChild><Button className="min-h-11 gap-1.5"><Plus className="h-4 w-4" /> New Pay Application</Button></DialogTrigger>
<DialogContent className="max-h-[90vh] overflow-y-auto">
<DialogHeader><DialogTitle>New Pay Application</DialogTitle></DialogHeader>
<div className="flex flex-col gap-4">
<div className="grid grid-cols-2 gap-4">
<div className="flex flex-col gap-1.5"><Label>Commitment</Label>
<Select value={commitment} onValueChange={setCommitment}>
<SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
<SelectContent>{commitments.filter(c => c.status === 'Approved').map(c => <SelectItem key={c.name} value={c.name}>{c.supplier}</SelectItem>)}</SelectContent>
</Select></div>
<div className="flex flex-col gap-1.5"><Label>Period End</Label><Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} /></div>
</div>
<div className="flex flex-col gap-1.5"><Label>Retainage %</Label><Input type="number" value={retainage} onChange={(e) => setRetainage(e.target.value)} /></div>
<div className="flex flex-col gap-2">
<Label>Lines</Label>
{lines.map((line, i) => (
<div key={i} className="grid grid-cols-12 gap-2 items-end">
<div className="col-span-5"><Select value={line.cost_code} onValueChange={(v) => setLines(lines.map((l, idx) => idx === i ? {...l, cost_code: v} : l))}>
<SelectTrigger><SelectValue placeholder="Cost Code" /></SelectTrigger>
<SelectContent>{costCodes.map(cc => <SelectItem key={cc.name} value={cc.name}>{cc.code}</SelectItem>)}</SelectContent>
</Select></div>
<div className="col-span-3"><Input placeholder="Work Completed" type="number" value={line.work_completed} onChange={(e) => setLines(lines.map((l, idx) => idx === i ? {...l, work_completed: e.target.value} : l))} /></div>
<div className="col-span-3"><Input placeholder="Materials Stored" type="number" value={line.materials_stored} onChange={(e) => setLines(lines.map((l, idx) => idx === i ? {...l, materials_stored: e.target.value} : l))} /></div>
<div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => setLines(lines.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button></div>
</div>
))}
<Button variant="outline" size="sm" onClick={() => setLines([...lines, { cost_code: '', work_completed: '', materials_stored: '' }])}>Add Line</Button>
</div>
</div>
<DialogFooter><Button onClick={() => void handleCreate()} disabled={createMutation.isPending || !commitment || !periodEnd}>{createMutation.isPending ? 'Creating…' : 'Create'}</Button></DialogFooter>
</DialogContent>
</Dialog>
</div>

{payApps.length === 0 ? <EmptyState title="No pay applications yet" /> : (
<Table>
<TableHeader><TableRow><TableHead>Period end</TableHead><TableHead>Retainage</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
<TableBody>
{payApps.map((pa) => (
<TableRow key={pa.name}>
<TableCell>{formatDate(pa.period_end)}</TableCell>
<TableCell>{pa.retainage_pct}%</TableCell>
<TableCell><Badge variant={STATUS_VARIANT[pa.status]}>{pa.status}</Badge></TableCell>
<TableCell className="text-right">
{pa.status === 'Draft' && <Button size="sm" variant="outline" className="min-h-11" disabled={submitMutation.isPending} onClick={() => void submitMutation.mutateAsync(pa.name)}>Submit</Button>}
{pa.status === 'PendingApproval' && canApprove && <Button size="sm" className="min-h-11" disabled={approveMutation.isPending} onClick={() => void approveMutation.mutateAsync(pa.name)}>Approve</Button>}
</TableCell>
</TableRow>
))}
</TableBody>
</Table>
)}
</div>
)
}