import { bffRequest } from '@/lib/clients/bffClient'

// Cross-module summary shown on the dashboard landing page. This intentionally
// stays a thin read model — the dashboard is a jumping-off point to each
// module's own detail screens (Flowcharts §2's "M8 cuts across every module"
// diagram is the mental model: the dashboard is the human-facing analogue,
// giving a project-wide glance before drilling into M2..M7).
export interface ProjectSummary {
  project: string
  title: string
  schedule_health: 'OnTrack' | 'AtRisk' | 'Overdue'
  open_rfi_count: number
  open_submittal_count: number
  pending_pay_application: boolean
  open_punch_item_count: number
  cpi: number | null
  spi: number | null
  next_milestone: { subject: string; early_finish: string } | null
}

export async function getProjectSummary(project: string): Promise<ProjectSummary> {
  return bffRequest<ProjectSummary>(
    `/method/buildpolaris_bff.bp_projects.api.get_project_summary?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}

export interface Project {
  name: string
  project_name: string
  status: string
  expected_start_date: string | null
  expected_end_date: string | null
  percent_complete: number
  company: string
}

export interface CreateProjectInput {
  project_name: string
  description?: string
  expected_start_date?: string
  expected_end_date?: string
}

// buildpolaris_bff.bp_projects.api.create_project resolves the acting user's
// own Company server-side (never trusted from the client) — this payload
// deliberately has no company field. See projects/services/project_service.py.
export async function createProject(input: CreateProjectInput): Promise<Project> {
  return bffRequest<Project>('/method/buildpolaris_bff.bp_projects.api.create_project', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getProject(project: string): Promise<Project> {
  return bffRequest<Project>(
    `/method/buildpolaris_bff.bp_projects.api.get_project?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}

export async function listProjects(status?: string): Promise<Project[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  return bffRequest<Project[]>(
    `/method/buildpolaris_bff.bp_projects.api.list_projects${query}`,
    { method: 'GET' },
  )
}