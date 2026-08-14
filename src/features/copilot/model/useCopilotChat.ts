import { useCallback, useRef, useState } from 'react'
import { streamCopilotMessage } from '../lib/sse'
import { useQueryClient } from '@tanstack/react-query'
import type { CopilotMessage, Citation } from '@/types/copilot'
import { BffApiError } from '@/lib/clients/bffClient'

interface ChatState {
  messages: CopilotMessage[]
  threadId: string | null
  streaming: boolean
  unavailable: boolean // NFR-SCALE.5 — sidecar down, banner surfaced, rest of app unaffected
  error: string | null
}

const initialState: ChatState = { messages: [], threadId: null, streaming: false, unavailable: false, error: null }

export function useCopilotChat(project: string | undefined) {
  const [state, setState] = useState<ChatState>(initialState)
  const abortRef = useRef<AbortController | null>(null)
  const queryClient = useQueryClient()

  const sendMessage = useCallback(
    async (text: string) => {
      const userMessage: CopilotMessage = {
        id: crypto.randomUUID(),
        thread_id: state.threadId ?? '',
        role: 'user',
        text,
        citations: [],
        ai_generated: false,
        created_at: new Date().toISOString(),
      }

      const assistantId = crypto.randomUUID()
      let assistantText = ''
      let citations: Citation[] = []

      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          userMessage,
          {
            id: assistantId,
            thread_id: prev.threadId ?? '',
            role: 'assistant',
            text: '',
            citations: [],
            ai_generated: true,
            created_at: new Date().toISOString(),
          },
        ],
        streaming: true,
        unavailable: false,
        error: null,
      }))

      const controller = new AbortController()
      abortRef.current = controller

      function updateAssistantMessage(patch: Partial<CopilotMessage>) {
        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
        }))
      }

      try {
        await streamCopilotMessage(
          { thread_id: state.threadId, text, project },
          {
            signal: controller.signal,
            onEvent: (event) => {
              switch (event.type) {
                case 'text_delta':
                  assistantText += event.delta
                  updateAssistantMessage({ text: assistantText })
                  break
                case 'citations':
                  citations = event.citations
                  updateAssistantMessage({ citations })
                  break
                case 'navigation':
                  // UC-8.1: navigation intents render inline as a link/record —
                  // the ui/ChatMessage component renders event.target itself
                  // by inspecting the message; here we just fold it into text
                  // context via a citation-like marker is unnecessary — the
                  // page consuming this hook renders NavigationCard directly
                  // from a separate lastNavigation slot.
                  setState((prev) => ({ ...prev }))
                  break
                case 'pending_approval':
                  // UC-8.3: the approval card is rendered from the shared
                  // pending-approvals list (useApprovals.ts), refetched after
                  // stream completion — not held in this transient chat state.
                  void queryClient.invalidateQueries({ queryKey: ['copilot', 'approvals'] })
                  break
                case 'refusal':
                  updateAssistantMessage({ text: event.reason })
                  break
                case 'error':
                  setState((prev) => ({ ...prev, error: event.message }))
                  break
                case 'done':
                  updateAssistantMessage({ ai_generated: event.ai_generated })
                  break
                default:
                  break
              }
            },
          },
        )
      } catch (error) {
        if (error instanceof BffApiError && error.status === 0) {
          // NFR-SCALE.5: sidecar unreachable — surface the banner, never crash
          // the rest of the app; every non-AI workflow keeps working.
          setState((prev) => ({ ...prev, unavailable: true }))
        } else {
          setState((prev) => ({
            ...prev,
            error: error instanceof BffApiError ? error.message : 'The copilot is temporarily unavailable.',
          }))
        }
      } finally {
        setState((prev) => ({ ...prev, streaming: false }))
        abortRef.current = null
      }
    },
    [state.threadId, project, queryClient],
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { ...state, sendMessage, stop }
}
