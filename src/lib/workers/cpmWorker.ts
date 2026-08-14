import { calculateCpm, type CpmTask, type CpmDep } from '@/features/scheduling/logic/cpmMath'

self.onmessage = (e: MessageEvent<{ tasks: CpmTask[]; deps: CpmDep[] }>) => {
  const result = calculateCpm(e.data.tasks, e.data.deps)
  self.postMessage(result)
}
