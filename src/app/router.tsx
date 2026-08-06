import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { AppShell } from './AppShell';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/dashboard" replace />; // Stubbed auth bypass for chore
  return <>{children}</>;
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-brand-900">{title}</h1>
      <p className="text-gray-500">Feature implementation begins after BFF endpoints are established.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard><AppShell /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Placeholder title="Dashboard" /> },
      { path: 'projects/*', element: <Placeholder title="Projects" /> },
      { path: 'documents/*', element: <Placeholder title="Documents" /> },
    ],
  },
]);