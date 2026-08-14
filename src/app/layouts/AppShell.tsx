import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/model/AuthContext';
import { useProject } from '@/features/projects/model/ProjectContext';
import { OfflineBanner } from '@/lib/ui/OfflineBanner';
import { LogOut, FolderKanban, ClipboardList, Bot, LayoutDashboard, Wallet, CalendarRange, FileText, PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppShell() {
  const { user, logout } = useAuth();
  const { projects, projectId, setProjectId } = useProject();

  if (!user) return <Navigate to="/login" replace />;

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/scheduling', icon: CalendarRange, label: 'Schedule' },
    { to: '/field', icon: ClipboardList, label: 'Field' },
    { to: '/financials', icon: Wallet, label: 'Financials' },
    { to: '/documents', icon: FileText, label: 'Documents' },
    { to: '/closeout', icon: PackageCheck, label: 'Closeout' },
    { to: '/copilot', icon: Bot, label: 'Copilot' },
  ];

  return (
    <div className="flex min-h-screen bg-surface-base">
      <aside className="hidden w-64 flex-col border-r border-surface-border bg-white md:flex">
        <div className="p-4 text-lg font-semibold text-brand-900">BuildPolaris</div>
        <div className="px-4 pb-2 text-xs text-gray-500">
          {user.company} · <span className="capitalize">{user.persona.replace('_', ' ')}</span>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn('flex items-center gap-2 rounded-md px-3 py-2 text-sm', isActive ? 'bg-brand-500 text-white' : 'text-brand-900 hover:bg-brand-50')
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-surface-border p-4">
          <button onClick={() => void logout()} className="flex items-center gap-2 text-sm text-red-600 hover:underline">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-surface-border bg-white px-4 py-3">
          {projects.length > 0 && (
            <select
              className="h-9 rounded-lg border border-input bg-white px-2 text-sm"
              value={projectId ?? ''}
              onChange={(e) => setProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.name} value={p.name}>{p.title || p.name}</option>
              ))}
            </select>
          )}
        </header>
        <OfflineBanner />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
