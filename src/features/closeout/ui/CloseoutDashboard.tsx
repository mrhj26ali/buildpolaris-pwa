// src/features/closeout/components/CloseoutDashboard.tsx
import { useEffect, useState } from 'react';
import {
  type CloseoutStatus,
  type WarrantyNode,
  type OMManualNode,
  type AffidavitNode,
  type LienWaiverNode,
  getCloseoutStatus,
  getWarrantyDocuments,
  getOMManuals,
  getAffidavits,
  getLienWaivers,
} from '../api';

interface Props {
  projectId: string;
}

export function CloseoutDashboard({ projectId }: Props) {
  const [closeout, setCloseout] = useState<CloseoutStatus | null>(null);
  const [warranties, setWarranties] = useState<WarrantyNode[]>([]);
  const [omManuals, setOmManuals] = useState<OMManualNode[]>([]);
  const [affidavits, setAffidavits] = useState<AffidavitNode[]>([]);
  const [lienWaivers, setLienWaivers] = useState<LienWaiverNode[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'warranties' | 'om' | 'affidavits' | 'waivers'>('overview');

  useEffect(() => {
    if (!projectId) return;
    getCloseoutStatus(projectId).then(setCloseout).catch(console.error);
    getWarrantyDocuments(projectId).then(setWarranties).catch(console.error);
    getOMManuals(projectId).then(setOmManuals).catch(console.error);
    getAffidavits(projectId).then(setAffidavits).catch(console.error);
    getLienWaivers(projectId).then(setLienWaivers).catch(console.error);
  }, [projectId]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'FinalComplete': return 'bg-green-100 text-green-800';
      case 'SubstantialComplete': return 'bg-blue-100 text-blue-800';
      case 'DocsCollection': return 'bg-yellow-100 text-yellow-800';
      case 'Signed': return 'bg-green-100 text-green-800';
      case 'PendingSignature': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!closeout) return <div className="p-4 text-gray-500">Loading...</div>;

  if (!closeout.initiated) {
    return (
      <div className="p-4 space-y-4">
        <div className="rounded-lg border bg-yellow-50 p-6 text-center">
          <h3 className="text-lg font-medium text-yellow-800">Closeout Not Initiated</h3>
          <p className="mt-1 text-sm text-yellow-600">
            Project closeout has not been initiated yet. The PM must initiate the closeout process.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-lg border bg-white p-3 text-center">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(closeout.status || '')}`}>
            {closeout.status}
          </span>
          <div className="mt-1 text-xs text-gray-500">Closeout Status</div>
        </div>
        <div className="rounded-lg border bg-white p-3 text-center">
          <div className={`text-2xl font-bold ${closeout.punch_gate_cleared ? 'text-green-600' : 'text-red-600'}`}>
            {closeout.punch_gate_cleared ? '✓' : '✗'}
          </div>
          <div className="text-xs text-gray-500">Punch Gate (FR-2)</div>
        </div>
        <div className="rounded-lg border bg-white p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{closeout.warranties_count || 0}</div>
          <div className="text-xs text-gray-500">Warranties</div>
        </div>
        <div className="rounded-lg border bg-white p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">{closeout.final_waivers_count || 0}</div>
          <div className="text-xs text-gray-500">Final Waivers</div>
        </div>
        <div className="rounded-lg border bg-white p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {closeout.project_has_payment_bond ? 'Bonded' : 'Unbonded'}
          </div>
          <div className="text-xs text-gray-500">Bond Status</div>
        </div>
      </div>

      {/* Substantial Completion Certificate */}
      {closeout.certificate && (
        <div className="rounded-lg border bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Substantial Completion Certificate</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">SC Date: </span>
              <span className="font-medium">{closeout.certificate.substantial_completion_date || '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Warranty Start: </span>
              <span className="font-medium">{closeout.certificate.warranty_start_date || '—'}</span>
            </div>
            <div>
              <span className="text-gray-500">Owner: </span>
              <span className={`font-medium ${closeout.certificate.owner_signed ? 'text-green-600' : 'text-red-600'}`}>
                {closeout.certificate.owner_signed ? 'Signed' : 'Pending'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Architect: </span>
              <span className={`font-medium ${closeout.certificate.architect_signed ? 'text-green-600' : 'text-red-600'}`}>
                {closeout.certificate.architect_signed ? 'Signed' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b">
        {(['overview', 'warranties', 'om', 'affidavits', 'waivers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'overview' ? 'Overview' :
             tab === 'warranties' ? `Warranties (${warranties.length})` :
             tab === 'om' ? `O&M (${omManuals.length})` :
             tab === 'affidavits' ? `Affidavits (${affidavits.length})` :
             `Waivers (${lienWaivers.length})`}
          </button>
        ))}
      </div>

      {/* Warranties Tab */}
      {activeTab === 'warranties' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scope</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Term (mo)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {warranties.map((w) => (
                <tr key={w.name}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{w.supplier}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{w.system_scope || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{w.warranty_start_date || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500">{w.warranty_term_months}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(w.status)}`}>
                      {w.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* O&M Manuals Tab */}
      {activeTab === 'om' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {omManuals.map((m) => (
                <tr key={m.name}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{m.supplier}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{m.asset_reference || '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor(m.status)}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Affidavits Tab */}
      {activeTab === 'affidavits' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Debts Satisfied</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sworn At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {affidavits.map((a) => (
                <tr key={a.name}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{a.supplier}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {a.all_debts_satisfied ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Yes</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Exceptions</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{a.sworn_at || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lien Waivers Tab */}
      {activeTab === 'waivers' && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lienWaivers.map((w) => (
                <tr key={w.name}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{w.supplier}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{w.waiver_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {w.is_final ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Final</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Interim</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{w.submitted_at || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
