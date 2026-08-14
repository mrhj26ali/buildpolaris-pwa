import type { CpmNetwork } from './network'
import { topologicalOrder } from './network'

export interface EarlyDates {
  early_start: Map<string, number>
  early_finish: Map<string, number>
}

// Day-offset model: day 0 is project start. FS/SS/FF/SF are honored per FR-2.2's
// typed-dependency requirement — this is not a finish-to-start-only CPM.
export function forwardPass(network: CpmNetwork): EarlyDates {
  const order = topologicalOrder(network)
  const early_start = new Map<string, number>()
  const early_finish = new Map<string, number>()

  for (const name of order) {
    const node = network.get(name)!

    if (node.predecessors.length === 0) {
      early_start.set(name, 0)
      early_finish.set(name, node.duration)
      continue
    }

    let computedStart = 0
    for (const dep of node.predecessors) {
      const predEs = early_start.get(dep.predecessor) ?? 0
      const predEf = early_finish.get(dep.predecessor) ?? 0
      let candidateStart: number

      switch (dep.type) {
        case 'FS':
          candidateStart = predEf + dep.lag_days
          break
        case 'SS':
          candidateStart = predEs + dep.lag_days
          break
        case 'FF':
          candidateStart = predEf + dep.lag_days - node.duration
          break
        case 'SF':
          candidateStart = predEs + dep.lag_days - node.duration
          break
        default:
          candidateStart = predEf + dep.lag_days
      }
      computedStart = Math.max(computedStart, candidateStart)
    }

    early_start.set(name, computedStart)
    early_finish.set(name, computedStart + node.duration)
  }

  return { early_start, early_finish }
}
