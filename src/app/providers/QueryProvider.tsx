import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { BffApiError } from '@/lib/clients/bffClient'

// Offline-aware defaults: BFF calls fail fast on network errors (status 0) so
// TanStack Query's own retry doesn't fight with SyncEngine's own reconnect
// listener for non-field-execution reads (dashboards, approvals, financials —
// everything outside the 4 RxDB collections uses this cache, per ARCH §3.2).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (error instanceof BffApiError && error.status !== 0 && error.status < 500) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export { queryClient }
