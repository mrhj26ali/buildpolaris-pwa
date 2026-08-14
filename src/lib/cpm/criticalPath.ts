import type { CpmNetwork } from './network'
import type { EarlyDates } from './forwardPass'
import type { LateDates } from './backwardPass'
import type { CpmResult, CpmResultRow } from './types'

const FLOAT_EPSILON = 1e-9

export function computeCriticalPath(
  network: CpmNetwork,
  early: EarlyDates,
  late: LateDates,
): CpmResult {
  const rows: CpmResultRow[] = []
  let projectDuration = 0

  for (const node of network.values()) {
    const early_start = early.early_start.get(node.name) ?? 0
    const early_finish = early.early_finish.get(node.name) ?? node.duration
    const late_start = late.late_start.get(node.name) ?? early_start
    const late_finish = late.late_finish.get(node.name) ?? early_finish
    const total_float = late_start - early_start

    rows.push({
      name: node.name,
      early_start,
      early_finish,
      late_start,
      late_finish,
      total_float,
      is_critical: Math.abs(total_float) < FLOAT_EPSILON,
    })

    projectDuration = Math.max(projectDuration, early_finish)
  }

  return { rows, project_duration: projectDuration }
}

// DCMA 14-point schedule health check (FR-2.3: "runnable on demand"). This is a
// narrow, useful subset — the checks that are structurally derivable from the
// network alone, without external metadata (resource assignments, baselines)
// that only the BFF's authoritative computation has access to. The BFF's own
// implementation is the authoritative DCMA result; this is a client-side,
// what-if-time preview of the same categories.
export interface DcmaHealthCheck {
  logic_missing_predecessors: string[] // tasks with no predecessor and no successor (orphans)
  leads_detected: string[] // dependencies with negative lag (a "lead")
  lags_detected: string[] // dependencies with positive lag beyond a day
  high_float_tasks: string[] // float > 44 working days is the DCMA default threshold
  negative_float_tasks: string[] // float < 0 — schedule is infeasible as constrained
}

export function runDcmaHealthCheck(
  network: CpmNetwork,
  result: CpmResult,
  dependencies: { predecessor: string; successor: string; lag_days: number }[],
): DcmaHealthCheck {
  const orphans: string[] = []
  for (const node of network.values()) {
    if (node.predecessors.length === 0 && node.successors.length === 0 && network.size > 1) {
      orphans.push(node.name)
    }
  }

  const leads = dependencies.filter((d) => d.lag_days < 0).map((d) => `${d.predecessor}->${d.successor}`)
  const lags = dependencies.filter((d) => d.lag_days > 1).map((d) => `${d.predecessor}->${d.successor}`)
  const highFloat = result.rows.filter((r) => r.total_float > 44).map((r) => r.name)
  const negativeFloat = result.rows.filter((r) => r.total_float < 0).map((r) => r.name)

  return {
    logic_missing_predecessors: orphans,
    leads_detected: leads,
    lags_detected: lags,
    high_float_tasks: highFloat,
    negative_float_tasks: negativeFloat,
  }
}
