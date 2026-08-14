import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/lib/auth/useAuth'
import type { AssignedProject } from '@/types/domain'

interface ProjectContextValue {
  activeProject: AssignedProject | null
  setActiveProject: (project: AssignedProject) => void
}

const ProjectContext = createContext<ProjectContextValue | null>(null)
const STORAGE_KEY = 'buildpolaris-active-project'

// Every module screen (M2 through M8) scopes its queries to activeProject.name.
// Persisted to localStorage (not RxDB — this is a UI preference, not a fact)
// so a reload doesn't drop the user back to "no project selected."
export function ProjectProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [activeProject, setActiveProjectState] = useState<AssignedProject | null>(null)

  useEffect(() => {
    if (!session) return
    const savedName = window.localStorage.getItem(STORAGE_KEY)
    const restored = session.projects.find((p) => p.name === savedName)
    setActiveProjectState(restored ?? session.projects[0] ?? null)
  }, [session])

  const value = useMemo<ProjectContextValue>(
    () => ({
      activeProject,
      setActiveProject: (project: AssignedProject) => {
        window.localStorage.setItem(STORAGE_KEY, project.name)
        setActiveProjectState(project)
      },
    }),
    [activeProject],
  )

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProjectContext(): ProjectContextValue {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProjectContext must be used within ProjectProvider')
  return ctx
}
