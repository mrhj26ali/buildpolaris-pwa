// src/features/financials/components/BudgetDashboard.tsx
import { useEffect, useState } from 'react';
import {
  type FinancialDashboard,
  type CommitmentNode,
  type ChangeEventNode,
  type PayApplicationNode,
  getFinancialDashboard,
  getCommitmentList,
  getChangeEventList,
  getPayApplicationList,
} from '../api';

interface Props {
  projectId: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

export function BudgetDashboard({ projectId }: Props) {
  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null);
  const [commitments, setCommitments] = useState<CommitmentNode[]>([]);
  const [changeEvents, setChangeEvents] = useState<ChangeEventNode[]>([]);
  const [payApps, setPayApps] = useState<PayApplicationNode[]>([]);
  const [activeTab, setActiveTab] = useState<'budget' | 'commitments' | 'changes' | 'payapps'>('budget');

  useEffect(() => {
    if (!projectId) return;
    getFinancialDashboard(projectId).then(setDashboard).catch(console.error);
    getCommitmentList(projectId).then(setCommitments).catch(console.error);
    getChangeEventList(projectId).then(setChangeEvents).catch(console.error);
    getPayApplicationList(projectId).then(setPayApps).catch(console.error);
  }, [projectId]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Pending': case 'Submitted': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Summary Cards */}
      {dashboard && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border bg-white p-3 text-center">
            <div className="text-xl font-bold text-gray-900">{formatCurrency(dashboard.budget.total_budget)}</div>
            <div className="text-xs text-gray-500">Total Budget</div>
          </div>
          <div className="rounded-lg border bg-white p-3 text-center">
            <div className="text-xl font-bold text-blue-600">{formatCurrency(dashboard.total_commitments)}</div>
            <div className="text-xs text-gray-500">Committed</div>
          </div>
          <div className="rounded-lg border bg-white p-3 text-center">
            <div className="text-xl font-bold text-orange-600">{formatCurrency(dashboard.total_approved_changes)}</div>
            <div className="text-xs text-gray-500">Approved Changes</div>
          </div>
          <div className="rounded-lg border bg-white p-3 text-center">
            <div className="text-xl font-bold text-green-600">{formatCurrency(dashboard.total_paid_to_date)}</div>
            <div className="text-xs text-gray-500">Paid To Date</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b">
        {(['budget', 'commitments', 'changes', 'payapps'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'budget' ? 'Budget' :
             tab === 'commitments' ? `Commitments (${commitments.length})` :
             tab === 'changes' ? `Changes (${changeEvents.length})` :
             `Pay Apps (${payApps.length})`}
          </button>
        ))}
      </div>

      {/* Budget Tab */}
      {activeTab === 'budget' && dashboard && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Committed</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboard.budget.cost_codes.map((cc) => (
                <tr key={cc.name}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{cc.code}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{cc.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(cc.revised_budget)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(cc.committed_amount)}</td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${cc.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(cc.variance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Commitments Tab */}
      {activeTab === 'commitments' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revised Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commitments.map((com) => (
                <tr key={com.name}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{com.vendor}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{com.commitment_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(com.revised_amount)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(com.status)}`}>
                      {com.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Change Events Tab */}
      {activeTab === 'changes' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {changeEvents.map((ce) => (
                <tr key={ce.name}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{ce.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{ce.change_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(ce.amount)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(ce.status)}`}>
                      {ce.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pay Applications Tab */}
      {activeTab === 'payapps' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Completed</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Retainage</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Due</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payApps.map((pa) => (
                <tr key={pa.name}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{pa.application_number}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{pa.period_start || '—'} to {pa.period_end || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(pa.total_completed)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{formatCurrency(pa.retainage_amount)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-gray-900">{formatCurrency(pa.net_due)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(pa.status)}`}>
                      {pa.status}
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
