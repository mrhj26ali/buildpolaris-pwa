import { Bot } from 'lucide-react';

export function AIDisclosureBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 border border-blue-200">
      <Bot className="h-3 w-3" />
      AI Generated
    </span>
  );
}
