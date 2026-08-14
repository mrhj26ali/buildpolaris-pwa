import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from '@/features/auth/model/AuthContext';

interface ProjectContextValue {
  projectId: string | null;
  setProjectId: (id: string) => void;
  projects: Array<{ name: string; title: string }>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const projects = user?.projects ?? [];
  const [projectId, setProjectIdState] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectIdState(projects[0].name);
    }
  }, [projects, projectId]);

  const setProjectId = useCallback((id: string) => {
    setProjectIdState(id);
  }, []);

  return (
    <ProjectContext.Provider value={{ projectId, setProjectId, projects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
