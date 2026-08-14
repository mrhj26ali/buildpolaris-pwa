import { useEffect, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth/useAuth'
import { LoadingState } from '@/lib/ui/States'

// FR-1.5: session context resolved once at app bootstrap, cached in
// authStore.ts. This provider's only job is to trigger that resolution before
// rendering routes — RequireAuth.tsx (in app/routes) handles per-route gating.
export function AuthProvider({ children }: { children: ReactNode }) {
  const { status, bootstrap } = useAuth()

  useEffect(() => {
    void bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState label="Loading BuildPolaris…" />
      </div>
    )
  }

  return <>{children}</>
}
