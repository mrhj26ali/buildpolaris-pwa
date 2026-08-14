// ARCH §3.2: "SyncEngine.ts drains the outbox on a reconnectListener.ts-detected
// connectivity change (and periodically as a fallback, since navigator.onLine is
// not fully reliable)." This module owns both signals; SyncEngine subscribes to
// one callback rather than wiring browser events itself.

const FALLBACK_INTERVAL_MS = 30000

export interface ReconnectListenerHandle {
  stop: () => void
}

export function startReconnectListener(onReconnectSignal: () => void): ReconnectListenerHandle {
  const handleOnline = () => onReconnectSignal()

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline)
  }

  const interval =
    typeof window !== 'undefined'
      ? window.setInterval(() => {
          if (navigator.onLine) onReconnectSignal()
        }, FALLBACK_INTERVAL_MS)
      : null

  return {
    stop: () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline)
        if (interval !== null) window.clearInterval(interval)
      }
    },
  }
}

export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}
