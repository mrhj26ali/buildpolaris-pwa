import { useState } from 'react'
import { useCostCodes, useCommitments, useCreateCostCode } from '../model/useFinancials'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { formatCurrency } from '@/lib/utils/currency'
import { Plus } from 'lucide-react'

export function BudgetTable({ project }: { project: string }) {
const costCodesQuery = useCostCodes(project)
const commitmentsQuery = useCommitments(project)
const createCc = useCreateCostCode(project)

const [open, setOpen] = useState(false)
const [code, setCode] = useState('')
const [desc, setDesc] = useState('')
const [budget, setBudget] = useState('')

if (costCodesQuery.isLoading) return <LoadingState label="Loading budget…" />
if (costCodesQuery.isError) return <ErrorState message={costCodesQuery.error.message} onRetry={() => void costCodesQuery.refetch()} />
const costCodes = costCodesQuery.data ?? []
const commitments = commitmentsQuery.data ?? []

async function handleCreate() {
await createCc.mutateAsync({ project, code, description: desc, budget_amount: parseFloat(budget) || 0 })
setOpen(false); setCode(''); setDesc(''); setBudget('')
}

return (
<div className="flex flex-col gap-4">
<div className="flex justify-end">
<Dialog open={open} onOpenChange={setOpen}>
<DialogTrigger asChild><Button className="min-h-11 gap-1.5"><Plus className="h-4 w-4" /> New Cost Code</Button></DialogTrigger>
<DialogContent>
<DialogHeader><DialogTitle>New Cost Code</DialogTitle></DialogHeader>
<div className="flex flex-col gap-4">
<div className="flex flex-col gap-1.5"><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} /></div>
<div className="flex flex-col gap-1.5"><Label>Description</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
<div className="flex flex-col gap-1.5"><Label>Budget Amount</Label><Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} /></div>
</div>
<DialogFooter><Button onClick={() => void handleCreate()} disabled={createCc.isPending || !code}>{createCc.isPending ? 'Creating…' : 'Create'}</Button></DialogFooter>
</DialogContent>
</Dialog>
</div>

{costCodes.length === 0 ? <EmptyState title="No cost codes yet" /> : (
<Table>
<TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Budget</TableHead><TableHead className="text-right">Committed</TableHead><TableHead className="text-right">Remaining</TableHead></TableRow></TableHeader>
<TableBody>
{costCodes.map((cc) => {
const committed = commitments.filter((c) => c.cost_code === cc.name && c.status === 'Approved').reduce((sum, c) => sum + c.revised_amount, 0)
const remaining = cc.budget_amount - committed
return (
<TableRow key={cc.name}>
<TableCell className="font-mono text-sm">{cc.code}</TableCell>
<TableCell>{cc.description}</TableCell>
<TableCell className="text-right">{formatCurrency(cc.budget_amount)}</TableCell>
<TableCell className="text-right">{formatCurrency(committed)}</TableCell>
<TableCell className={`text-right ${remaining < 0 ? 'text-destructive font-medium' : ''}`}>{formatCurrency(remaining)}</TableCell>
</TableRow>
)
})}
</TableBody>
</Table>
)}
</div>
)
}