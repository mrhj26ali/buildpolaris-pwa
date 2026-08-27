import { useState } from 'react'
import { useSubmittals, useReviewSubmittalLine, useCreateSubmittal } from '../model/useCommunications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import type { SubmittalLineStatus, SubmittalStatus } from '@/types/domain'

const PACKAGE_STATUS_VARIANT: Record<SubmittalStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Submitted: 'secondary',
  UnderReview: 'secondary',
  Approved: 'default',
  Rejected: 'destructive',
  ResubmitRequested: 'destructive',
}
const LINE_STATUSES: SubmittalLineStatus[] = ['Pending', 'Approved', 'Revise', 'Rejected']

export function SubmittalList({ project }: { project: string }) {
  const submittalsQuery = useSubmittals(project)
  const reviewMutation = useReviewSubmittalLine(project)
  const createMutation = useCreateSubmittal(project)

  const [open, setOpen] = useState(false)
  const [specSection, setSpecSection] = useState('')
  const [lines, setLines] = useState([''])

  if (submittalsQuery.isLoading) return <LoadingState label="Loading submittals…" />
  if (submittalsQuery.isError) return <ErrorState message={submittalsQuery.error.message} onRetry={() => void submittalsQuery.refetch()} />
  
  const submittals = submittalsQuery.data ?? []

  async function handleCreate() {
    await createMutation.mutateAsync({ project, spec_section: specSection, line_descriptions: lines.filter(l => l.trim()) })
    setOpen(false)
    setSpecSection('')
    setLines([''])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="min-h-11 gap-1.5"><Plus className="h-4 w-4" /> New Submittal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Submittal</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Spec Section</Label>
                <Input value={specSection} onChange={(e) => setSpecSection(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Line Descriptions</Label>
                {lines.map((line, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={line} onChange={(e) => setLines(lines.map((l, idx) => idx === i ? e.target.value : l))} />
                    {lines.length > 1 && <Button variant="ghost" size="icon" onClick={() => setLines(lines.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setLines([...lines, ''])}>Add Line</Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => void handleCreate()} disabled={!specSection.trim() || createMutation.isPending}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {submittals.length === 0 ? (
        <EmptyState title="No submittal packages yet" />
      ) : (
        <div className="flex flex-col gap-4">
          {submittals.map((pkg) => (
            <Card key={pkg.name}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{pkg.spec_section}</CardTitle>
                <Badge variant={PACKAGE_STATUS_VARIANT[pkg.status]}>{pkg.status}</Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {pkg.lines.map((line) => (
                  <div key={line.name} className="flex items-center justify-between gap-3 rounded-md border p-2.5">
                    <span className="text-sm">{line.description}</span>
                    <Select
                      value={line.status}
                      onValueChange={(status: SubmittalLineStatus) => void reviewMutation.mutateAsync({ submittal: pkg.name, line: line.name, status })}
                    >
                      <SelectTrigger className="min-h-11 w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LINE_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}