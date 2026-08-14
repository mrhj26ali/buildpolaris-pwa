import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

// FR-8.9: "AI-generated content must be visually distinct and carry a
// persistent disclosure until a human confirms/edits it." Every copilot answer,
// draft, and pending-approval card is wrapped in this — never rendered as if it
// were a normal record.
export function AiDisclosureWrapper({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative rounded-lg border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-900 dark:bg-violet-950/20',
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-violet-700 dark:text-violet-300">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        AI-generated
      </div>
      {children}
    </div>
  )
}
