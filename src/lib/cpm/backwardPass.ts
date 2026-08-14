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

    late_finish.set(name, computedFinish)
    late_start.set(name, computedFinish - node.duration)
  }

  return { late_start, late_finish }
}
