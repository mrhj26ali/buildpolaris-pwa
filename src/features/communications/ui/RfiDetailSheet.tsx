import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useRespondToRfi } from '../model/useCommunications'
import { formatDate } from '@/lib/utils/date'
import type { Rfi } from '@/types/domain'

export function RfiDetailSheet({ project, rfi, onClose }: { project: string; rfi: Rfi | null; onClose: () => void }) {
  const [response, setResponse] = useState('')
  const respondMutation = useRespondToRfi(project)

  useEffect(() => {
    setResponse(rfi?.response ?? '')
  }, [rfi])

  return (
    <Sheet open={!!rfi} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg">
        {rfi && (
          <>
            <SheetHeader>
              <SheetTitle>{rfi.subject}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{rfi.status}</Badge>
                <span>Due {formatDate(rfi.due_date)}</span>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium">Question</p>
                <p className="text-sm text-muted-foreground">{rfi.question}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium">Response</p>
                <Textarea
                  rows={5}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  disabled={rfi.status === 'Closed'}
                  placeholder="Type the response…"
                />
              </div>
              {rfi.status !== 'Closed' && (
                <Button
                  className="min-h-11"
                  disabled={!response || respondMutation.isPending}
                  onClick={() => void respondMutation.mutateAsync({ name: rfi.name, response })}
                >
                  {respondMutation.isPending ? 'Saving…' : 'Save response'}
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
