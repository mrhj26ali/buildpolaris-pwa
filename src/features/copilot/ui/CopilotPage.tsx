import { useEffect, useRef } from 'react'
import { useProjectContext } from '@/app/providers/ProjectContext'
import { useCopilotChat } from '../model/useCopilotChat'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { CopilotUnavailableBanner } from './CopilotUnavailableBanner'
import { PendingApprovalsPanel } from './PendingApprovalsPanel'
import { EmptyState } from '@/lib/ui/States'
import { Sparkles } from 'lucide-react'

export default function CopilotPage() {
  const { activeProject } = useProjectContext()
  const chat = useCopilotChat(activeProject?.name)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [chat.messages])

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_320px]">
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <h1 className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-violet-600" aria-hidden="true" />
            Copilot
          </h1>
          <p className="text-sm text-muted-foreground">
            Scoped to what you can already see and do{activeProject ? ` in ${activeProject.title}` : ''}.
          </p>
        </div>

        {chat.unavailable && (
          <div className="p-4">
            <CopilotUnavailableBanner />
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          {chat.messages.length === 0 ? (
            <EmptyState
              title="Ask the copilot anything"
              description="Find a record, get a grounded answer with citations, or ask it to draft an RFI response."
              icon={<Sparkles className="h-8 w-8" aria-hidden="true" />}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {chat.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>
          )}
          {chat.error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {chat.error}
            </p>
          )}
        </div>

        <ChatInput onSend={(text) => void chat.sendMessage(text)} onStop={chat.stop} streaming={chat.streaming} />
      </div>

      <aside className="hidden overflow-y-auto border-l p-4 lg:block">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Pending approvals</h2>
        <PendingApprovalsPanel project={activeProject?.name} />
      </aside>
    </div>
  )
}
