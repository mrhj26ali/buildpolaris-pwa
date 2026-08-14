// Copilot wire types. Per ARCH §4.2/§4.5, the PWA never talks to buildpolaris_ai
// directly — every one of these shapes crosses PWA <-> BFF only; the BFF proxies
// the AI sidecar's SSE stream through to the PWA.

export type CopilotIntent = 'navigation' | 'grounded_question' | 'tool_call' | 'proposed_write'

export interface Citation {
  source_doctype: string
  source_name: string // e.g. "RFI-0042" — human-meaningful, per ERD §4.2
  span_start: number
  span_end: number
  quoted_span: string
}

export interface CopilotMessage {
  id: string
  thread_id: string
  role: 'user' | 'assistant'
  text: string
  citations: Citation[]
  ai_generated: boolean // FR-8.9 — persistent disclosure flag
  created_at: string
}

export interface CopilotThread {
  id: string
  title: string
  created_at: string
  updated_at: string
}

// SSE event union streamed BFF -> PWA (ARCH §4.5)
export interface TextDeltaEvent {
  type: 'text_delta'
  delta: string
}

export interface CitationsEvent {
  type: 'citations'
  citations: Citation[]
}

export interface NavigationEvent {
  type: 'navigation'
  target: { label: string; path: string }
}

export interface ToolResultEvent {
  type: 'tool_result'
  tool_name: string
  summary: string
}

export interface PendingApprovalEvent {
  type: 'pending_approval'
  approval_id: string
  agent_type: string
  target_doctype: string
  proposed_payload: Record<string, unknown>
  model_version: string
  confidence: number
  tool_trace_id: string
}

export interface RefusalEvent {
  type: 'refusal'
  reason: string
}

export interface DoneEvent {
  type: 'done'
  ai_generated: boolean
}

export interface ErrorEvent {
  type: 'error'
  message: string
}

export type CopilotStreamEvent =
  | TextDeltaEvent
  | CitationsEvent
  | NavigationEvent
  | ToolResultEvent
  | PendingApprovalEvent
  | RefusalEvent
  | DoneEvent
  | ErrorEvent

// Agent Action Approval (ERD §3.6) — the single shared gate primitive, NFR-EXT.3
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected'

export interface AgentActionApproval {
  name: string
  agent_type: string
  target_doctype: string
  proposed_payload: Record<string, unknown>
  model_version: string
  confidence: number
  tool_trace_id: string
  status: ApprovalStatus
  approver: string | null
  decided_at: string | null
  idempotency_key: string
}
