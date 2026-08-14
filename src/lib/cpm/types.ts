// FR-2.3: "compute Critical Path Method results... server-side as the
// authoritative result, and... equivalent computation client-side in a Web
// Worker for instant what-if feedback... Both implementations must produce
// identical results against a shared algorithm and a golden test suite."
//
// This module (and forwardPass/backwardPass/criticalPath) is the client mirror.
// It is NEVER authoritative and NEVER written back to the BFF (ARCH §3.2 —
// "a UI-feedback mirror of the same algorithm, never written back").

import type { DependencyType } from '@/types/domain'

export interface CpmTask {
  name: string
  duration: number // in days
}

export interface CpmDependency {
  predecessor: string
  successor: string
  type: DependencyType
  lag_days: number
}

export interface CpmResultRow {
  name: string
  early_start: number
  early_finish: number
  late_start: number
  late_finish: number
  total_float: number
  is_critical: boolean
}

export interface CpmResult {
  rows: CpmResultRow[]
  project_duration: number
}
