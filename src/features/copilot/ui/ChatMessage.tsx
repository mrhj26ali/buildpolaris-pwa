import { AiDisclosureWrapper } from '@/lib/ui/AiDisclosureWrapper'
import { cn } from '@/lib/utils'
import type { CopilotMessage } from '@/types/copilot'

export function ChatMessage({ message }: { message: CopilotMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        <AiDisclosureWrapper>
          <p className="whitespace-pre-wrap text-sm">{message.text || '…'}</p>
          {message.citations.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5 border-t border-violet-200 pt-3 dark:border-violet-900">
              <p className="text-xs font-medium text-violet-700 dark:text-violet-300">Sources</p>
              {message.citations.map((citation, i) => (
                <div
                  key={`${citation.source_name}-${i}`}
                  className="rounded border border-violet-200 bg-white/60 px-2 py-1.5 text-xs dark:border-violet-900 dark:bg-black/20"
                >
                  <span className="font-medium">{citation.source_name}</span>
                  <span className={cn('ml-1 text-muted-foreground')}>· {citation.source_doctype}</span>
                </div>
              ))}
            </div>
          )}
        </AiDisclosureWrapper>
      </div>
    </div>
  )
}
