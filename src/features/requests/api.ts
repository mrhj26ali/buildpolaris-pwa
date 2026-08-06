import { apiRequest } from '@/lib/apiClient'
import type { ProjectRequestRecord, CreateProjectRequestPayload } from './types'

export async function listProjectRequests(projectId?: string): Promise<ProjectRequestRecord[]> {
  const filterQuery = projectId
    ? `&filters=${encodeURIComponent(JSON.stringify([['project', '=', projectId]]))}`
    : ''
  
  const res = await apiRequest<{ data: ProjectRequestRecord[] }>(
    `/resource/Project%20Request?fields=["name","request_type","project","task","requester","subject","description","status","cost_impact","schedule_impact_days","response","creation"]${filterQuery}&limit_page_length=0`
  )
  return res.data
}

export async function createProjectRequest(
  payload: CreateProjectRequestPayload
): Promise<ProjectRequestRecord> {
  const res = await apiRequest<{ data: ProjectRequestRecord }>('/resource/Project%20Request', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}