import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState, LoadingState } from '@/lib/ui/States'
import { listCommitments, createCommitment, approveCommitment, type CreateCommitmentPayload } from '../model/financialsApi'
import type { CommitmentType } from '@/types/domain'
import { Plus, CheckCircle } from 'lucide-react'

export function CommitmentsPanel({ project }: { project: string }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  
  // Form state
  const [costCode, setCostCode] = useState('')
  const [supplier, setSupplier] = useState('')
  const [type, setType] = useState<CommitmentType>('Subcontract')
  const [amount, setAmount] = useState('')

  const query = useQuery({
    queryKey: ['commitments', project],
    queryFn: () => listCommitments(project),
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateCommitmentPayload) => createCommitment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commitments', project] })
      setOpen(false)
      setCostCode(''); setSupplier(''); setAmount('')
    },
  })

  const approveMutation = useMutation({
    mutationFn: approveCommitment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commitments', project] }),
  })

  if (query.isLoading) return <LoadingState label="Loading commitments..." />
  const commitments = query.data ?? []

  const handleCreate = () => {
    const payload: CreateCommitmentPayload = {
      project,
      cost_code: costCode,
      supplier,
      type: type as CommitmentType,
      original_amount: parseFloat(amount),
    }
    createMutation.mutate(payload)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Commitments</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" /> New Commitment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Commitment</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Cost Code</Label>
                <Input value={costCode} onChange={(e) => setCostCode(e.target.value)} placeholder="e.g., 03-300" />
              </div>
              <div className="grid gap-2">
                <Label>Supplier</Label>
                <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Supplier Name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(value: CommitmentType) => setType(value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Subcontract">Subcontract</SelectItem>
                      <SelectItem value="PurchaseOrder">Purchase Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Original Amount</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
              </div>
              <Button 
                onClick={handleCreate}
                disabled={createMutation.isPending || !costCode || !supplier || !amount}
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {commitments.length === 0 ? (
        <EmptyState title="No commitments" description="Create your first commitment to track project costs." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cost Code</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commitments.map((c) => (
              <TableRow key={c.name}>
                <TableCell className="font-medium">{c.cost_code}</TableCell>
                <TableCell>{c.supplier}</TableCell>
                <TableCell>{c.type}</TableCell>
                <TableCell className="text-right">${c.original_amount?.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${c.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {c.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {c.status === 'PendingApproval' && (
                    <Button size="sm" variant="outline" onClick={() => approveMutation.mutate(c.name)}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}