import { bffStream } from '@/lib/clients/bffClient'
import { parseCopilotStreamEvent } from '@/lib/clients/aiClient'
import type { CopilotStreamEvent } from '@/types/copilot'

// ARCH §4.5: PWA -> BFF -> AI, streamed back through the BFF as SSE. This
// module is the only caller of bffStream for the copilot endpoint — every
// other copilot concern (rendering, approval UI, thread state) consumes the
// typed events this yields, never the raw wire format.
export async function streamCopilotMessage(
  request: { thread_id: string | null; text: string; project?: string },
  handlers: {
    onEvent: (event: CopilotStreamEvent) => void
    signal?: AbortSignal
  },
): Promise<void> {
  await bffStream('/method/buildpolaris_bff.ai_copilot.api.send_message', request, {
    signal: handlers.signal,
    onLine: (raw) => {
      const event = parseCopilotStreamEvent(raw)
      if (event) handlers.onEvent(event)
    },
  })
}
