// src/features/scheduling/logic/cpmMath.ts
export interface CpmTask {
  id: string;
  duration: number;
  es: number;
  ef: number;
  ls: number;
  lf: number;
  total_float: number;
  is_critical: boolean;
}

export interface CpmDep {
  pred: string;
  succ: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
  lag: number;
}

/**
 * Pure CPM calculation engine. 
 * Separated from the Web Worker for testability and NFR-3 compliance.
 */
export function calculateCpm(tasks: CpmTask[], deps: CpmDep[]): { tasks: CpmTask[], error?: string } {
  const taskMap = new Map(tasks.map(t => [t.id, { ...t }]));
  const graph = new Map<string, CpmDep[]>();
  const revGraph = new Map<string, CpmDep[]>();

  tasks.forEach(t => {
    graph.set(t.id, []);
    revGraph.set(t.id, []);
  });

  deps.forEach(d => {
    graph.get(d.pred)?.push(d);
    revGraph.get(d.succ)?.push(d);
  });

  // Kahn's algorithm for topological sort (Cycle Detection)
  const inDegree = new Map<string, number>();
  tasks.forEach(t => inDegree.set(t.id, 0));
  deps.forEach(d => inDegree.set(d.succ, (inDegree.get(d.succ) || 0) + 1));

  const queue: string[] = [];
  inDegree.forEach((deg, id) => { if (deg === 0) queue.push(id); });

  const topo: string[] = [];
  while (queue.length > 0) {
    const node = queue.shift()!;
    topo.push(node);
    graph.get(node)?.forEach(d => {
      const deg = (inDegree.get(d.succ) || 0) - 1;
      inDegree.set(d.succ, deg);
      if (deg === 0) queue.push(d.succ);
    });
  }

  if (topo.length !== tasks.length) {
    return { tasks: [], error: 'Circular dependency detected' };
  }

  // Forward Pass
  topo.forEach(id => {
    const t = taskMap.get(id)!;
    let maxES = 0;
    revGraph.get(id)?.forEach(d => {
      const pred = taskMap.get(d.pred)!;
      if (d.type === 'FS') maxES = Math.max(maxES, pred.ef + d.lag);
      else if (d.type === 'SS') maxES = Math.max(maxES, pred.es + d.lag);
    });
    t.es = maxES;
    t.ef = t.es + t.duration;
  });

  // Backward Pass
  const projectEnd = Math.max(...Array.from(taskMap.values()).map(t => t.ef));
  [...topo].reverse().forEach(id => {
    const t = taskMap.get(id)!;
    let minLF = projectEnd;
    graph.get(id)?.forEach(d => {
      const succ = taskMap.get(d.succ)!;
      if (d.type === 'FS') minLF = Math.min(minLF, succ.ls - d.lag);
      else if (d.type === 'SS') minLF = Math.min(minLF, succ.ls - d.lag + t.duration);
    });
    t.lf = minLF;
    t.ls = t.lf - t.duration;
  });

  // Float & Critical Path
  taskMap.forEach(t => {
    t.total_float = t.ls - t.es;
    t.is_critical = t.total_float <= 0;
  });

  return { tasks: Array.from(taskMap.values()) };
}