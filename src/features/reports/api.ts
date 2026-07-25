import { apiRequest } from '@/lib/apiClient'
import type { ProjectVarianceRecord, ProfitabilitySummary, RequestAgingRecord } from './types'

export async function fetchProfitabilitySummary(): Promise<ProfitabilitySummary> {
  const res = await apiRequest<{ data: Array<{ total_costing_amount?: number; total_billed_amount?: number; gross_margin?: number }> }>(
    '/resource/Project?fields=["total_costing_amount","total_billed_amount","gross_margin"]&limit_page_length=0'
  )
  const totalRevenue = res.data.reduce((sum, record) => sum + (record.total_billed_amount ?? 0), 0)
  const totalCost = res.data.reduce((sum, record) => sum + (record.total_costing_amount ?? 0), 0)
  const grossMargin = totalRevenue ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0
  
  return { totalRevenue, totalCost, grossMargin }
}

export async function fetchBudgetVariance(): Promise<ProjectVarianceRecord[]> {
  const res = await apiRequest<{ data: ProjectVarianceRecord[] }>(
    '/resource/Project?fields=["name","project_name","total_costing_amount","total_billed_amount","gross_margin"]&limit_page_length=0'
  )
  return res.data
}

export async function fetchRequestAging(): Promise<RequestAgingRecord[]> {
  const res = await apiRequest<{ data: RequestAgingRecord[] }>(
    '/resource/Project%20Request?fields=["name","status","creation","project"]&limit_page_length=0'
  )
  return res.data
}