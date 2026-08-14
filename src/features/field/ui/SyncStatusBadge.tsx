import type { SyncStatus } from '@/types/sync';
import { cn } from '@/lib/utils';

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    synced: 'bg-green-100 text-green-800',
    conflict: 'bg-red-100 text-red-800',
  };
  return (
    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', classes[status])}>
      {status}
    </span>
  );
}
