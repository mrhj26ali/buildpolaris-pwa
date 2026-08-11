import { useEffect, useState } from 'react'
import { getHistory } from '../api'
import type { VersionEntry } from '@/types/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function HistoryDrawer({
  doctype, name, title, onClose,
}: { doctype: string; name: string; title: string; onClose: () => void }) {
  const [entries, setEntries] = useState<VersionEntry[] | null>(null)

  useEffect(() => {
    getHistory(doctype, name).then(setEntries).catch(() => setEntries([]))
  }, [doctype, name])

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries === null && <p className="text-sm text-gray-500">Loadingâ€¦</p>}
            {entries?.length === 0 && <p className="text-sm text-gray-500">No recorded changes yet.</p>}
            {entries?.map((v, i) => (
              <div key={i} className="rounded-md border border-surface-border p-2 text-sm">
                <div className="mb-1 text-xs text-gray-500">
                  {v.owner} â€” {new Date(v.creation).toLocaleString()}
                </div>
                {v.changes.map((c, j) => (
                  <div key={j} className="text-xs">
                    <span className="font-medium">{c.field}</span>: <span className="text-red-600 line-through">{String(c.before ?? '')}</span>{' '}
                    â†’ <span className="text-green-700">{String(c.after ?? '')}</span>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



