import { useState, type ChangeEvent } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUploadRevision } from '../model/useDocumentControl'
import { Upload } from 'lucide-react'

export function UploadRevisionDialog({ drawing }: { drawing: string }) {
  const [open, setOpen] = useState(false)
  const [revisionCode, setRevisionCode] = useState('')
  const [issuedFor, setIssuedFor] = useState('Construction')
  const [file, setFile] = useState<File | null>(null)
  const uploadMutation = useUploadRevision(drawing)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null)
  }

  async function handleUpload() {
    if (!file) return
    await uploadMutation.mutateAsync({ drawing, revision_code: revisionCode, issued_for: issuedFor, file })
    setOpen(false)
    setRevisionCode('')
    setFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-11 gap-1.5">
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload revision
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload new revision</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rev-code">Revision code</Label>
            <Input id="rev-code" placeholder="e.g. C" value={revisionCode} onChange={(e) => setRevisionCode(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rev-issued-for">Issued for</Label>
            <Input id="rev-issued-for" value={issuedFor} onChange={(e) => setIssuedFor(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rev-file">File</Label>
            <Input id="rev-file" type="file" accept=".pdf,.dwg" onChange={handleFileChange} />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => void handleUpload()}
            disabled={!file || !revisionCode || uploadMutation.isPending}
            className="min-h-11"
          >
            {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
