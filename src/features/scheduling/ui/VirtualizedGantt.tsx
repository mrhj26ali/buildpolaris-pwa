import { useRef, useState, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'
import type { TaskRecord } from '@/types/domain'
import type { CpmResultRow } from '@/lib/cpm/types'

interface VirtualizedGanttProps {
  tasks: TaskRecord[]
  previewByName?: Map<string, CpmResultRow>
  projectDuration: number
  onDurationChange?: (taskName: string, newDuration: number) => void
}

export function VirtualizedGantt({
  tasks,
  previewByName,
  projectDuration,
  onDurationChange,
}: VirtualizedGanttProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [resizingTask, setResizingTask] = useState<string | null>(null)
  const [dragDuration, setDragDuration] = useState<number | null>(null)
  const resizeStartX = useRef(0)
  const resizeStartDuration = useRef(1)
  
  // 1. Add a ref to track the drag duration without triggering re-renders
  const dragDurationRef = useRef<number | null>(null)

  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44, // 44px minimum touch target
    overscan: 5,
  })

  const totalDays = Math.max(projectDuration, 30)
  const markers = Array.from({ length: totalDays + 1 })

  // Global mouse handlers for resizing
  // 2. Update the useEffect to remove 'dragDuration' from dependencies
  useEffect(() => {
    if (!resizingTask || !onDurationChange) return

    const handleMouseMove = (e: MouseEvent) => {
      const container = parentRef.current?.querySelector('[data-gantt-timeline]')
      if (!container) return
      const containerWidth = container.clientWidth
      const pixelsPerDay = containerWidth / totalDays
      const deltaPixels = e.clientX - resizeStartX.current
      const deltaDays = Math.round(deltaPixels / pixelsPerDay)
      
      const newDuration = Math.max(1, resizeStartDuration.current + deltaDays)
      dragDurationRef.current = newDuration // Update the ref
      setDragDuration(newDuration)          // Update state for UI feedback
    }

    const handleMouseUp = () => {
      const container = parentRef.current?.querySelector('[data-gantt-timeline]')
      // Read from the ref to avoid stale closure issues
      if (container && dragDurationRef.current !== null) {
        onDurationChange(resizingTask, dragDurationRef.current)
      }
      setResizingTask(null)
      setDragDuration(null)
      dragDurationRef.current = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizingTask, onDurationChange, totalDays]) // <-- 'dragDuration' removed!

  return (
    <div className="flex flex-col h-[600px] w-full overflow-hidden rounded-lg border bg-card">
      {/* Timeline Header */}
      <div className="flex border-b bg-muted/30">
        <div className="w-48 shrink-0 p-3 text-sm font-semibold border-r bg-muted/50">
          Task Name
        </div>
        <div data-gantt-timeline className="flex-1 relative h-8 overflow-hidden">
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
            
            // Use dragDuration if actively resizing this task, otherwise use preview or base duration
            const displayDuration = resizingTask === task.name && dragDuration !== null 
              ? dragDuration 
              : (preview ? (preview.early_finish - preview.early_start) : task.duration)
            
            const startDay = preview ? preview.early_start : 0
            const leftPct = (startDay / totalDays) * 100
            const widthPct = Math.max((displayDuration / totalDays) * 100, 1.5) // min 1.5% width so it's always visible

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
                <div data-gantt-timeline className="flex-1 relative h-full">
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
                      "absolute top-1/2 -translate-y-1/2 h-6 rounded-md shadow-sm flex items-center justify-center text-[10px] font-semibold text-white overflow-hidden transition-all group",
                      isCritical ? "bg-destructive" : "bg-primary"
                    )}
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                    title={`${task.subject} (${displayDuration}d) ${isCritical ? '- Critical Path' : ''}`}
                  >
                    {widthPct > 8 && `${displayDuration}d`}
                    
                    {/* Resize Handle */}
                    {onDurationChange && (
                      <div
                        className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize bg-white/10 hover:bg-white/30 transition-colors flex items-center justify-center"
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          setResizingTask(task.name)
                          resizeStartX.current = e.clientX
                          resizeStartDuration.current = displayDuration
                          dragDurationRef.current = displayDuration // Initialize ref
                        }}
                      >
                        <div className="w-0.5 h-4 bg-white/50 rounded-full" />
                      </div>
                    )}
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