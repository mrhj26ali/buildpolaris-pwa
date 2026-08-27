import { useState } from 'react'
import { useTransmittals, useIssueTransmittal } from '../model/useCommunications'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { formatDateTime } from '@/lib/utils/date'

export function TransmittalList({ project }: { project: string }) {
  const transmittalsQuery = useTransmittals(project)
  const issueMutation = useIssueTransmittal(project)

  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState('Email')
  const [recipients, setRecipients] = useState('')
  const [files, setFiles] = useState('')

  if (transmittalsQuery.isLoading) return <LoadingState label="Loading transmittals…" />
  if (transmittalsQuery.isError) return <ErrorState message={transmittalsQuery.error.message} onRetry={() => void transmittalsQuery.refetch()} />
  
  const transmittals = transmittalsQuery.data ?? []

  async function handleIssue() {
    await issueMutation.mutateAsync({
      project,
      method,
      recipients: recipients.split(',').map(r => r.trim()).filter(Boolean),
      files: files.split(',').map(f => f.trim()).filter(Boolean),
    })
    setOpen(false)
    setMethod('Email')
    setRecipients('')
    setFiles('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="min-h-11 gap-1.5"><Plus className="h-4 w-4" /> New Transmittal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Transmittal</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Method</Label>
                <Input value={method} onChange={(e) => setMethod(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Recipients (comma-separated)</Label>
                <Textarea value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="user1@example.com, user2@example.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Files (comma-separated file names)</Label>
                <Textarea value={files} onChange={(e) => setFiles(e.target.value)} placeholder="file1.pdf, file2.pdf" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => void handleIssue()} disabled={!recipients.trim() || !files.trim() || issueMutation.isPending}>Issue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {transmittals.length === 0 ? (
        <EmptyState title="No transmittals yet" description="Records of documents sent to project stakeholders will appear here." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sent by</TableHead>
              <TableHead>Sent at</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Documents</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transmittals.map((t) => (
              <TableRow key={t.name}>
                <TableCell>{t.sent_by}</TableCell>
                <TableCell>{formatDateTime(t.sent_at)}</TableCell>
                <TableCell>{t.method}</TableCell>
                <TableCell>{t.recipients.join(', ')}</TableCell>
                <TableCell>{t.documents.length} document(s)</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}