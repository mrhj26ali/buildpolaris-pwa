import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'
import type { TaskRecord } from '@/types/domain'
import type { CpmResultRow } from '@/lib/cpm/types'

interface VirtualizedGanttProps {
  tasks: TaskRecord[]
  previewByName?: Map<string, CpmResultRow>
}

// NFR-PERF.4: schedules with 1,000+ tasks must stay responsive — row
// virtualization is what makes that true regardless of CPM computation cost,
// which is handled separately by the Web Worker (lib/workers/cpm.worker.ts).
export function VirtualizedGantt({ tasks, previewByName }: VirtualizedGanttProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44, // NFR-UX.1 — 44px minimum touch target, rows included
    overscan: 8,
  })

  return (
    <div ref={parentRef} className="h-[600px] w-full overflow-auto rounded-lg border bg-card" role="table">
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const task = tasks[virtualRow.index]
          const preview = previewByName?.get(task.name)
          const isCritical = preview ? preview.is_critical : task.is_critical

          return (
            <div
              key={virtualRow.key}
              role="row"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="flex items-center border-b px-4 hover:bg-accent/40"
            >
              <span className={cn('w-64 shrink-0 truncate text-sm font-medium', isCritical && 'text-destructive')}>
                {task.subject}
              </span>
              <div className="ml-4 flex-1">
                <div className="h-2.5 w-full rounded-full bg-muted">
                  <div
                    className={cn('h-full rounded-full', isCritical ? 'bg-destructive' : 'bg-primary')}
                    style={{ width: `${Math.min(100, (task.duration / 30) * 100)}%` }}
                  />
                </div>
              </div>
              <span className="ml-4 w-16 shrink-0 text-right text-xs text-muted-foreground">
                {task.duration}d
              </span>
              {preview && (
                <span className="ml-4 w-20 shrink-0 text-right text-xs text-muted-foreground">
                  Float {preview.total_float}d
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
