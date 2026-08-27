import { computeCpm, type CpmTask, type CpmDependency } from '@/lib/cpm'

export interface CpmWorkerRequest {
  requestId: string
  tasks: CpmTask[]
  dependencies: CpmDependency[]
  holidayOffsets: number[]
}

export interface CpmWorkerResponse {
  requestId: string
  computation: ReturnType<typeof computeCpm>
}

self.onmessage = (event: MessageEvent<CpmWorkerRequest>) => {
  const { requestId, tasks, dependencies, holidayOffsets } = event.data
  const computation = computeCpm(tasks, dependencies, holidayOffsets)
  const response: CpmWorkerResponse = { requestId, computation }
  ;(self as unknown as Worker).postMessage(response)
}