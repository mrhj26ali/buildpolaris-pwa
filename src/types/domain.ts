// Shared domain types mirroring buildpolaris_bff DocTypes (ERD v2.1 §3).
// These are wire-shape types for data read from / written to the BFF —
// never persisted directly except where noted (RxDB types live in lib/db/schemas).

export type FrappeRole =
  | 'Admin'
  | 'Owner'
  | 'Project Manager'
  | 'Accounting'
  | 'Document Controller'
  | 'Site Superintendent'
  | 'Safety Officer'
  | 'Subcontractor'

export interface AssignedProject {
  name: string
  title: string
}

// FR-1.5 — single session-bootstrap payload
export interface SessionContext {
  email: string
  full_name: string
  roles: FrappeRole[]
  company: string | null
  is_admin: boolean
  projects: AssignedProject[]
}

// ---- M2 Scheduling -----------------------------------------------------

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF'

export interface TaskRecord {
  name: string
  project: string
  subject: string
  duration: number
  early_start: string | null
  early_finish: string | null
  late_start: string | null
  late_finish: string | null
  total_float: number | null
  is_critical: boolean
  depends_on: string | null
}

export interface TaskDependency {
  name: string
  project: string
  predecessor: string
  successor: string
  type: DependencyType
  lag_days: number
}

export interface ScheduleBaseline {
  name: string
  project: string
  label: string
  captured_at: string
}

// ---- M3 Financials -------------------------------------------------------

export type CommitmentType = 'Subcontract' | 'PurchaseOrder'
export type CommitmentStatus = 'Draft' | 'PendingApproval' | 'Approved' | 'Rejected'

export interface CostCode {
  name: string
  project: string
  code: string
  description: string
  cost_center: string | null
  budget_amount: number
}

export interface Commitment {
  name: string
  project: string
  cost_code: string
  supplier: string
  type: CommitmentType
  status: CommitmentStatus
  original_amount: number
  revised_amount: number
  purchase_order: string | null
  approved_by: string | null
  approved_at: string | null
  is_immutable: boolean
}

export type ChangeEventCategory = 'ScopeGap' | 'DesignError' | 'FieldCondition' | 'OwnerRequest' | 'Other'
export type ChangeEventStatus = 'Open' | 'Approved' | 'Rejected'

export interface ChangeEvent {
  name: string
  project: string
  commitment: string
  originating_rfi: string | null
  category: ChangeEventCategory
  outcome_reason: string
  amount_delta: number
  status: ChangeEventStatus
  approved_by: string | null
  is_immutable: boolean
}

export type PayApplicationStatus = 'Draft' | 'PendingApproval' | 'Approved' | 'Rejected' | 'Paid'

export interface PayApplicationLine {
  name: string
  cost_code: string
  scheduled_value: number
  work_completed_this_period: number
  materials_stored: number
  pct_complete: number
}

export interface PayApplication {
  name: string
  commitment: string
  period_end: string
  retainage_pct: number
  status: PayApplicationStatus
  purchase_invoice: string | null
  payment_entry: string | null
  lines: PayApplicationLine[]
}

export interface EvmSnapshot {
  project: string
  planned_value: number
  earned_value: number
  actual_cost: number
  cpi: number
  spi: number
  as_of: string
}

// ---- M4 Communications ----------------------------------------------------

export type RfiStatus = 'Open' | 'Answered' | 'Closed' | 'Escalated'

export interface Rfi {
  name: string
  project: string
  subject: string
  question: string
  assigned_to: string
  response_route: string
  status: RfiStatus
  due_date: string
  response: string | null
  watchers: string[]
}

export type SubmittalStatus = 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'ResubmitRequested'
export type SubmittalLineStatus = 'Pending' | 'Approved' | 'Revise' | 'Rejected'

export interface SubmittalLineItem {
  name: string
  description: string
  status: SubmittalLineStatus
  reviewer: string | null
}

export interface SubmittalPackage {
  name: string
  project: string
  spec_section: string
  status: SubmittalStatus
  lines: SubmittalLineItem[]
}

export interface Transmittal {
  name: string
  project: string
  sent_by: string
  sent_at: string
  method: string
  recipients: string[]
  documents: string[]
}

export interface MeetingSeries {
  name: string
  project: string
  title: string
  recurrence_rule: string
}

export interface MeetingMinutes {
  name: string
  series: string
  occurred_at: string
  notes: string
}

export type ActionItemStatus = 'Open' | 'Done' | 'Overdue'

export interface ActionItem {
  name: string
  minutes: string | null
  description: string
  assignee: string
  due_date: string
  status: ActionItemStatus
}

// ---- M5 Document Control ---------------------------------------------------

export interface Drawing {
  name: string
  project: string
  drawing_number: string
  title: string
  discipline: string
}

export interface DrawingRevision {
  name: string
  drawing: string
  revision_code: string
  file: string
  is_current: boolean
  issued_for: string
  supersedes: string | null
}

export interface DrawingAnnotation {
  name: string
  revision: string
  author: string
  text: string
  rfi: string | null
  punch_item: string | null
}

// ---- M7 Closeout ------------------------------------------------------------

export type ClosingRecordStatus = 'Open' | 'SubstantiallyComplete' | 'Finalized'

export interface ClosingRecord {
  name: string
  project: string
  status: ClosingRecordStatus
  opened_at: string
}

export interface SubstantialCompletionCertificate {
  name: string
  closing_record: string
  pm_signoff: string | null
  owner_signoff: string | null
  architect_signoff: string | null
  signed_at: string | null
}

export type LienWaiverType = 'Conditional' | 'Unconditional' | 'Partial' | 'Final'

export interface LienWaiver {
  name: string
  closing_record: string
  supplier: string
  pay_application: string | null
  type: LienWaiverType
  file: string
}

export type CloseoutDocCategory = 'OMManual' | 'Warranty' | 'ConsentOfSurety' | 'ContractorAffidavit'

export interface CloseoutDocument {
  name: string
  closing_record: string
  category: CloseoutDocCategory
  file: string
}
