import { AlertTriangle } from 'lucide-react';

export function CopilotUnavailableBanner() {
  return (
    <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 flex items-center gap-2 mb-4">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>Copilot is currently unavailable. Core platform functions remain fully operational (NFR-SCALE.5).</span>
    </div>
  );
}
