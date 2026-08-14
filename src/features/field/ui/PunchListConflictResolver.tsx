import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { PunchItem } from '@/types/domain';

interface Props {
  localItem: PunchItem;
  serverItem: Record<string, unknown>;
  onResolve: (resolution: 'keep_local' | 'keep_server' | 'discard') => void;
  onClose: () => void;
}

export function PunchListConflictResolver({ localItem, serverItem, onResolve, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg border-red-300 bg-white shadow-xl">
        <CardHeader className="border-b border-red-100 bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Sync Conflict: Punch Item
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <p className="text-sm text-gray-600">
            This punch item was modified both locally and on the server while you were offline. 
            Per ERD §5.4, please choose which version to keep.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Your Local Version</h4>
              <p className="text-xs text-gray-700"><strong>Status:</strong> {localItem.status}</p>
              <p className="text-xs text-gray-700"><strong>Assigned:</strong> {localItem.assigned_to}</p>
              <p className="text-xs text-gray-700 mt-1"><strong>Description:</strong> {localItem.description}</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <h4 className="text-sm font-semibold text-green-900 mb-2">Server Version</h4>
              <p className="text-xs text-gray-700"><strong>Status:</strong> {String(serverItem.status ?? 'Unknown')}</p>
              <p className="text-xs text-gray-700"><strong>Assigned:</strong> {String(serverItem.assigned_to ?? 'Unknown')}</p>
              <p className="text-xs text-gray-700 mt-1"><strong>Description:</strong> {String(serverItem.description ?? 'Unknown')}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>Decide Later</Button>
          <div className="flex gap-2">
            <Button variant="destructive" onClick={() => onResolve('keep_server')}>Keep Server</Button>
            <Button className="bg-brand-500" onClick={() => onResolve('keep_local')}>Keep Local</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
