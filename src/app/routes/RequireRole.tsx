import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth/useAuth'
import type { FrappeRole } from '@/types/domain'

// Client-side gating is a UX convenience only (hide the nav item, redirect away
// from the screen) — REQ's own NFR-SEC principle is that authorization is
// always re-checked server-side per request. This component never substitutes
// for that; it just avoids showing a screen the BFF would reject anyway.
export function RequireRole({ roles, children }: { roles: FrappeRole[]; children: ReactNode }) {
  const { session, isAdmin } = useAuth()

  const allowed = isAdmin || session?.roles.some((r) => roles.includes(r))

  if (!allowed) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
