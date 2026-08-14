import { cn } from '@/lib/utils'
import type { SyncStatus } from '@/types/sync'
import { CloudOff, CloudUpload, Cloud, AlertTriangle } from 'lucide-react'

// NFR-UX.3: "Offline state, pending-sync, and sync-conflict must be visibly
// communicated — never silent." Every field-record list item and detail view
// renders this next to the record, never relying on a toast that could be missed.

const CONFIG: Record<SyncStatus, { label: string; icon: typeof Cloud; className: string }> = {
  pending: { label: 'Pending sync', icon: CloudUpload, className: 'text-amber-600 bg-amber-50 border-amber-200' },
  synced: { label: 'Synced', icon: Cloud, className: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  conflict: { label: 'Conflict', icon: AlertTriangle, className: 'text-red-600 bg-red-50 border-red-200' },
}

export function SyncStatusBadge({ status, className }: { status: SyncStatus; className?: string }) {
  const config = CONFIG[status]
  const Icon = config.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        config.className,
        className,
      )}
      role="status"
      aria-label={config.label}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {config.label}
    </span>
  )
}

export function OfflineIndicatorIcon({ className }: { className?: string }) {
  return <CloudOff className={cn('h-4 w-4 text-muted-foreground', className)} aria-hidden="true" />
}
