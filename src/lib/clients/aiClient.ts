const AI_GATEWAY_URL = (import.meta.env.VITE_AI_GATEWAY_URL ?? '').replace(/\/$/, '')

export class AiClientError extends Error {
  readonly status: number | undefined

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AiClientError'
    this.status = status
  }
}

export interface AiCitation {
  source_id: string
  span: string
}

export interface AnswerEvent {
  type: 'answer'
  text_delta: string
  citations?: AiCitation[]
}

export interface ToolResultEvent {
  type: 'tool_result'
  tool_name: string
  result: Record<string, unknown>
}

export interface PendingApprovalEvent {
  type: 'pending_approval'
  gate_id: string
  agent_type: string
  proposed_payload: Record<string, unknown>
  confidence: number
}

export type AiStreamEvent = AnswerEvent | ToolResultEvent | PendingApprovalEvent

function parseSseSegment(segment: string): AiStreamEvent | null {
  let dataBuffer = ''
  for (const line of segment.split(/\r?\n/)) {
    if (line.startsWith('data:')) {
      dataBuffer += line.slice(5).trim()
    }
  }
  if (dataBuffer === '') return null
  try {
    return JSON.parse(dataBuffer) as AiStreamEvent
  } catch {
    return null
  }
}

export async function aiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${AI_GATEWAY_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.headers ?? {}),
      },
    })
  } catch {
    throw new AiClientError('The AI gateway is unreachable.')
  }
  if (!response.ok) {
    throw new AiClientError(`The AI request failed with status ${response.status}.`, response.status)
  }
  return (await response.json()) as T
}

export interface AiStreamOptions {
  signal?: AbortSignal
  authToken?: string
  onEvent?: (event: AiStreamEvent) => void
}

export async function streamAiRequest(
  path: string,
  payload: unknown,
  options: AiStreamOptions = {},
): Promise<AiStreamEvent[]> {
  let response: Response
  try {
    response = await fetch(`${AI_GATEWAY_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(options.authToken ? { Authorization: `Bearer ${options.authToken}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: options.signal,
    })
  } catch {
    throw new AiClientError('The AI gateway is unreachable.')
  }
  if (!response.ok) {
    throw new AiClientError(`The AI stream failed with status ${response.status}.`, response.status)
  }
  if (!response.body) {
    throw new AiClientError('The AI gateway did not return a readable stream.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const events: AiStreamEvent[] = []
  let carry = ''

  const drainSegment = (segment: string) => {
    const event = parseSseSegment(segment)
    if (event) {
      events.push(event)
      options.onEvent?.(event)
    }
  }

  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    const text = carry + decoder.decode(value, { stream: true })
    const segments = text.split(/\r?\n\r?\n/)
    carry = segments.pop() ?? ''
    for (const segment of segments) {
      drainSegment(segment)
    }
  }
  if (carry.trim() !== '') {
    drainSegment(carry)
  }
  return events
}

export async function getAiAgents() {
  return aiRequest<{ agents: Array<{ id: string; name: string; description?: string }> }>('/agents', {
    method: 'GET',
  })
}
