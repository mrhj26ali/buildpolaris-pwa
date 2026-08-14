import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateCpm, CpmTask, CpmDep } from '@/lib/cpm/engine';

export function SchedulingDashboard() {
  const [tasks, setTasks] = useState<CpmTask[]>([]);

  useEffect(() => {
    // Simulate loading tasks and dependencies from BFF
    const sampleTasks: CpmTask[] = [
      { id: 'T1', duration: 5, es: 0, ef: 0, ls: 0, lf: 0, total_float: 0, is_critical: false },
      { id: 'T2', duration: 3, es: 0, ef: 0, ls: 0, lf: 0, total_float: 0, is_critical: false },
    ];
    const sampleDeps: CpmDep[] = [
      { pred: 'T1', succ: 'T2', type: 'FS', lag: 0 },
    ];
    
    // In production, this runs in the Web Worker:
    // const worker = new Worker(new URL('@/lib/workers/cpm.worker.ts', import.meta.url));
    // worker.postMessage({ tasks: sampleTasks, deps: sampleDeps });
    // worker.onmessage = (e) => setTasks(e.data.tasks);
    
    // For scaffold, run directly:
    const result = calculateCpm(sampleTasks, sampleDeps);
    setTasks(result.tasks);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-900">Project Schedule</h1>
      <Card>
        <CardHeader><CardTitle>Critical Path Method (CPM) Results</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">ES</th>
                <th className="px-4 py-3">EF</th>
                <th className="px-4 py-3">LS</th>
                <th className="px-4 py-3">LF</th>
                <th className="px-4 py-3">Float</th>
                <th className="px-4 py-3">Critical</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id} className={`border-b ${t.is_critical ? 'bg-red-50 font-bold' : ''}`}>
                  <td className="px-4 py-2">{t.id}</td>
                  <td className="px-4 py-2">{t.duration}</td>
                  <td className="px-4 py-2">{t.es}</td>
                  <td className="px-4 py-2">{t.ef}</td>
                  <td className="px-4 py-2">{t.ls}</td>
                  <td className="px-4 py-2">{t.lf}</td>
                  <td className="px-4 py-2">{t.total_float}</td>
                  <td className="px-4 py-2">{t.is_critical ? '⭐ Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
