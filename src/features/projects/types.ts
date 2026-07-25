export interface ProjectRecord {
  name: string
  project_name: string
  status: string
  project_type: string
  priority: string
  expected_start_date: string
  expected_end_date: string
  percent_complete: number
  project_template?: string
}

// FIX: Removed project_template_name, added project_type to match native ERPNext schema
export interface ProjectTemplateRecord {
  name: string
  project_type?: string
}

export interface CreateProjectPayload {
  project_name: string
  status: string
  project_type: string
  priority: string
  expected_start_date: string
  expected_end_date: string
  percent_complete: number
  project_template?: string
}