import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navConfig'
import { useAuth } from '@/lib/auth/useAuth'
import { cn } from '@/lib/utils'

// NFR-UX.1: 3 breakpoints, 44px minimum touch targets. This renders as a fixed
// sidebar at desktop widths and is swapped for BottomTabBar.tsx at mobile
// widths by AppShell.tsx — kept as two components rather than one
// media-query-branching component so each stays simple.
export function SidebarNav() {
  const { session } = useAuth()

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true
    return session?.roles.some((r) => item.roles?.includes(r))
  })

  return (
    <nav className="hidden w-60 shrink-0 flex-col gap-1 border-r bg-sidebar p-3 md:flex" aria-label="Main navigation">
      {visibleItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
            )
          }
        >
          <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
