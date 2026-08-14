import { NavLink } from 'react-router-dom'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { NAV_ITEMS } from './navConfig'
import { useAuth } from '@/lib/auth/useAuth'
import { cn } from '@/lib/utils'

export function MoreMenuSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { session } = useAuth()

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true
    return session?.roles.some((r) => item.roles?.includes(r))
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[70vh]">
        <SheetHeader>
          <SheetTitle>All modules</SheetTitle>
        </SheetHeader>
        <nav className="grid grid-cols-3 gap-3 p-4" aria-label="All modules">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onOpenChange(false)}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium',
                  isActive ? 'border-primary bg-primary/5 text-primary' : 'text-muted-foreground',
                )
              }
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
