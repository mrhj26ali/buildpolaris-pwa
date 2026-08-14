import { useState } from 'react'
import { useLienWaivers, useRequestLienWaiver } from '../model/useCloseout'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { Plus } from 'lucide-react'
import type { LienWaiverType } from '@/types/domain'

const TYPES: LienWaiverType[] = ['Conditional', 'Unconditional', 'Partial', 'Final']

export function LienWaiverTracker({ closingRecord }: { closingRecord: string }) {
  const waiversQuery = useLienWaivers(closingRecord)
  const requestMutation = useRequestLienWaiver(closingRecord)
  const [open, setOpen] = useState(false)
  const [supplier, setSupplier] = useState('')
  const [type, setType] = useState<LienWaiverType>('Conditional')

  if (waiversQuery.isLoading) return <LoadingState label="Loading lien waivers…" />
  if (waiversQuery.isError)
    return <ErrorState message={waiversQuery.error.message} onRetry={() => void waiversQuery.refetch()} />

  const waivers = waiversQuery.data ?? []

  async function handleRequest() {
    await requestMutation.mutateAsync({ closing_record: closingRecord, supplier, type })
    setOpen(false)
    setSupplier('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="min-h-11 gap-1.5">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Request lien waiver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Request lien waiver</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="waiver-supplier">Supplier</Label>
                <Input id="waiver-supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as LienWaiverType)}>
                  <SelectTrigger className="min-h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => void handleRequest()} disabled={!supplier || requestMutation.isPending} className="min-h-11">
                {requestMutation.isPending ? 'Sending…' : 'Send request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {waivers.length === 0 ? (
        <EmptyState title="No lien waivers requested yet" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {waivers.map((w) => (
              <TableRow key={w.name}>
                <TableCell>{w.supplier}</TableCell>
                <TableCell><Badge variant="outline">{w.type}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
