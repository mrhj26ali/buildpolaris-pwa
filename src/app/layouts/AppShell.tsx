import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarNav } from './SidebarNav'
import { BottomTabBar } from './BottomTabBar'
import { HeaderBar } from './HeaderBar'
import { OfflineBanner } from '@/lib/ui/OfflineBanner'
import { MoreMenuSheet } from './MoreMenuSheet'

export function AppShell() {
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col">
      <OfflineBanner />
      <div className="flex flex-1 overflow-hidden">
        <SidebarNav />
        <div className="flex flex-1 flex-col overflow-hidden">
          <HeaderBar />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>
      <BottomTabBar onMoreClick={() => setMoreOpen(true)} />
      <MoreMenuSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </div>
  )
}
