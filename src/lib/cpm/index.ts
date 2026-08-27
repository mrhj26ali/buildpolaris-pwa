import { buildNetwork } from './network'
import { forwardPass } from './forwardPass'
import { backwardPass } from './backwardPass'
import { computeCriticalPath, runDcmaHealthCheck, type DcmaHealthCheck } from './criticalPath'
import type { CpmTask, CpmDependency, CpmResult } from './types'

export interface CpmComputation {
  result: CpmResult
  health: DcmaHealthCheck
}

export function computeCpm(tasks: CpmTask[], dependencies: CpmDependency[], holidayOffsets: number[] = []): CpmComputation {
  const network = buildNetwork(tasks, dependencies)
  const holidaySet = new Set(holidayOffsets)
  
  const early = forwardPass(network, holidaySet)
  let projectDuration = 0
  for (const finish of early.early_finish.values()) {
    projectDuration = Math.max(projectDuration, finish)
  }
  
  const late = backwardPass(network, early, projectDuration, holidaySet)
  const result = computeCriticalPath(network, early, late)
  const health = runDcmaHealthCheck(network, result, dependencies)
  
  return { result, health }
}

export type { CpmTask, CpmDependency, CpmResult } from './types'
export type { DcmaHealthCheck } from './criticalPath'