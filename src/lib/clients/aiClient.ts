// IMPORTANT — read before adding a fetch() call here.
//
// Per ARCH §4.2: "buildpolaris_ai is never exposed to the public internet
// directly... this is what UC-8.1's own sequence diagram shows: PWA -> BFF -> AI,
// never PWA -> AI." There is no browser-to-AI-sidecar network path anywhere in
// this platform. This module is therefore NOT a second HTTP client — it exists
// only to hold the typed request/response shapes for the copilot's streamed
// payload, which features/copilot/lib/sse.ts imports for typing its parsed SSE
// events. All actual network I/O for the copilot goes through bffClient.ts's
// bffStream() against a buildpolaris_bff endpoint (/api/method/.../copilot/message),
// which itself proxies buildpolaris_ai's SSE stream (ARCH §4.5).
//
// If you find yourself about to add `fetch(AI_GATEWAY_URL...)` here, stop — that
// would violate NFR-SCALE.5's network-level enforcement ("if buildpolaris_ai is
// unreachable, the PWA never even attempts to reach it"). Add a bffClient.ts
// function instead.

import type { CopilotStreamEvent } from '@/types/copilot'

export interface CopilotMessageRequest {
  thread_id: string | null
  text: string
  project?: string
}

export type { CopilotStreamEvent }

export function parseCopilotStreamEvent(raw: string): CopilotStreamEvent | null {
  try {
    return JSON.parse(raw) as CopilotStreamEvent
  } catch {
    return null
  }
}
