import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from '@/app/layouts/AppShell'
import { RequireAuth } from './RequireAuth'
import { RequireRole } from './RequireRole'
import { LoadingState } from '@/lib/ui/States'

const LoginPage = lazy(() => import('@/features/identity/ui/LoginPage'))
const RegisterTenantPage = lazy(() => import('@/features/identity/ui/RegisterTenantPage'))
const ActivateAccountPage = lazy(() => import('@/features/identity/ui/ActivateAccountPage'))
const DashboardPage = lazy(() => import('@/features/projects/ui/DashboardPage'))
const TeamPage = lazy(() => import('@/features/identity/ui/TeamPage'))
const SchedulePage = lazy(() => import('@/features/scheduling/ui/SchedulePage'))
const FinancialsPage = lazy(() => import('@/features/financials/ui/FinancialsPage'))
const CommunicationsPage = lazy(() => import('@/features/communications/ui/CommunicationsPage'))
const DocumentsPage = lazy(() => import('@/features/document_control/ui/DocumentsPage'))
const FieldPage = lazy(() => import('@/features/field/ui/FieldPage'))
const CloseoutPage = lazy(() => import('@/features/closeout/ui/CloseoutPage'))
const CopilotPage = lazy(() => import('@/features/copilot/ui/CopilotPage'))
const NotFoundPage = lazy(() => import('./NotFoundPage'))

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<LoadingState />}>{node}</Suspense>
}

const router = createBrowserRouter([
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/register', element: withSuspense(<RegisterTenantPage />) },
  { path: '/activate', element: withSuspense(<ActivateAccountPage />) },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: withSuspense(<DashboardPage />) },
          { path: 'dashboard', element: withSuspense(<DashboardPage />) },
          { path: 'schedule', element: withSuspense(<SchedulePage />) },
          {
            path: 'financials',
            element: (
              <RequireRole roles={['Admin', 'Owner', 'Project Manager', 'Accounting']}>
                {withSuspense(<FinancialsPage />)}
              </RequireRole>
            ),
          },
          { path: 'communications', element: withSuspense(<CommunicationsPage />) },
          { path: 'documents', element: withSuspense(<DocumentsPage />) },
          { path: 'field', element: withSuspense(<FieldPage />) },
          {
            path: 'closeout',
            element: (
              <RequireRole roles={['Admin', 'Owner', 'Project Manager']}>
                {withSuspense(<CloseoutPage />)}
              </RequireRole>
            ),
          },
          {
            path: 'team',
            element: (
              <RequireRole roles={['Admin', 'Owner']}>{withSuspense(<TeamPage />)}</RequireRole>
            ),
          },
          { path: 'copilot', element: withSuspense(<CopilotPage />) },
          { path: '*', element: withSuspense(<NotFoundPage />) },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
