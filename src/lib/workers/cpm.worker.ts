// ARCH §3.2: "computed in a Web Worker (lib/workers/cpm.worker.ts), mirroring
// the server's algorithm for instant what-if feedback... never authoritative,
// never written back." NFR-PERF.4 requires this stay responsive on 1,000+ task
// schedules — hence a worker rather than blocking the main thread on every
// what-if drag in the Gantt UI.

import { computeCpm, type CpmTask, type CpmDependency } from '@/lib/cpm'

export interface CpmWorkerRequest {
  requestId: string
  tasks: CpmTask[]
  dependencies: CpmDependency[]
}

export interface CpmWorkerResponse {
  requestId: string
  computation: ReturnType<typeof computeCpm>
}

self.onmessage = (event: MessageEvent<CpmWorkerRequest>) => {
  const { requestId, tasks, dependencies } = event.data
  const computation = computeCpm(tasks, dependencies)
  const response: CpmWorkerResponse = { requestId, computation }
  ;(self as unknown as Worker).postMessage(response)
}
