import { useState } from 'react'
import { useRevisions, usePromoteRevision, useGetRevisionForDownload } from '../model/useDocumentControl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingState, ErrorState, EmptyState } from '@/lib/ui/States'
import { UploadRevisionDialog } from './UploadRevisionDialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import type { Drawing } from '@/types/domain'
import { cn } from '@/lib/utils'

export function RevisionHistoryPanel({ drawing }: { drawing: Drawing }) {
  const revisionsQuery = useRevisions(drawing.name)
  const promoteMutation = usePromoteRevision(drawing.name)
  const downloadMutation = useGetRevisionForDownload()

  const [annotateOpen, setAnnotateOpen] = useState(false)
  const [annotateRevision, setAnnotateRevision] = useState('')
  const [annotationText, setAnnotationText] = useState('')

  const [downloadOpen, setDownloadOpen] = useState(false)
  const [downloadRevision, setDownloadRevision] = useState('')
  const [overrideReason, setOverrideReason] = useState('')

  if (revisionsQuery.isLoading) return <LoadingState label="Loading revisions…" />
  if (revisionsQuery.isError) return <ErrorState message={revisionsQuery.error.message} onRetry={() => void revisionsQuery.refetch()} />
  
  const revisions = revisionsQuery.data ?? []

  async function handlePromote(revision: string) {
    await promoteMutation.mutateAsync(revision)
  }

  async function handleAnnotate() {
    if (!annotationText.trim()) return
    // We use the API directly here to avoid hook rules issues with dynamic revisions
    const { createAnnotation } = await import('../model/documentControlApi')
    await createAnnotation(annotateRevision, annotationText)
    setAnnotateOpen(false)
    setAnnotationText('')
    revisionsQuery.refetch()
  }

  async function handleDownload() {
    try {
      const data = await downloadMutation.mutateAsync({ revision: downloadRevision, override_reason: overrideReason || undefined })
      // Open the file URL (Frappe files are typically served at /files/<filename>)
      window.open(`/files/${data.file}`, '_blank')
      setDownloadOpen(false)
      setOverrideReason('')
    } catch (e) {
      console.error('Download failed', e)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">{drawing.title}</h2>
        <UploadRevisionDialog drawing={drawing.name} />
      </div>
      
      {revisions.length === 0 ? (
        <EmptyState title="No revisions uploaded" />
      ) : (
        <ul className="flex flex-col gap-2">
          {revisions.map((rev) => (
            <li key={rev.name} className={cn('flex items-center justify-between rounded-md border p-3', rev.is_current && 'border-primary bg-primary/5')}>
              <div>
                <p className="font-medium">Rev {rev.revision_code}</p>
                <p className="text-xs text-muted-foreground">Issued for {rev.issued_for}</p>
              </div>
              <div className="flex items-center gap-2">
                {rev.is_current ? (
                  <Badge>Current</Badge>
                ) : (
                  <>
                    <Badge variant="outline" className="text-muted-foreground">Superseded</Badge>
                    <Button size="sm" variant="outline" onClick={() => handlePromote(rev.name)} disabled={promoteMutation.isPending}>
                      Promote
                    </Button>
                  </>
                )}
                <Button size="sm" variant="ghost" onClick={() => { setAnnotateRevision(rev.name); setAnnotateOpen(true) }}>
                  Note
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  if (!rev.is_current) {
                    setDownloadRevision(rev.name)
                    setDownloadOpen(true)
                  } else {
                    window.open(`/files/${rev.file}`, '_blank')
                  }
                }}>
                  Download
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Annotation Dialog */}
      <Dialog open={annotateOpen} onOpenChange={setAnnotateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Annotation</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <Textarea placeholder="Enter your note..." value={annotationText} onChange={(e) => setAnnotationText(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={() => void handleAnnotate()} disabled={!annotationText.trim()}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download Override Dialog */}
      <AlertDialog open={downloadOpen} onOpenChange={setDownloadOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Download Superseded Revision?</AlertDialogTitle>
            <AlertDialogDescription>
              This revision is superseded. Please provide a reason for downloading it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-4">
            <Textarea placeholder="Reason for override..." value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleDownload()}>Download</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}