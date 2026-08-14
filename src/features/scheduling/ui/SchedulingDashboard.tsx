import { useEffect, useState } from 'react';
import { getWbsTree, type TaskNode } from '../api';
import { VirtualizedGantt } from '../components/VirtualizedGantt';

export function SchedulingDashboard({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<TaskNode[]>([]);

  useEffect(() => {
    if (!projectId) return;
    getWbsTree(projectId).then(setTasks).catch(console.error);
  }, [projectId]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Project Schedule</h2>
      <VirtualizedGantt tasks={tasks} onDateChange={() => {}} />
    </div>
  );
}
