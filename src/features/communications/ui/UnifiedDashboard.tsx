import { useState } from 'react'
import { useUnifiedSearch } from '../model/useCommunications'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { FileText, Package, Send, CheckSquare, Search } from 'lucide-react'
import { formatDate, isOverdue } from '@/lib/utils/date'
import { cn } from '@/lib/utils'

type CommType = 'rfi' | 'submittal' | 'transmittal' | 'action_item'

interface UnifiedRow {
  id: string
  type: CommType
  reference: string
  subject: string
  assignee: string
  dueDate: string | null
  status: string
}

export function UnifiedDashboard({ project }: { project: string }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data, isLoading, isError, error, refetch } = useUnifiedSearch(
    project,
    statusFilter === 'all' ? undefined : statusFilter,
    searchTerm || undefined,
  )

  if (isLoading) return <LoadingState label="Loading unified communications…" />
  if (isError) return <ErrorState message={error.message} onRetry={() => void refetch()} />

  // Flatten the nested response into a single table-ready array
  const rows: UnifiedRow[] = []
  if (data) {
    data.rfis.forEach((r) =>
      rows.push({ id: r.name, type: 'rfi', reference: r.name, subject: r.subject, assignee: r.assigned_to, dueDate: r.due_date, status: r.status }),
    )
    data.submittals.forEach((s) =>
      rows.push({ id: s.name, type: 'submittal', reference: s.name, subject: s.spec_section, assignee: 'N/A', dueDate: null, status: s.status }),
    )
    data.transmittals.forEach((t) =>
      rows.push({ id: t.name, type: 'transmittal', reference: t.name, subject: `Sent via ${t.method}`, assignee: t.sent_by, dueDate: t.sent_at, status: 'Sent' }),
    )
    // FIX: Changed a.date to a.due_date to match the API contract
    data.action_items.forEach((a) =>
      rows.push({ id: a.name, type: 'action_item', reference: a.name, subject: a.description, assignee: a.assignee, dueDate: a.due_date, status: a.status }),
    )
  }

  const typeIcon = (type: CommType) => {
    switch (type) {
      case 'rfi': return <FileText className="h-4 w-4 text-blue-500" />
      case 'submittal': return <Package className="h-4 w-4 text-purple-500" />
      case 'transmittal': return <Send className="h-4 w-4 text-green-500" />
      case 'action_item': return <CheckSquare className="h-4 w-4 text-amber-500" />
    }
  }

  const typeLabel = (type: CommType) => {
    switch (type) {
      case 'rfi': return 'RFI'
      case 'submittal': return 'Submittal'
      case 'transmittal': return 'Transmittal'
      case 'action_item': return 'Action Item'
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by assignee or reference…"
            className="pl-9 min-h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="min-h-11 w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Answered">Answered</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
            <SelectItem value="Submitted">Submitted</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Unified Table */}
      {rows.length === 0 ? (
        <EmptyState title="No communications found" description="Try adjusting your search or filter criteria." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Subject / Details</TableHead>
                <TableHead>Assignee / Sender</TableHead>
                <TableHead>Due / Sent Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${row.type}-${row.id}`} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {typeIcon(row.type)}
                      <span className="text-xs font-medium">{typeLabel(row.type)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{row.reference}</TableCell>
                  <TableCell className="max-w-xs truncate">{row.subject}</TableCell>
                  <TableCell>{row.assignee}</TableCell>
                  <TableCell>
                    {row.dueDate ? (
                      <span className={cn(isOverdue(row.dueDate) && row.status !== 'Closed' && row.status !== 'Done' && 'text-destructive font-medium')}>
                        {formatDate(row.dueDate)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={row.status === 'Closed' || row.status === 'Done' || row.status === 'Approved' ? 'default' : 'secondary'}>
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}