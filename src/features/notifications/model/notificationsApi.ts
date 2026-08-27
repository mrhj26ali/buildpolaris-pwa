import { bffRequest } from '@/lib/clients/bffClient'

export interface NotificationLog {
  name: string
  subject: string
  creation: string
  read: number | boolean
  link: string | null
  from_user: string | null
}

export async function getNotifications(limit = 20): Promise<NotificationLog[]> {
  return bffRequest<NotificationLog[]>(
    `/method/buildpolaris_bff.shared.api.get_notifications?limit=${limit}`,
    { method: 'GET' }
  )
}

export async function markNotificationRead(name: string): Promise<boolean> {
  return bffRequest<boolean>('/method/buildpolaris_bff.shared.api.mark_notification_read', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function markAllNotificationsRead(): Promise<boolean> {
  return bffRequest<boolean>('/method/buildpolaris_bff.shared.api.mark_all_notifications_read', {
    method: 'POST',
  })
}