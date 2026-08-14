import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProject } from '@/features/projects/model/ProjectContext';
import { bffRequest } from '@/lib/clients/bffClient';

interface CostCode {
  code: string;
  title: string;
  revised_budget: number;
  committed_amount: number;
  variance: number;
}

export function BudgetDashboard() {
  const { projectId } = useProject();
  const [costCodes, setCostCodes] = useState<CostCode[]>([]);

  useEffect(() => {
    if (!projectId) return;
    bffRequest<CostCode[]>('/method/buildpolaris_bff.api.financial_control.get_budget_summary', {
      method: 'POST',
      body: JSON.stringify({ project: projectId }),
    })
      .then(setCostCodes)
      .catch(() => setCostCodes([]));
  }, [projectId]);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-900">Financial Control</h1>
      <Card>
        <CardHeader><CardTitle>Budget vs. Committed</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3 text-right">Budget</th>
                <th className="px-4 py-3 text-right">Committed</th>
                <th className="px-4 py-3 text-right">Variance</th>
              </tr>
            </thead>
            <tbody>
              {costCodes.map(cc => (
                <tr key={cc.code} className="border-b">
                  <td className="px-4 py-2 font-medium">{cc.code}</td>
                  <td className="px-4 py-2">{cc.title}</td>
                  <td className="px-4 py-2 text-right">{fmt(cc.revised_budget)}</td>
                  <td className="px-4 py-2 text-right">{fmt(cc.committed_amount)}</td>
                  <td className={`px-4 py-2 text-right font-bold ${cc.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {fmt(cc.variance)}
                  </td>
                </tr>
              ))}
              {costCodes.length === 0 && (
                <tr><td colSpan={5} className="text-center py-4 text-gray-500">No cost codes found for this project.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
