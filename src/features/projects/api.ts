import { apiRequest } from '@/lib/apiClient'
import type { CreateProjectPayload, ProjectRecord, ProjectTemplateRecord } from './types'

export async function listProjects(): Promise<ProjectRecord[]> {
  const res = await apiRequest<{ data: ProjectRecord[] }>(
    '/resource/Project?fields=["name","project_name","status","project_type","priority","expected_start_date","expected_end_date","percent_complete","project_template"]&limit_page_length=0'
  )
  return res.data
}

export async function listProjectTemplates(): Promise<ProjectTemplateRecord[]> {
  // FIX: Changed fields from ["name","project_template_name"] to ["name","project_type"]
  const res = await apiRequest<{ data: ProjectTemplateRecord[] }>(
    '/resource/Project%20Template?fields=["name","project_type"]&limit_page_length=0'
  )
  return res.data
}

export async function createProject(payload: CreateProjectPayload): Promise<ProjectRecord> {
  const res = await apiRequest<{ data: ProjectRecord }>('/resource/Project', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}