import { useEffect, useState } from 'react';
import { getEvmSummary, type EvmSummary } from '@/features/financials/api/core';

export function EvmDashboard({ project }: { project: string }) {
  const [evm, setEvm] = useState<EvmSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    getEvmSummary(project)
      .then((data) => {
        if (!cancelled) {
          setEvm(data);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load EVM');
          setEvm(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [project]);

  const loading = !evm && !error && !!project;
  if (loading) return <div className="p-4 text-center text-gray-500">Loading EVM...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!evm) return null;

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Earned Value Management</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="BAC" value={evm.bac} format="currency" />
        <MetricCard label="PV" value={evm.pv} format="currency" />
        <MetricCard label="EV" value={evm.ev} format="currency" />
        <MetricCard label="AC" value={evm.ac} format="currency" />
        <MetricCard label="CPI" value={evm.cpi} format="ratio" status={evm.cpi >= 0.95 ? 'good' : 'bad'} />
        <MetricCard label="SPI" value={evm.spi} format="ratio" status={evm.spi >= 0.95 ? 'good' : 'bad'} />
      </div>
      <div className="mt-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          evm.status === 'on_track'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {evm.status === 'on_track' ? 'On Track' : 'At Risk'}
        </span>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  format,
  status,
}: {
  label: string;
  value: number;
  format: 'currency' | 'ratio';
  status?: 'good' | 'bad';
}) {
  const formatted = format === 'currency'
    ? `$${value.toLocaleString()}`
    : value.toFixed(3);
  const color = status === 'good' ? 'text-green-600' : status === 'bad' ? 'text-red-600' : 'text-gray-900';
  return (
    <div className="p-3 bg-gray-50 rounded">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{formatted}</p>
    </div>
  );
}
