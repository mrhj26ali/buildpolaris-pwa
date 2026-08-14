import { calculateCpm, CpmTask, CpmDep } from '@/lib/cpm/engine';

self.onmessage = (e: MessageEvent<{ tasks: CpmTask[]; deps: CpmDep[] }>) => {
  const result = calculateCpm(e.data.tasks, e.data.deps);
  self.postMessage(result);
};
