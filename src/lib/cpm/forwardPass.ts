import type { CpmNetwork } from './network'
import { topologicalOrder } from './network'

export interface EarlyDates {
  early_start: Map<string, number>
  early_finish: Map<string, number>
}

function shiftWorkingDays(startOffset: number, days: number, holidayOffsets: Set<number>): number {
  let currentOffset = startOffset
  if (days === 0) return currentOffset
  
  const step = days > 0 ? 1 : -1
  const target = Math.abs(days)
  let moved = 0
  
  while (moved < target) {
    currentOffset += step
    if (!holidayOffsets.has(currentOffset)) {
      moved += 1
    }
  }
  return currentOffset
}

export function forwardPass(network: CpmNetwork, holidayOffsets: Set<number> = new Set()): EarlyDates {
  const order = topologicalOrder(network)
  const early_start = new Map<string, number>()
  const early_finish = new Map<string, number>()

  for (const name of order) {
    const node = network.get(name)!
    if (node.predecessors.length === 0) {
      early_start.set(name, 0)
      early_finish.set(name, shiftWorkingDays(0, node.duration, holidayOffsets))
      continue
    }

    let computedStart = 0
    for (const dep of node.predecessors) {
      const predEs = early_start.get(dep.predecessor) ?? 0
      const predEf = early_finish.get(dep.predecessor) ?? 0
      
      let candidateStart: number
      switch (dep.type) {
        case 'FS':
          candidateStart = shiftWorkingDays(predEf, dep.lag_days, holidayOffsets)
          break
        case 'SS':
          candidateStart = shiftWorkingDays(predEs, dep.lag_days, holidayOffsets)
          break
        case 'FF':
          const baseFF = shiftWorkingDays(predEf, dep.lag_days, holidayOffsets)
          candidateStart = shiftWorkingDays(baseFF, -node.duration, holidayOffsets)
          break
        case 'SF':
          const baseSF = shiftWorkingDays(predEs, dep.lag_days, holidayOffsets)
          candidateStart = shiftWorkingDays(baseSF, -node.duration, holidayOffsets)
          break
        default:
          candidateStart = shiftWorkingDays(predEf, dep.lag_days, holidayOffsets)
      }
      computedStart = Math.max(computedStart, candidateStart)
    }
    early_start.set(name, computedStart)
    early_finish.set(name, shiftWorkingDays(computedStart, node.duration, holidayOffsets))
  }
  return { early_start, early_finish }
}