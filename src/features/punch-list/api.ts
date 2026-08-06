import { apiRequest } from '@/lib/apiClient'
import type { PunchListItemRecord, CreatePunchListItemPayload } from './types'

export async function listPunchListItems(projectId?: string): Promise<PunchListItemRecord[]> {
  const filterQuery = projectId
    ? `&filters=${encodeURIComponent(JSON.stringify([['project', '=', projectId]]))}`
    : ''
  
  const res = await apiRequest<{ data: PunchListItemRecord[] }>(
    `/resource/Punch%20List%20Item?fields=["name","project","location","description","priority","status","assigned_to","due_date","creation"]${filterQuery}&limit_page_length=0`
  )
  return res.data
}

export async function createPunchListItem(
  payload: CreatePunchListItemPayload
): Promise<PunchListItemRecord> {
  const res = await apiRequest<{ data: PunchListItemRecord }>('/resource/Punch%20List%20Item', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}