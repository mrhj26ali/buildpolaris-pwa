import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AssignedProject } from '@/types/auth'

const STORAGE_KEY = 'bp_selected_project'

interface ProjectContextValue {
  projectId: string | null
  setProjectId: (id: string) => void
  projects: AssignedProject[]
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

function readStoredProject(projects: AssignedProject[]): string | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored && projects.some((p) => p.name === stored)) return stored
  } catch {
    /* Storage unavailable; fall through to the first assignment. */
  }
  return null
}

export function ProjectProvider({ projects, children }: { projects: AssignedProject[]; children: ReactNode }) {
  const [projectId, setProjectIdState] = useState<string | null>(() => {
    if (projects.length === 0) return null
    return readStoredProject(projects) ?? projects[0].name
  })

  useEffect(() => {
    if (projects.length === 0) return
    if (projectId === null || !projects.some((p) => p.name === projectId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProjectIdState(readStoredProject(projects) ?? projects[0].name)
    }
  }, [projects, projectId])

  const setProjectId = useCallback((id: string) => {
    setProjectIdState(id)
    try {
      sessionStorage.setItem(STORAGE_KEY, id)
    } catch {
      /* Storage unavailable; selection stays in memory. */
    }
  }, [])

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId, projects }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}
