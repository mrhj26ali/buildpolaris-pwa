import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, HardHat, MessagesSquare, Sparkles, Menu } from 'lucide-react'

// A Site Superintendent's primary device is a phone in the field (REQ actor
// context) — the bottom tab bar surfaces the 4 highest-frequency destinations
// plus a "More" sheet for the rest, rather than cramming all 9 nav items into
// a horizontal strip that would fail the 44px touch-target requirement.
const TABS = [
  { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Field', path: '/field', icon: HardHat },
  { label: 'Comms', path: '/communications', icon: MessagesSquare },
  { label: 'Copilot', path: '/copilot', icon: Sparkles },
]

export function BottomTabBar({ onMoreClick }: { onMoreClick: () => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t bg-background md:hidden"
      aria-label="Primary navigation"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            cn(
              'flex min-w-11 flex-1 flex-col items-center justify-center gap-0.5 text-xs',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )
          }
        >
          <tab.icon className="h-5 w-5" aria-hidden="true" />
          {tab.label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onMoreClick}
        className="flex min-w-11 flex-1 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
        More
      </button>
    </nav>
  )
}
