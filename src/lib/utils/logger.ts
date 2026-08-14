// Structured logging (NFR-OBS.1): "All three components must emit structured
// logs (not print statements) with a correlation/trace ID that follows a
// request across the PWA -> BFF -> AI sidecar boundary." createTraceId() is the
// PWA's half of that; bffClient.ts attaches it as X-Trace-Id on every request.

/* eslint-disable no-console */

export function createTraceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogPayload {
  [key: string]: unknown
}

function writeLog(level: LogLevel, event: string, payload: LogPayload) {
  const entry = { ts: new Date().toISOString(), level, event, ...payload }
  const line = JSON.stringify(entry)
  if (level === 'error') console.error('[BuildPolaris]', line)
  else if (level === 'warn') console.warn('[BuildPolaris]', line)
  else console.info('[BuildPolaris]', line)
}

export const logger = {
  debug: (event: string, payload: LogPayload = {}) => writeLog('debug', event, payload),
  info: (event: string, payload: LogPayload = {}) => writeLog('info', event, payload),
  warn: (event: string, payload: LogPayload = {}) => writeLog('warn', event, payload),
  error: (event: string, payload: LogPayload = {}) => writeLog('error', event, payload),
}
