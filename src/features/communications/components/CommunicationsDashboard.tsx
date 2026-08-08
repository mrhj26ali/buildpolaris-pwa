// src/features/communications/components/CommunicationsDashboard.tsx
import { useEffect, useState } from 'react';
import { type RFINode, type SubmittalNode, type ActionItemNode, getRfiList, getSubmittalList, getActionItemList } from '../api';

interface Props {
  projectId: string;
}

export function CommunicationsDashboard({ projectId }: Props) {
  const [rfis, setRfis] = useState<RFINode[]>([]);
  const [submittals, setSubmittals] = useState<SubmittalNode[]>([]);
  const [actionItems, setActionItems] = useState<ActionItemNode[]>([]);
  const [activeTab, setActiveTab] = useState<'rfis' | 'submittals' | 'actions'>('rfis');

  useEffect(() => {
    if (!projectId) return;
    getRfiList(projectId).then(setRfis).catch(console.error);
    getSubmittalList(projectId).then(setSubmittals).catch(console.error);
    getActionItemList(projectId).then(setActionItems).catch(console.error);
  }, [projectId]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'Answered': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex space-x-2 border-b">
        {(['rfis', 'submittals', 'actions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'rfis' ? `RFIs (${rfis.length})` : tab === 'submittals' ? `Submittals (${submittals.length})` : `Action Items (${actionItems.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'rfis' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RFI #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reply Due</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rfis.map((rfi) => (
                <tr key={rfi.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rfi.rfi_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfi.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(rfi.status)}`}>
                      {rfi.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfi.requested_reply_date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'submittals' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spec Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revision</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ball In Court</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submittals.map((sub) => (
                <tr key={sub.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sub.spec_section}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rev {sub.revision_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.ball_in_court || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {actionItems.map((item) => (
                <tr key={item.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.assigned_to || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.due_date || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.priority}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}