import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { LoginPage } from '@/features/auth/ui/LoginPage';
import { FieldDashboard } from '@/features/field/ui/FieldDashboard';
import { CopilotChat } from '@/features/copilot/ui/CopilotChat';
import { SchedulingDashboard } from '@/features/scheduling/ui/SchedulingDashboard';
import { BudgetDashboard } from '@/features/financials/ui/BudgetDashboard';

const Placeholder = ({ title }: { title: string }) => <div className="p-4 text-gray-500">{title} module placeholder</div>;

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Placeholder title="Dashboard" /> },
      { path: 'projects', element: <Placeholder title="Projects" /> },
      { path: 'field', element: <FieldDashboard /> },
      { path: 'scheduling', element: <SchedulingDashboard /> },
      { path: 'financials', element: <BudgetDashboard /> },
      { path: 'documents', element: <Placeholder title="Document Control" /> },
      { path: 'closeout', element: <Placeholder title="Closeout" /> },
      { path: 'copilot', element: <CopilotChat /> },
    ],
  },
]);
