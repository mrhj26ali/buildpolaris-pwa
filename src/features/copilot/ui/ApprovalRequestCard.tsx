import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, XCircle, Bot } from 'lucide-react';
import { bffRequest } from '@/lib/clients/bffClient';
import { AIDisclosureBadge } from './AIDisclosureBadge';

interface Props {
  gateId: string;
  agentType: string;
  proposedPayload: Record<string, unknown>;
  confidence: number;
  onResolved: () => void;
}

export function ApprovalRequestCard({ gateId, agentType, proposedPayload, confidence, onResolved }: Props) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(false);

  const handleDecision = async (decision: 'approve' | 'reject') => {
    setLoading(true);
    try {
      // Proxied through BFF. Routes to Agent Action Approval gate (ERD §3.6)
      await bffRequest('/method/buildpolaris_bff.api.ai_copilot.approval_service.resolve_approval', {
        method: 'POST',
        body: JSON.stringify({ approval_id: gateId, decision }),
      });
      setStatus(decision === 'approve' ? 'approved' : 'rejected');
      onResolved();
    } catch (err) {
      console.error('Failed to resolve approval', err);
    } finally {
      setLoading(false);
    }
  };

  const isPending = status === 'pending';

  return (
    <Card className={`border-2 ${isPending ? 'border-yellow-300 bg-yellow-50' : status === 'approved' ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4" />
            {agentType.replace('_', ' ')} Action Request
          </CardTitle>
          <AIDisclosureBadge />
        </div>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <p className="text-gray-700">The AI proposes the following {String(proposedPayload.target_doctype ?? 'record')} mutation:</p>
        <pre className="bg-white/50 p-2 rounded border border-gray-200 overflow-x-auto text-[10px] text-gray-800">
          {JSON.stringify(proposedPayload.payload, null, 2)}
        </pre>
        <p className="text-gray-500">Confidence: {Math.round(confidence * 100)}%</p>
      </CardContent>
      {isPending && (
        <CardFooter className="flex justify-end gap-2 pt-0">
          <Button size="sm" variant="outline" disabled={loading} onClick={() => handleDecision('reject')}>
            <XCircle className="h-3 w-3 mr-1" /> Reject
          </Button>
          <Button size="sm" className="bg-brand-500" disabled={loading} onClick={() => handleDecision('approve')}>
            <ShieldCheck className="h-3 w-3 mr-1" /> Approve & Execute
          </Button>
        </CardFooter>
      )}
      {!isPending && (
        <CardContent className="pt-0 text-xs font-semibold text-gray-700">
          {status === 'approved' ? '✓ Approved and executed.' : '✗ Rejected by user.'}
        </CardContent>
      )}
    </Card>
  );
}
