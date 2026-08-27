import type { CpmNetwork } from './network'
import { topologicalOrder } from './network'
import type { EarlyDates } from './forwardPass'

export interface LateDates {
  late_start: Map<string, number>
  late_finish: Map<string, number>
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

export function backwardPass(network: CpmNetwork, early: EarlyDates, projectDuration: number, holidayOffsets: Set<number> = new Set()): LateDates {
  const order = topologicalOrder(network).reverse()
  const late_start = new Map<string, number>()
  const late_finish = new Map<string, number>()

  for (const name of order) {
    const node = network.get(name)!
    if (node.successors.length === 0) {
      late_finish.set(name, projectDuration)
      late_start.set(name, shiftWorkingDays(projectDuration, -node.duration, holidayOffsets))
      continue
    }

    let computedFinish = Infinity
    for (const dep of node.successors) {
      const succLs = late_start.get(dep.successor) ?? projectDuration
      const succLf = late_finish.get(dep.successor) ?? projectDuration
      
      let candidateFinish: number
      switch (dep.type) {
        case 'FS':
          candidateFinish = shiftWorkingDays(succLs, -dep.lag_days, holidayOffsets)
          break
        case 'SS':
          const baseSS = shiftWorkingDays(succLs, -dep.lag_days, holidayOffsets)
          candidateFinish = shiftWorkingDays(baseSS, node.duration, holidayOffsets)
          break
        case 'FF':
          candidateFinish = shiftWorkingDays(succLf, -dep.lag_days, holidayOffsets)
          break
        case 'SF':
          const baseSF = shiftWorkingDays(succLf, -dep.lag_days, holidayOffsets)
          candidateFinish = shiftWorkingDays(baseSF, node.duration, holidayOffsets)
          break
        default:
          candidateFinish = shiftWorkingDays(succLs, -dep.lag_days, holidayOffsets)
      }
      computedFinish = Math.min(computedFinish, candidateFinish)
    }

    if (!Number.isFinite(computedFinish)) {
      computedFinish = early.early_finish.get(name) ?? node.duration
    }

    const clampedFinish = Math.min(computedFinish, projectDuration)
    late_finish.set(name, clampedFinish)
    late_start.set(name, shiftWorkingDays(clampedFinish, -node.duration, holidayOffsets))
  }
  return { late_start, late_finish }
}