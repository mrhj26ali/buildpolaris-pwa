/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { ActivatePage } from '@/features/auth/ActivatePage'
import { useProject } from '@/features/projects/ProjectContext'
import { AppShell } from './AppShell'
import { AuthGuard } from './AuthGuard'
import { AdminGuard } from './AdminGuard'
import { NotFoundPage } from './NotFoundPage'
import { PlaceholderPage } from './PlaceholderPage'
import { DashboardPage } from './DashboardPage'
import { ProjectsListPage } from '@/features/projects/ProjectsListPage'
import { UsersPage } from '@/features/admin/UsersPage'
import { FieldDashboard } from '@/features/field'
import { BudgetDashboard, EvmDashboard } from '@/features/financials'
import { CommunicationsDashboard } from '@/features/communications'
import { DocumentRegister } from '@/features/documents'
import { CloseoutDashboard } from '@/features/closeout'
import { SchedulingDashboard } from '@/features/scheduling/ui/SchedulingDashboard'
import { CopilotPanel } from '@/features/copilot/CopilotPanel'

function ProjectRoute({ children }: { children: (projectId: string) => React.ReactNode }) {
  const { projectId } = useProject()
  const { t } = useTranslation()
  if (!projectId) {
    return <PlaceholderPage title={t('project.selectTitle')} body={t('project.noProjects')} />
  }
  return <>{children(projectId)}</>
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
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'projects', element: <ProjectsListPage /> },
      { path: 'tasks/*', element: <PlaceholderPage title="Tasks" /> },
      { path: 'field/*', element: <ProjectRoute>{(pid) => <FieldDashboard projectId={pid} />}</ProjectRoute> },
      { path: 'punch-list/*', element: <ProjectRoute>{(pid) => <FieldDashboard projectId={pid} />}</ProjectRoute> },
      { path: 'documents/*', element: <ProjectRoute>{(pid) => <DocumentRegister projectId={pid} />}</ProjectRoute> },
      { path: 'requests/*', element: <ProjectRoute>{(pid) => <CommunicationsDashboard project={pid} />}</ProjectRoute> },
      { path: 'budget/*', element: <ProjectRoute>{(pid) => <BudgetDashboard projectId={pid} />}</ProjectRoute> },
      { path: 'reports/*', element: <ProjectRoute>{(pid) => <EvmDashboard project={pid} />}</ProjectRoute> },
      { path: 'closeout/*', element: <ProjectRoute>{(pid) => <CloseoutDashboard projectId={pid} />}</ProjectRoute> },
      { path: 'scheduling/*', element: <ProjectRoute>{(pid) => <SchedulingDashboard projectId={pid} />}</ProjectRoute> },
      { path: 'copilot', element: <CopilotPanel /> },
      { path: 'search', element: <PlaceholderPage title="Global Search" /> },
      {
        path: 'admin',
        element: <AdminGuard />,
        children: [
          { path: 'users', element: <UsersPage /> },
          { path: '*', element: <PlaceholderPage title="Administration" /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
