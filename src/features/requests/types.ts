export interface ProjectRequestRecord {
  name: string
  request_type: string
  project: string
  task?: string
  requester: string
  subject: string
  description?: string
  status: string
  cost_impact?: number
  schedule_impact_days?: number
  response?: string
  creation: string
}

export interface CreateProjectRequestPayload {
  request_type: string
  project: string
  task?: string
  requester: string
  subject: string
  description?: string
  cost_impact?: number
  schedule_impact_days?: number
}