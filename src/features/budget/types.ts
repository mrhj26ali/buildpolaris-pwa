export interface BudgetAccountRow {
  account: string
  budget_amount: number
}

export interface BudgetRecord {
  name: string
  company: string
  budget_against: string
  project?: string
  cost_center?: string
  fiscal_year: string
  accounts: BudgetAccountRow[]
  action_if_annual_budget_exceeded?: string
}

export interface CreateBudgetPayload {
  company: string
  budget_against: string
  project: string
  fiscal_year: string
  accounts: BudgetAccountRow[]
  action_if_annual_budget_exceeded: string
}

export interface ProjectReference {
  name: string
  project_name: string
}

export interface ProjectVarianceRecord {
  name: string
  project_name: string
  total_costing_amount?: number
  total_billed_amount?: number
  gross_margin?: number
}

export interface MaterialRequestItemRow {
  item_code: string
  qty: number
  schedule_date: string
  description?: string
}

export interface ProcurementRecord {
  name: string
  status?: string
  transaction_date?: string
  project?: string
  material_request_type?: string
  doctype?: string
}

export interface CreateMaterialRequestPayload {
  company: string
  project: string
  material_request_type: string
  transaction_date: string
  schedule_date: string
  items: MaterialRequestItemRow[]
}