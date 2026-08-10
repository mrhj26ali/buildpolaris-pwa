// src/features/field/components/FieldDashboard.tsx
import { useEffect, useState } from 'react';
import {
  type DailyLogNode,
  type PunchItemNode,
  type SafetyIncidentNode,
  type SafetyStats,
  getDailyLogList,
  getPunchList,
  getSafetyIncidentList,
  getSafetyStatistics,
} from '../api';

interface Props {
  projectId: string;
}

export function FieldDashboard({ projectId }: Props) {
  const [dailyLogs, setDailyLogs] = useState<DailyLogNode[]>([]);
  const [punchItems, setPunchItems] = useState<PunchItemNode[]>([]);
  const [incidents, setIncidents] = useState<SafetyIncidentNode[]>([]);
  const [safetyStats, setSafetyStats] = useState<SafetyStats | null>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'punch' | 'safety'>('logs');

  useEffect(() => {
    if (!projectId) return;
    getDailyLogList(projectId).then(setDailyLogs).catch(console.error);
    getPunchList(projectId).then(setPunchItems).catch(console.error);
    getSafetyIncidentList(projectId).then(setIncidents).catch(console.error);
    getSafetyStatistics(projectId).then(setSafetyStats).catch(console.error);
  }, [projectId]);

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-green-100 text-green-800';
      case 'Submitted': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Reported': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openPunchCount = punchItems.filter(p => p.status !== 'Closed').length;

  return (
    <div className="space-y-4 p-4">
      {safetyStats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-lg border bg-white p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{safetyStats.total_incidents}</div>
            <div className="text-xs text-gray-500">Total Incidents</div>
          </div>
          <div className="rounded-lg border bg-white p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{safetyStats.osha_recordable}</div>
            <div className="text-xs text-gray-500">OSHA Recordable</div>
          </div>
          <div className="rounded-lg border bg-white p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{safetyStats.near_misses}</div>
            <div className="text-xs text-gray-500">Near Misses</div>
          </div>
          <div className="rounded-lg border bg-white p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{safetyStats.lost_time}</div>
            <div className="text-xs text-gray-500">Lost Time</div>
          </div>
          <div className="rounded-lg border bg-white p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{openPunchCount}</div>
            <div className="text-xs text-gray-500">Open Punch Items</div>
          </div>
        </div>
      )}

      <div className="flex space-x-2 border-b">
        {(['logs', 'punch', 'safety'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'logs' ? `Daily Logs (${dailyLogs.length})` :
             tab === 'punch' ? `Punch List (${punchItems.length})` :
             `Safety (${incidents.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'logs' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weather</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workforce</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyLogs.map((log) => (
                <tr key={log.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.log_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.weather_conditions || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.workforce_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'punch' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {punchItems.map((item) => (
                <tr key={item.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.location || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.due_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'safety' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OSHA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidents.map((inc) => (
                <tr key={inc.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inc.incident_date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inc.incident_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inc.severity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {inc.osha_recordable ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Recordable</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Non-Recordable</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(inc.status)}`}>
                      {inc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
