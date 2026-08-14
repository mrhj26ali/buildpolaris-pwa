import { useTransmittals } from '../model/useCommunications'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { formatDateTime } from '@/lib/utils/date'

export function TransmittalList({ project }: { project: string }) {
  const transmittalsQuery = useTransmittals(project)

  if (transmittalsQuery.isLoading) return <LoadingState label="Loading transmittals…" />
  if (transmittalsQuery.isError)
    return <ErrorState message={transmittalsQuery.error.message} onRetry={() => void transmittalsQuery.refetch()} />

  const transmittals = transmittalsQuery.data ?? []
  if (transmittals.length === 0) {
    return <EmptyState title="No transmittals yet" description="Records of documents sent to project stakeholders will appear here." />
  }

  return (
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
  )
}
