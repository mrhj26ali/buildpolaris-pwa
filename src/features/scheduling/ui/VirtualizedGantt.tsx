import { useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'
import type { TaskRecord } from '@/types/domain'
import type { CpmResultRow } from '@/lib/cpm/types'

interface VirtualizedGanttProps {
  tasks: TaskRecord[]
  previewByName?: Map<string, CpmResultRow>
  projectDuration: number
}

export function VirtualizedGantt({ tasks, previewByName, projectDuration }: VirtualizedGanttProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44, // 44px minimum touch target
    overscan: 5,
  })

  // Ensure we have a reasonable timeline width (at least 30 days)
  const totalDays = Math.max(projectDuration, 30)
  const markers = Array.from({ length: totalDays + 1 })

  return (
    <div className="flex flex-col h-[600px] w-full overflow-hidden rounded-lg border bg-card">
      {/* Timeline Header */}
      <div className="flex border-b bg-muted/30">
        <div className="w-48 shrink-0 p-3 text-sm font-semibold border-r bg-muted/50">
          Task Name
        </div>
        <div className="flex-1 relative h-8 overflow-hidden">
          {markers.map((_, i) => (
            <div 
              key={i} 
              className="absolute top-0 bottom-0 border-l border-muted-foreground/20 text-[10px] text-muted-foreground pl-1 pt-1.5"
              style={{ left: `${(i / totalDays) * 100}%` }}
            >
              {i % 5 === 0 ? `Day ${i}` : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Virtualized Rows */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const task = tasks[virtualRow.index]
            const preview = previewByName?.get(task.name)
            const isCritical = preview ? preview.is_critical : task.is_critical
            
            // Calculate position and width as percentages of the total timeline
            const startDay = preview ? preview.early_start : 0
            const duration = task.duration || 1
            const leftPct = (startDay / totalDays) * 100
            const widthPct = Math.max((duration / totalDays) * 100, 1.5) // minimum 1.5% width so it's always visible

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
                className="flex items-center border-b hover:bg-accent/40 transition-colors"
              >
                {/* Task Name Column */}
                <div className="w-48 shrink-0 p-3 text-sm border-r bg-card flex items-center">
                  <span className={cn('truncate', isCritical && 'text-destructive font-bold')}>
                    {task.subject}
                  </span>
                </div>
                
                {/* Gantt Chart Timeline Area */}
                <div className="flex-1 relative h-full">
                  {/* Background Grid Lines */}
                  {markers.map((_, i) => (
                     <div 
                       key={i} 
                       className="absolute top-0 bottom-0 border-l border-muted/40"
                       style={{ left: `${(i / totalDays) * 100}%` }}
                     />
                  ))}

                  {/* The Task Bar */}
                  <div
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-6 rounded-md shadow-sm flex items-center justify-center text-[10px] font-semibold text-white overflow-hidden transition-all",
                      isCritical ? "bg-destructive" : "bg-primary"
                    )}
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                    title={`${task.subject} (${duration}d) ${isCritical ? '- Critical Path' : ''}`}
                  >
                    {widthPct > 8 && `${duration}d`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}