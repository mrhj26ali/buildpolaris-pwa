import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthContext'
import { useProject } from '@/features/projects/ProjectContext'
import { useOnlineStatus } from './useOnlineStatus'
import {
  BarChart3, CalendarRange, CheckSquare, ClipboardList, FileText, FolderKanban,
  LayoutDashboard, LogOut, MessagesSquare, PackageCheck, Users, Wallet, Bot,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
  personas: string[]
}

const NAV: NavItem[] = [
  { to: '/dashboard', labelKey: 'shell.nav.dashboard', icon: LayoutDashboard, personas: ['admin', 'pm', 'site_super', 'subcontractor', 'owner'] },
  { to: '/projects', labelKey: 'shell.nav.projects', icon: FolderKanban, personas: ['admin', 'pm', 'site_super'] },
  { to: '/scheduling', labelKey: 'shell.nav.scheduling', icon: CalendarRange, personas: ['admin', 'pm', 'site_super'] },
  { to: '/field', labelKey: 'shell.nav.field', icon: ClipboardList, personas: ['admin', 'pm', 'site_super'] },
  { to: '/punch-list', labelKey: 'shell.nav.punchList', icon: CheckSquare, personas: ['admin', 'pm', 'site_super', 'subcontractor'] },
  { to: '/documents', labelKey: 'shell.nav.documents', icon: FileText, personas: ['admin', 'pm', 'site_super', 'subcontractor'] },
  { to: '/requests', labelKey: 'shell.nav.requests', icon: MessagesSquare, personas: ['admin', 'pm', 'site_super', 'subcontractor'] },
  { to: '/budget', labelKey: 'shell.nav.budget', icon: Wallet, personas: ['admin', 'pm', 'owner'] },
  { to: '/reports', labelKey: 'shell.nav.reports', icon: BarChart3, personas: ['admin', 'pm', 'owner'] },
  { to: '/closeout', labelKey: 'shell.nav.closeout', icon: PackageCheck, personas: ['admin', 'pm', 'owner'] },
  { to: '/copilot', labelKey: 'Copilot', icon: Bot, personas: ['admin', 'pm', 'site_super', 'subcontractor', 'owner'] },
  { to: '/admin/users', labelKey: 'shell.nav.adminUsers', icon: Users, personas: ['admin'] },
]

function NavLinks({ items, orientation }: { items: NavItem[]; orientation: 'vertical' | 'horizontal' }) {
  const { t } = useTranslation()
  const layout = orientation === 'vertical' ? 'flex flex-col space-y-1' : 'flex gap-1 overflow-x-auto'
  
  return (
    <nav className={layout}>
      {items.map(({ to, labelKey, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex min-h-11 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-sm ${
              isActive ? 'bg-brand-500 text-white' : 'text-brand-900 hover:bg-brand-50'
            }`
          }
        >
          <Icon size={16} />
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppShell() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const { projects, projectId, setProjectId } = useProject()
  const online = useOnlineStatus()
  const persona = user?.persona ?? 'guest'
  const items = NAV.filter((n) => n.personas.includes(persona))

  return (
    <div className="flex min-h-screen bg-surface-base">
      <aside className="hidden w-64 flex-col border-r border-surface-border bg-white md:flex">
        <div className="p-4 text-lg font-semibold text-brand-900">{t('shell.appName')}</div>
        <div className="px-4 pb-2 text-xs text-gray-500">
          {user?.company ?? ''} · <span className="capitalize">{persona.replace('_', ' ')}</span>
        </div>
        <div className="flex-1 px-2">
          <NavLinks items={items} orientation="vertical" />
        </div>
        <div className="border-t border-surface-border p-4">
          <div className="mb-2 truncate text-sm text-gray-600">{user?.email ?? ''}</div>
          <button
            onClick={() => void logout()}
            className="flex min-h-11 items-center gap-2 text-sm text-red-600 hover:underline"
          >
            <LogOut size={14} /> {t('common.signOut')}
          </button>
        </div>
      </aside>
      
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-surface-border bg-white px-4 py-3">
          <span className="text-base font-semibold text-brand-900 md:hidden">{t('shell.appName')}</span>
          
          {projects.length > 0 && (
            <label className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">{t('shell.project')}</span>
              <select
                className="h-11 rounded-lg border border-input bg-white px-2 text-sm"
                value={projectId ?? ''}
                onChange={(e) => setProjectId(e.target.value)}
              >
                {projects.map((p) => (
                  <option key={p.name} value={p.name}>{p.title}</option>
                ))}
              </select>
            </label>
          )}
          
          <span
            className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
              online ? 'bg-green-100 text-status-ontrack' : 'bg-red-100 text-status-overdue'
            }`}
          >
            {online ? t('common.online') : t('common.offline')}
          </span>
          
          <button
            onClick={() => void logout()}
            className="flex min-h-11 items-center gap-2 text-sm text-red-600 hover:underline md:hidden"
          >
            <LogOut size={14} /> {t('common.signOut')}
          </button>
        </header>
        
        <div className="border-b border-surface-border bg-white px-2 py-1 md:hidden">
          <NavLinks items={items} orientation="horizontal" />
        </div>
        
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
