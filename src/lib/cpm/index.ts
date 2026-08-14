import { buildNetwork } from './network'
import { forwardPass } from './forwardPass'
import { backwardPass } from './backwardPass'
import { computeCriticalPath, runDcmaHealthCheck, type DcmaHealthCheck } from './criticalPath'
import type { CpmTask, CpmDependency, CpmResult } from './types'

export interface CpmComputation {
  result: CpmResult
  health: DcmaHealthCheck
}

// Single entry point — both cpm.worker.ts (used by the UI for instant what-if
// feedback) and any future test harness call exactly this function, so the
// "client mirrors the server algorithm" claim in FR-2.3 has one place to stay
// true from the client side.
export function computeCpm(tasks: CpmTask[], dependencies: CpmDependency[]): CpmComputation {
  const network = buildNetwork(tasks, dependencies)
  const early = forwardPass(network)

  let projectDuration = 0
  for (const finish of early.early_finish.values()) {
    projectDuration = Math.max(projectDuration, finish)
  }

  const late = backwardPass(network, early, projectDuration)
  const result = computeCriticalPath(network, early, late)
  const health = runDcmaHealthCheck(network, result, dependencies)

  return { result, health }
}

export type { CpmTask, CpmDependency, CpmResult } from './types'
export type { DcmaHealthCheck } from './criticalPath'
