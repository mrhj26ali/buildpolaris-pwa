import type { BffEnvelope, BffErrorBody } from '@/types/api'

// Unwraps Frappe's own { message: ... } RPC envelope, then BuildPolaris's own
// { success, data, message, error_code } envelope where present (ARCH §3.1 —
// "a Document object's .as_dict() IS the JSON-serializable wire format").
// Two layers, one function, so bffClient.ts's request path stays linear.

export function unwrapFrappeEnvelope(jsonBody: unknown): unknown {
  if (jsonBody && typeof jsonBody === 'object' && 'message' in jsonBody) {
    return (jsonBody as { message: unknown }).message
  }
  return jsonBody
}

export function isBffEnvelope(payload: unknown): payload is BffEnvelope<unknown> {
  return (
    !!payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    'data' in payload
  )
}

export function extractServerMessage(body: BffErrorBody | undefined, rawText: string): string | undefined {
  if (!body) return rawText.substring(0, 500) || undefined

  if (body._server_messages) {
    try {
      const parsed: unknown = JSON.parse(String(body._server_messages))
      if (Array.isArray(parsed)) {
        return parsed
          .map((entry) => {
            if (entry && typeof entry === 'object' && 'message' in entry) {
              return String((entry as { message: unknown }).message)
            }
            return String(entry)
          })
          .join(', ')
      }
      return String(body._server_messages)
    } catch {
      return String(body._server_messages)
    }
  }

  if (typeof body.message === 'string') return body.message
  if (body.message !== undefined) return JSON.stringify(body.message)
  if (body.exception) return body.exception

  return rawText.substring(0, 500) || undefined
}
