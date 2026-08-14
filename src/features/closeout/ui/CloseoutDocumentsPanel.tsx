import { useState, type ChangeEvent } from 'react'
import { useCloseoutDocuments, useUploadCloseoutDocument } from '../model/useCloseout'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { Upload } from 'lucide-react'
import type { CloseoutDocCategory } from '@/types/domain'

const CATEGORIES: CloseoutDocCategory[] = ['OMManual', 'Warranty', 'ConsentOfSurety', 'ContractorAffidavit']

export function CloseoutDocumentsPanel({ closingRecord }: { closingRecord: string }) {
  const docsQuery = useCloseoutDocuments(closingRecord)
  const uploadMutation = useUploadCloseoutDocument(closingRecord)
  const [category, setCategory] = useState<CloseoutDocCategory>('OMManual')

  if (docsQuery.isLoading) return <LoadingState label="Loading closeout documents…" />
  if (docsQuery.isError) return <ErrorState message={docsQuery.error.message} onRetry={() => void docsQuery.refetch()} />

  const docs = docsQuery.data ?? []

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    void uploadMutation.mutateAsync({ closing_record: closingRecord, category, file })
    event.target.value = ''
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Select value={category} onValueChange={(v) => setCategory(v as CloseoutDocCategory)}>
          <SelectTrigger className="min-h-11 w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="min-h-11 gap-1.5" asChild>
          <label>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Upload document
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
        </Button>
      </div>

      {docs.length === 0 ? (
        <EmptyState title="No closeout documents uploaded" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.map((doc) => (
              <TableRow key={doc.name}>
                <TableCell><Badge variant="outline">{doc.category}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
