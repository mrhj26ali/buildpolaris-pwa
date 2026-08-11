export interface PlatformUser {
  name: string // ERPNext uses email as the User doctype's name/ID
  full_name: string
  email: string
  enabled: boolean
  role_profile_name?: string
}

export interface CreateUserPayload {
  email: string
  first_name: string
  send_welcome_email: 0 | 1
}



