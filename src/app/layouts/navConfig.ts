import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  CalendarRange,
  Wallet,
  MessagesSquare,
  FileStack,
  HardHat,
  FileCheck2,
  Users,
  Sparkles,
} from 'lucide-react'
import type { FrappeRole } from '@/types/domain'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  // Undefined = visible to every authenticated role (FR-1.3 default-allow for
  // read access to non-financial modules); listed roles gate write-oriented
  // modules where relevant, but fine-grained enforcement always happens
  // server-side — this list only affects what's shown in the nav.
  roles?: FrappeRole[]
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Schedule', path: '/schedule', icon: CalendarRange },
  {
    label: 'Financials',
    path: '/financials',
    icon: Wallet,
    roles: ['Admin', 'Owner', 'Project Manager', 'Accounting'],
  },
  { label: 'Communications', path: '/communications', icon: MessagesSquare },
  { label: 'Documents', path: '/documents', icon: FileStack },
  { label: 'Field', path: '/field', icon: HardHat },
  { label: 'Closeout', path: '/closeout', icon: FileCheck2, roles: ['Admin', 'Owner', 'Project Manager'] },
  { label: 'Team', path: '/team', icon: Users, roles: ['Admin', 'Owner'] },
  { label: 'Copilot', path: '/copilot', icon: Sparkles },
]
