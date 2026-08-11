/* eslint-disable react-refresh/only-export-components */

import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { ActivatePage } from '@/features/auth/ActivatePage'
import { AppShell } from './AppShell'
import { AdminGuard } from './AdminGuard'
import { PlaceholderPage } from './PlaceholderPage'
import { UsersPage } from '@/features/admin/UsersPage'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/activate', element: <ActivatePage /> },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <PlaceholderPage title="Dashboard" /> },
      { path: 'projects/*', element: <PlaceholderPage title="Projects" /> },
      { path: 'tasks/*', element: <PlaceholderPage title="Tasks" /> },
      { path: 'field/*', element: <PlaceholderPage title="Daily Logs" /> },
      { path: 'punch-list/*', element: <PlaceholderPage title="Punch List" /> },
      { path: 'documents/*', element: <PlaceholderPage title="Documents" /> },
      { path: 'requests/*', element: <PlaceholderPage title="Requests (RFI/Submittals)" /> },
      { path: 'budget/*', element: <PlaceholderPage title="Budget & Financials" /> },
      { path: 'reports/*', element: <PlaceholderPage title="Reports" /> },
      { path: 'search', element: <PlaceholderPage title="Global Search" /> },
      {
        path: 'admin',
        element: <AdminGuard />,
        children: [
          { path: 'users', element: <UsersPage /> },
          { path: '*', element: <PlaceholderPage title="Administration" /> },
        ],
      },
    ],
  },
])



