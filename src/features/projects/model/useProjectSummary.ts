import { useQuery } from '@tanstack/react-query'
import { getProjectSummary } from './projectsApi'

export function useProjectSummary(project: string | undefined) {
  return useQuery({
    queryKey: ['projects', 'summary', project],
    queryFn: () => getProjectSummary(project!),
    enabled: !!project,
  })
}
