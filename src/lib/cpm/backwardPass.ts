import type { CpmNetwork } from './network'
import { topologicalOrder } from './network'
import type { EarlyDates } from './forwardPass'

export interface LateDates {
  late_start: Map<string, number>
  late_finish: Map<string, number>
}

export function backwardPass(network: CpmNetwork, early: EarlyDates, projectDuration: number): LateDates {
  const order = topologicalOrder(network).reverse()
  const late_start = new Map<string, number>()
  const late_finish = new Map<string, number>()

  for (const name of order) {
    const node = network.get(name)!

    if (node.successors.length === 0) {
      late_finish.set(name, projectDuration)
      late_start.set(name, projectDuration - node.duration)
      continue
    }

    let computedFinish = Infinity
    for (const dep of node.successors) {
      const succLs = late_start.get(dep.successor) ?? projectDuration
      const succLf = late_finish.get(dep.successor) ?? projectDuration
      let candidateFinish: number

      switch (dep.type) {
        case 'FS':
          candidateFinish = succLs - dep.lag_days
          break
        case 'SS':
          candidateFinish = succLs - dep.lag_days + node.duration
          break
        case 'FF':
          candidateFinish = succLf - dep.lag_days
          break
        case 'SF':
          candidateFinish = succLf - dep.lag_days + node.duration
          break
        default:
          candidateFinish = succLs - dep.lag_days
      }
      computedFinish = Math.min(computedFinish, candidateFinish)
    }

    if (!Number.isFinite(computedFinish)) {
      computedFinish = early.early_finish.get(name) ?? node.duration
    }

    // Clamp to the project horizon. Under an SF (or, less commonly, FF with a
    // large negative lag) relationship, the raw candidate arithmetic can
    // legitimately compute a late_finish beyond project_duration — there is
    // no "after the project ends" for a task to float into, so any value
    // above the horizon is capped here rather than surfaced as extra float.
    // This mirrors the equivalent clamp in buildpolaris_bff's own CPM
    // implementation (FR-2.3's "identical results" requirement) — see the
    // golden fixture 'sf-type' in tests/fixtures/cpmGolden.ts for a worked
    // example that specifically exercises this clamp.
    const clampedFinish = Math.min(computedFinish, projectDuration)

    late_finish.set(name, clampedFinish)
    late_start.set(name, clampedFinish - node.duration)
  }

  return { late_start, late_finish }
}
