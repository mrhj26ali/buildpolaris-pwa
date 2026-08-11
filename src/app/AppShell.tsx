import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import {
  BarChart3, CheckSquare, ClipboardList, FileText, FolderKanban,
  LayoutDashboard, MessagesSquare, Users, Wallet, LogOut,
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, personas: ['admin', 'pm', 'site_super', 'subcontractor', 'owner'] },
  { to: '/projects', label: 'Projects', icon: FolderKanban, personas: ['admin', 'pm', 'site_super'] },
  { to: '/field', label: 'Daily Logs', icon: ClipboardList, personas: ['admin', 'pm', 'site_super'] },
  { to: '/punch-list', label: 'Punch List', icon: CheckSquare, personas: ['admin', 'pm', 'site_super', 'subcontractor'] },
  { to: '/documents', label: 'Documents', icon: FileText, personas: ['admin', 'pm', 'site_super', 'subcontractor'] },
  { to: '/requests', label: 'Requests', icon: MessagesSquare, personas: ['admin', 'pm', 'site_super', 'subcontractor'] },
  { to: '/budget', label: 'Budget', icon: Wallet, personas: ['admin', 'pm', 'owner'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, personas: ['admin', 'pm', 'owner'] },
  { to: '/admin/users', label: 'User Management', icon: Users, personas: ['admin'] },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const persona = user?.persona ?? 'guest'
  const items = NAV.filter((n) => n.personas.includes(persona))

  return (
    <div className="flex min-h-screen bg-surface-base">
      <aside className="flex w-64 flex-col border-r border-surface-border bg-white">
        <div className="p-4 text-lg font-semibold text-brand-900">BuildPolaris</div>
        <div className="px-4 pb-2 text-xs text-gray-500">
          {user?.company ?? ''} Â· <span className="capitalize">{persona.replace('_', ' ')}</span>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                  isActive ? 'bg-brand-500 text-white' : 'text-brand-900 hover:bg-brand-50'
                }`}>
              <Icon size={16} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-surface-border p-4">
          <div className="mb-2 truncate text-sm text-gray-600">{user?.email ?? 'Guest'}</div>
          <button onClick={() => logout()} className="flex items-center gap-2 text-sm text-red-600 hover:underline">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}



