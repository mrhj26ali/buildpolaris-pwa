import { useEffect, useState } from 'react';
import { useProject } from '@/features/projects/model/ProjectContext';
import { getDatabase } from '@/lib/db/database';
import { syncEngine } from '@/lib/sync/SyncEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw } from 'lucide-react';
import { SyncStatusBadge } from './SyncStatusBadge';
import type { DailyLog, PunchItem } from '@/types/domain';

export function FieldDashboard() {
  const { projectId } = useProject();
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [punchItems, setPunchItems] = useState<PunchItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const loadData = async () => {
    if (!projectId) return;
    const db = await getDatabase();
    const logs = await db.daily_logs.find({ selector: { project: projectId } }).exec();
    const punch = await db.punch_items.find({ selector: { project: projectId } }).exec();
    setDailyLogs(logs.map(d => d.toJSON()));
    setPunchItems(punch.map(p => p.toJSON()));
    setPendingCount(
      logs.filter(l => l.sync_status === 'pending').length +
      punch.filter(p => p.sync_status === 'pending').length
    );
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  const createSampleLog = async () => {
    const db = await getDatabase();
    const local_uuid = `local_${Date.now()}`;
    await db.daily_logs.insert({
      local_uuid,
      server_id: null,
      project: projectId!,
      log_date: new Date().toISOString().split('T')[0],
      weather: 'Sunny',
      notes: 'Sample offline log',
      workforce_count: 5,
      work_performed: 'Framing',
      sync_status: 'pending',
      queued_at: new Date().toISOString(),
      synced_at: null,
      _rev: '',
    });
    await syncEngine.queueMutation({
      local_uuid,
      target_collection: 'daily_logs',
      operation: 'create',
      payload: { project: projectId, log_date: new Date().toISOString().split('T')[0], weather: 'Sunny', notes: 'Sample offline log', workforce_count: 5, work_performed: 'Framing' },
    });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-900">Field Execution</h1>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Button variant="outline" onClick={() => syncEngine.syncNow()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Sync {pendingCount} pending
            </Button>
          )}
          <Button className="bg-brand-500" onClick={createSampleLog}>
            <Plus className="h-4 w-4 mr-2" /> New Daily Log
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Daily Logs</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {dailyLogs.map(log => (
                <li key={log.local_uuid} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{log.log_date}</p>
                    <p className="text-sm text-gray-500">{log.work_performed}</p>
                  </div>
                  <SyncStatusBadge status={log.sync_status} />
                </li>
              ))}
              {dailyLogs.length === 0 && <p className="text-sm text-gray-500">No logs yet.</p>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Punch Items</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {punchItems.map(item => (
                <li key={item.local_uuid} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-gray-500">{item.location}</p>
                  </div>
                  <SyncStatusBadge status={item.sync_status} />
                </li>
              ))}
              {punchItems.length === 0 && <p className="text-sm text-gray-500">No punch items yet.</p>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
