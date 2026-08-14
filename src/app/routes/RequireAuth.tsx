import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth/useAuth'

export function RequireAuth() {
  const { isAuthenticated, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return null // AuthProvider already renders the loading state

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
