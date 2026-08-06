import { apiRequest } from '@/lib/apiClient'
import type { DailyLogRecord, CreateDailyLogPayload } from './types'

export async function listDailyLogs(projectId?: string): Promise<DailyLogRecord[]> {
  const filterQuery = projectId
    ? `&filters=${encodeURIComponent(JSON.stringify([['task', 'in', projectId]]))}`
    : ''
  
  const res = await apiRequest<{ data: DailyLogRecord[] }>(
    `/resource/Daily%20Log?fields=["name","task","site_engineer","log_date","quantity_completed","crew_size","crew_experience_years","hours_worked","weather_condition","execution_quality_score","creation"]${filterQuery}&limit_page_length=0`
  )
  return res.data
}

export async function createDailyLog(payload: CreateDailyLogPayload): Promise<DailyLogRecord> {
  const res = await apiRequest<{ data: DailyLogRecord }>('/resource/Daily%20Log', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}