import { bffRequest } from '@/lib/clients/bffClient'

// Cross-module summary shown on the dashboard landing page. This intentionally
// stays a thin read model — the dashboard is a jumping-off point to each
// module's own detail screens (Flowcharts §2's "M8 cuts across every module"
// diagram is the mental model: the dashboard is the human-facing analogue,
// giving a project-wide glance before drilling into M2..M7).
export interface ProjectSummary {
  project: string
  title: string
  schedule_health: 'OnTrack' | 'AtRisk' | 'Overdue'
  open_rfi_count: number
  open_submittal_count: number
  pending_pay_application: boolean
  open_punch_item_count: number
  cpi: number | null
  spi: number | null
  next_milestone: { subject: string; early_finish: string } | null
}

export async function getProjectSummary(project: string): Promise<ProjectSummary> {
  return bffRequest<ProjectSummary>(
    `/method/buildpolaris_bff.projects.api.get_project_summary?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}
