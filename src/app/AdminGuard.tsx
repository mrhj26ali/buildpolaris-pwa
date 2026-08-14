import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'

const ADMIN_ROLE = 'BuildPolaris Admin'

export function AdminGuard() {
  const { user } = useAuth()
  const isAdmin = Boolean(user?.isAdmin) || Boolean(user?.roles?.includes(ADMIN_ROLE))
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
