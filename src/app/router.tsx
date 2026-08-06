import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from './AppShell'
import { AuthGuard } from './AuthGuard'
import { LoginPage } from '@/features/auth/LoginPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ProjectsListPage } from '@/features/projects/ProjectsListPage'
import { NewProjectPage } from '@/features/projects/NewProjectPage'
import { TaskListPage } from '@/features/tasks/TaskListPage'
import { BudgetPage } from '@/features/budget/BudgetPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { SearchPage } from '@/features/search/SearchPage'
import { AdminPage } from '@/features/admin/AdminPage'
import { DailyLogPage } from '@/features/field/DailyLogPage'
import { RequestsPage } from '@/features/requests/RequestsPage'
import { PunchListPage } from '@/features/punch-list/PunchListPage'
import { NotFoundPage } from './NotFoundPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/projects', element: <ProjectsListPage /> },
          { path: '/projects/new', element: <NewProjectPage /> },
          { path: '/projects/:projectId', element: <TaskListPage /> },
          { path: '/budget', element: <BudgetPage /> },
          { path: '/reports', element: <ReportsPage /> },
          { path: '/search', element: <SearchPage /> },
          { path: '/admin', element: <AdminPage /> },
          { path: '/field', element: <DailyLogPage /> },
          { path: '/requests', element: <RequestsPage /> },
          { path: '/punch-list', element: <PunchListPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])