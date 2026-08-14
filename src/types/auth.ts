export interface AssignedProject {
  name: string
  title: string
}

export interface User {
  email: string
  fullName: string
  roles: string[]
  persona: string
  company: string | null
  isAdmin: boolean
  projects: AssignedProject[]
}

export interface PlatformRole {
  role: string
  description: string
  persona: string
}

export interface TenantUser {
  name: string
  email: string
  full_name: string
  enabled: number
  bp_invite_status: string | null
  roles: string[]
}

export interface VersionEntry {
  owner: string
  creation: string
  changes: { field: string; before: string | null; after: string | null }[]
}

export interface LoginPayload {
  usr: string
  pwd: string
}
