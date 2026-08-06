import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { LayoutDashboard, FolderKanban, FileText, LogOut } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/documents', label: 'Documents', icon: FileText },
];

export function AppShell() {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen bg-surface-base">
      <aside className="w-64 border-r border-surface-border bg-white flex flex-col">
        <div className="p-4 text-lg font-semibold text-brand-900">BuildPolaris</div>
        <nav className="flex-1 px-2 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  isActive ? 'bg-brand-500 text-white' : 'text-brand-900 hover:bg-brand-50'
                }`}>
              <Icon size={16} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-surface-border">
          <div className="text-sm text-gray-600 mb-2 truncate">{user?.email || 'Guest'}</div>
          <button onClick={() => logout()} className="flex items-center gap-2 text-sm text-red-600 hover:underline">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}