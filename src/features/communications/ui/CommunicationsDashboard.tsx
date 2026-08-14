import { useEffect, useState } from 'react';
import { getCommunicationsDashboard, type CommDashboard } from '@/features/communications/api';

export function CommunicationsDashboard({ project }: { project: string }) {
  const [data, setData] = useState<CommDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    getCommunicationsDashboard(project)
      .then((res) => { if (!cancelled) setData(res); })
      .catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Error'); });
    return () => { cancelled = true; };
  }, [project]);

  const loading = !data && !error && !!project;
  if (loading) return <div className="p-4 text-center text-gray-500">Loading communications...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Communications Dashboard</h3>
        {data.total_overdue > 0 && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            {data.total_overdue} Overdue
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="RFIs" value={data.rfi_count} overdue={data.rfi_overdue} />
        <StatCard label="Submittals" value={data.submittal_count} />
        <StatCard label="Transmittals" value={data.transmittal_count} />
        <StatCard label="Action Items" value={data.action_item_count} overdue={data.action_item_overdue} />
      </div>
    </div>
  );
}

function StatCard({ label, value, overdue }: { label: string; value: number; overdue?: number }) {
  return (
    <div className="p-3 bg-gray-50 rounded">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      {overdue !== undefined && overdue > 0 && (
        <p className="text-xs text-red-600 font-medium">{overdue} overdue</p>
      )}
    </div>
  );
}
