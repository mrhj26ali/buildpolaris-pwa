import type { ReactNode } from 'react'
import { QueryProvider } from './QueryProvider'
import { AuthProvider } from './AuthProvider'
import { SyncProvider } from './SyncProvider'
import { ThemeProvider } from './ThemeProvider'
import { ProjectProvider } from './ProjectContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <ProjectProvider>
            <SyncProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </SyncProvider>
          </ProjectProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
