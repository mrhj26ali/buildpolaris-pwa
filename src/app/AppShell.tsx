import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import {
  LayoutDashboard, FolderKanban, FileText, Wallet, BarChart3, Users, ClipboardList, Sparkles, Search,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/field', label: 'Daily Logs', icon: ClipboardList },
  { to: '/punch-list', label: 'Punch List', icon: ClipboardList },
  { to: '/requests', label: 'Requests', icon: ClipboardList },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/budget', label: 'Budget', icon: Wallet },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/admin', label: 'Admin', icon: Users },
]
const aiNavItems = [
  { to: '/ai/productivity', label: 'Productivity (AI)' },
  { to: '/ai/scheduling', label: 'Scheduling (AI)' },
  { to: '/ai/assistant', label: 'Assistant (AI)' },
]

export function AppShell() {
  const { user, logout } = useAuth()
  return (
    <div className="flex min-h-screen bg-surface-base">
      <aside className="w-64 border-r border-surface-border bg-white flex flex-col">
        <div className="p-4 text-lg font-semibold text-brand-900">Construction PM</div>
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
          <div className="pt-4 mt-4 border-t border-surface-border">
            <p className="px-3 pb-1 text-xs uppercase text-gray-400 flex items-center gap-1">
              <Sparkles size={12} /> AI (coming soon)
            </p>
            {aiNavItems.map((item) => (
              <div key={item.to} className="px-3 py-2 text-sm text-gray-400 cursor-not-allowed">
                {item.label}
              </div>
            ))}
          </div>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-surface-border bg-white flex items-center justify-between px-6">
          <div />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-brand-900">{user?.email}</span>
            <button onClick={() => logout()} className="text-status-overdue hover:underline">Sign out</button>
          </div>
        </header>
        <main className="flex-1 p-6"><Outlet /></main>
      </div>
    </div>
  )
}