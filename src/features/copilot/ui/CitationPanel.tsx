import { FileText, ExternalLink } from 'lucide-react';

interface Citation {
  source_id: string;
  span: string;
  doctype?: string;
}

interface Props {
  citations: Citation[];
}

export function CitationPanel({ citations }: Props) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-2 border-t border-gray-200 pt-2">
      <p className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
        <FileText className="h-3 w-3" /> Sources
      </p>
      <ul className="space-y-1">
        {citations.map((cite, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-gray-500 hover:text-brand-600 cursor-pointer">
            <span className="font-bold text-gray-700">[{idx + 1}]</span>
            <div className="flex-1">
              <span className="font-medium text-gray-800">{cite.source_id}</span>
              {cite.span && <span className="ml-1 text-gray-500">({cite.span})</span>}
            </div>
            <ExternalLink className="h-3 w-3 mt-0.5 shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}
