// src/features/scheduling/components/VirtualizedGantt.tsx
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
// Added 'type' keyword for TaskNode
import { type TaskNode } from '../api';

interface Props {
  tasks: TaskNode[];
  onDateChange: (task: string, start: Date, end: Date) => void;
}

export function VirtualizedGantt({ tasks }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] w-full overflow-auto border rounded-lg bg-white">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const task = tasks[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="flex items-center border-b px-4 hover:bg-gray-50"
            >
              <span className={`w-64 truncate font-medium ${task.is_critical ? 'text-red-600' : 'text-gray-800'}`}>
                {task.wbs_code} - {task.task_name}
              </span>
              <div className="flex-1 relative h-4 bg-gray-100 rounded ml-4">
                <div 
                  className={`absolute h-full rounded ${task.is_critical ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}