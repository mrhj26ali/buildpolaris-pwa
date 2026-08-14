import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { ProjectProvider } from '@/features/projects/ProjectContext'

const queryClient = new QueryClient()

function SessionProjectBridge({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return <ProjectProvider projects={user?.projects ?? []}>{children}</ProjectProvider>
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProjectBridge>{children}</SessionProjectBridge>
    </QueryClientProvider>
  )
}
