import { useEffect, useState } from 'react'
import { syncEngine } from '@/lib/sync/SyncEngine'
import { getSyncSummary, type SyncSummary } from '@/lib/sync/syncStatus'
import { cn } from '@/lib/utils'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export function GlobalSyncIndicator({ className }: { className?: string }) {
  const [summary, setSummary] = useState<SyncSummary>({ pendingCount: 0, conflictCount: 0 })

  useEffect(() => {
    let mounted = true
    getSyncSummary().then((s) => mounted && setSummary(s))
    const unsubscribe = syncEngine.subscribe((s) => mounted && setSummary(s))
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  if (summary.pendingCount === 0 && summary.conflictCount === 0) return null

  return (
    <div className={cn('flex items-center gap-3 text-xs', className)}>
      {summary.pendingCount > 0 && (
        <span className="inline-flex items-center gap-1 text-amber-600">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          {summary.pendingCount} pending
        </span>
      )}
      {summary.conflictCount > 0 && (
        <span className="inline-flex items-center gap-1 font-medium text-red-600">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          {summary.conflictCount} conflict{summary.conflictCount > 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}
