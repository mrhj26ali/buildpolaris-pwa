import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'

export function AdminGuard() {
  const { user } = useAuth()
  if (user?.persona !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}



