import { useState } from 'react'
import { useChangeEvents, useApproveChangeEvent, useCreateChangeEvent, useCommitments } from '../model/useFinancials'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { formatCurrency } from '@/lib/utils/currency'
import { useAuth } from '@/lib/auth/useAuth'
import { Plus } from 'lucide-react'
import type { ChangeEventCategory } from '@/types/domain'

const CATEGORIES: ChangeEventCategory[] = ['ScopeGap', 'DesignError', 'FieldCondition', 'OwnerRequest', 'Other']

export function ChangeEventsTable({ project }: { project: string }) {
const eventsQuery = useChangeEvents(project)
const approveMutation = useApproveChangeEvent(project)
const createMutation = useCreateChangeEvent(project)
const commitmentsQuery = useCommitments(project)
const { session, isAdmin } = useAuth()
const canApprove = isAdmin || session?.roles.some((r) => r === 'Owner' || r === 'Project Manager')

const [open, setOpen] = useState(false)
const [commitment, setCommitment] = useState('')
const [category, setCategory] = useState<ChangeEventCategory>('ScopeGap')
const [reason, setReason] = useState('')
const [delta, setDelta] = useState('')

if (eventsQuery.isLoading) return <LoadingState label="Loading change events…" />
if (eventsQuery.isError) return <ErrorState message={eventsQuery.error.message} onRetry={() => void eventsQuery.refetch()} />
const events = eventsQuery.data ?? []
const commitments = commitmentsQuery.data ?? []

async function handleCreate() {
await createMutation.mutateAsync({ project, commitment, category, outcome_reason: reason, amount_delta: parseFloat(delta) || 0 })
setOpen(false); setCommitment(''); setReason(''); setDelta('')
}

return (
<div className="flex flex-col gap-4">
<div className="flex justify-end">
<Dialog open={open} onOpenChange={setOpen}>
<DialogTrigger asChild><Button className="min-h-11 gap-1.5"><Plus className="h-4 w-4" /> New Change Event</Button></DialogTrigger>
<DialogContent>
<DialogHeader><DialogTitle>New Change Event</DialogTitle></DialogHeader>
<div className="flex flex-col gap-4">
<div className="flex flex-col gap-1.5"><Label>Commitment</Label>
<Select value={commitment} onValueChange={setCommitment}>
<SelectTrigger><SelectValue placeholder="Select commitment" /></SelectTrigger>
<SelectContent>{commitments.map(c => <SelectItem key={c.name} value={c.name}>{c.supplier} ({c.cost_code})</SelectItem>)}</SelectContent>
</Select></div>
<div className="grid grid-cols-2 gap-4">
<div className="flex flex-col gap-1.5"><Label>Category</Label>
<Select value={category} onValueChange={(v) => setCategory(v as ChangeEventCategory)}>
<SelectTrigger><SelectValue /></SelectTrigger>
<SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
</Select></div>
<div className="flex flex-col gap-1.5"><Label>Amount Delta</Label><Input type="number" value={delta} onChange={(e) => setDelta(e.target.value)} /></div>
</div>
<div className="flex flex-col gap-1.5"><Label>Outcome Reason</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} /></div>
</div>
<DialogFooter><Button onClick={() => void handleCreate()} disabled={createMutation.isPending || !commitment || !delta}>{createMutation.isPending ? 'Creating…' : 'Create'}</Button></DialogFooter>
</DialogContent>
</Dialog>
</div>

{events.length === 0 ? <EmptyState title="No change events" /> : (
<Table>
<TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Reason</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead>{canApprove && <TableHead className="text-right">Actions</TableHead>}</TableRow></TableHeader>
<TableBody>
{events.map((ce) => (
<TableRow key={ce.name}>
<TableCell><Badge variant="outline">{ce.category}</Badge></TableCell>
<TableCell className="max-w-xs truncate">{ce.outcome_reason}</TableCell>
<TableCell className={`text-right ${ce.amount_delta < 0 ? 'text-status-ontrack' : ''}`}>{formatCurrency(ce.amount_delta)}</TableCell>
<TableCell><Badge variant={ce.status === 'Approved' ? 'default' : ce.status === 'Rejected' ? 'destructive' : 'secondary'}>{ce.status}</Badge></TableCell>
{canApprove && (<TableCell className="text-right">{ce.status === 'Open' && (<Button size="sm" className="min-h-11" disabled={approveMutation.isPending} onClick={() => void approveMutation.mutateAsync(ce.name)}>Approve</Button>)}</TableCell>)}
</TableRow>
))}
</TableBody>
</Table>
)}
</div>
)
}