export interface PunchListItemRecord {
  name: string
  project: string
  location: string
  description: string
  priority: string
  status: string
  assigned_to?: string
  due_date?: string
  geotag_lat?: number
  geotag_lng?: number
  creation: string
}

export interface CreatePunchListItemPayload {
  project: string
  location: string
  description: string
  priority?: string
  assigned_to?: string
  due_date?: string
}