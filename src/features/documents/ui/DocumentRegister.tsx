// src/features/documents/components/DocumentRegister.tsx
import { useEffect, useState } from 'react';
import { type DrawingNode, getDrawingRegister } from '../api';

interface Props {
  projectId: string;
}

export function DocumentRegister({ projectId }: Props) {
  const [drawings, setDrawings] = useState<DrawingNode[]>([]);

  useEffect(() => {
    if (!projectId) return;
    getDrawingRegister(projectId).then(setDrawings).catch(console.error);
  }, [projectId]);

  const disciplineColor = (discipline: string) => {
    switch (discipline) {
      case 'Architectural': return 'bg-blue-100 text-blue-800';
      case 'Structural': return 'bg-purple-100 text-purple-800';
      case 'Mechanical': return 'bg-orange-100 text-orange-800';
      case 'Electrical': return 'bg-yellow-100 text-yellow-800';
      case 'Plumbing': return 'bg-green-100 text-green-800';
      case 'Civil': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Drawing Register</h2>
        <span className="text-sm text-gray-500">{drawings.length} drawings</span>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sheet #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discipline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classification</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revisions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IFC Set</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {drawings.map((dwg) => (
              <tr key={dwg.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dwg.sheet_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dwg.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${disciplineColor(dwg.discipline)}`}>
                    {dwg.discipline}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dwg.classification_code || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dwg.revision_count}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {dwg.current_revision ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      IFC
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      No IFC
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
