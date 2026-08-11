import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'

export function AuthGuard() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}



