import { bffRequest } from '@/lib/clients/bffClient'

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
  holiday_list: string | null
}

export interface CreateProjectInput {
  project_name: string
  reference_code: string
  client_name: string
  description?: string
  expected_start_date?: string
  expected_end_date?: string
  budget_amount?: number
  currency?: string
  initial_tasks?: Array<{ subject: string; duration: number }> // NEW
  holiday_list?: string // <-- ADD THIS
}

export interface ProjectHoliday {
  date: string
  description: string
}

export async function getProjectHolidays(project: string): Promise<ProjectHoliday[]> {
  return bffRequest<ProjectHoliday[]>(
    `/method/buildpolaris_bff.bp_projects.api.get_project_holidays?project=${encodeURIComponent(project)}`,
    { method: 'GET' }
  )
}

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

export async function listHolidayLists(): Promise<{ name: string; holiday_list_name: string }[]> {
  return bffRequest<{ name: string; holiday_list_name: string }[]>(
    '/method/buildpolaris_bff.bp_projects.api.list_holiday_lists',
    { method: 'GET' }
  )
}

export interface CreateHolidayListPayload {
  list_name: string
  holidays: Array<{ date: string; description?: string }>
  weekly_off?: string // <-- ADD THIS
}

export async function createHolidayList(payload: CreateHolidayListPayload): Promise<{ name: string; holiday_list_name: string }> {
  return bffRequest('/method/buildpolaris_bff.bp_projects.api.create_holiday_list', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}