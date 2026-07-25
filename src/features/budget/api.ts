import { apiRequest } from '@/lib/apiClient'
import type { BudgetRecord, CreateBudgetPayload, ProjectReference, ProjectVarianceRecord, ProcurementRecord, CreateMaterialRequestPayload } from './types'

export async function listBudgetRecords(): Promise<BudgetRecord[]> {
  const res = await apiRequest<{ data: BudgetRecord[] }>(
    '/resource/Budget?fields=["name","company","budget_against","project","cost_center","fiscal_year","accounts"]&limit_page_length=0'
  )
  return res.data
}

export async function createBudgetRecord(payload: CreateBudgetPayload): Promise<BudgetRecord> {
  const res = await apiRequest<{ data: BudgetRecord }>('/resource/Budget', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}

export async function listProjects(): Promise<ProjectReference[]> {
  const res = await apiRequest<{ data: ProjectReference[] }>(
    '/resource/Project?fields=["name","project_name"]&limit_page_length=0'
  )
  return res.data
}

export async function listBudgetVariance(): Promise<ProjectVarianceRecord[]> {
  const res = await apiRequest<{ data: ProjectVarianceRecord[] }>(
    '/resource/Project?fields=["name","project_name","total_costing_amount","total_billed_amount","gross_margin"]&limit_page_length=0'
  )
  return res.data
}

export async function listProcurementForProject(projectName?: string): Promise<ProcurementRecord[]> {
  const filterQuery = projectName
    ? `&filters=${encodeURIComponent(JSON.stringify([['project', '=', projectName]]))}`
    : ''
  const res = await apiRequest<{ data: ProcurementRecord[] }>(
    `/resource/Material Request?fields=["name","status","transaction_date","project","material_request_type"]${filterQuery}&limit_page_length=0`
  )
  return res.data
}

export async function createMaterialRequest(payload: CreateMaterialRequestPayload): Promise<ProcurementRecord> {
  const res = await apiRequest<{ data: ProcurementRecord }>('/resource/Material Request', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return res.data
}