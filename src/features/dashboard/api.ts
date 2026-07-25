import { apiRequest } from '@/lib/apiClient'
import type { DashboardSummary } from './types'

const MAX_FETCH = 100

function encodeFields(fields: string[]) {
  return encodeURIComponent(JSON.stringify(fields))
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const [projectsRes, requestsRes, tasksRes] = await Promise.all([
    apiRequest<{ data: Array<{ name: string; status?: string }> }>(
      `/resource/Project?fields=${encodeFields(['name', 'status'])}&limit_page_length=${MAX_FETCH}`
    ),
    apiRequest<{ data: Array<{ name: string; status?: string; creation?: string; project?: string }> }>(
      `/resource/Project%20Request?fields=${encodeFields(['name', 'status', 'creation', 'project'])}&limit_page_length=${MAX_FETCH}`
    ),
    apiRequest<{ data: Array<{ name: string; status?: string }> }>(
      `/resource/Task?fields=${encodeFields(['name', 'status'])}&limit_page_length=${MAX_FETCH}`
    ),
  ])

  const activeProjects = projectsRes.data.length
  const openRequests = requestsRes.data.filter((item) => item.status && !['Closed', 'Answered', 'Approved', 'Rejected'].includes(item.status)).length
  const pendingApprovals = requestsRes.data.filter((item) => item.status === 'Open' || item.status === 'Under Review').length
  const openTasks = tasksRes.data.filter((item) => item.status && !['Completed', 'Cancelled'].includes(item.status)).length
  
  const recentActivity = requestsRes.data.slice(0, 5).map((item) => ({
    name: item.name,
    status: item.status,
    project: item.project,
    createdAt: item.creation,
  }))

  return {
    activeProjects,
    openRequests,
    pendingApprovals,
    openTasks,
    recentActivity,
  }
}