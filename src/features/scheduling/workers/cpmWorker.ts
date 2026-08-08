// src/features/scheduling/workers/cpmWorker.ts
// Added 'type' keyword for CpmTask and CpmDep
import { calculateCpm, type CpmTask, type CpmDep } from '../logic/cpmMath';

self.onmessage = (e: MessageEvent<{ tasks: CpmTask[]; deps: CpmDep[] }>) => {
  const result = calculateCpm(e.data.tasks, e.data.deps);
  self.postMessage(result);
};