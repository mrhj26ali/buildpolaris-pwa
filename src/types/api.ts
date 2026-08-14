// Wire-level shapes for the buildpolaris_bff response envelope (ARCH §4.1).
// Frappe wraps whitelisted-method responses in { message: ... }; BuildPolaris's
// own endpoints additionally use a { success, data, message, error_code } envelope.
// lib/clients/bffClient.ts unwraps both layers so feature code only ever sees `data`.

export interface BffEnvelope<T> {
  success: boolean
  data: T | null
  message: string
  error_code?: string
}

export interface BffErrorBody {
  error?: {
    code?: string
    message?: string
    details?: Record<string, unknown>
    request_id?: string
  }
  _server_messages?: string
  message?: unknown
  exception?: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}
