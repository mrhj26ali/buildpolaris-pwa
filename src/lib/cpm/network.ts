import type { CpmTask, CpmDependency } from './types'

export interface CpmNode {
  name: string
  duration: number
  predecessors: CpmDependency[]
  successors: CpmDependency[]
}

export type CpmNetwork = Map<string, CpmNode>

export function buildNetwork(tasks: CpmTask[], dependencies: CpmDependency[]): CpmNetwork {
  const network: CpmNetwork = new Map()

  for (const task of tasks) {
    network.set(task.name, {
      name: task.name,
      duration: task.duration,
      predecessors: [],
      successors: [],
    })
  }

  for (const dep of dependencies) {
    const pred = network.get(dep.predecessor)
    const succ = network.get(dep.successor)
    if (!pred || !succ) continue // defensive — a dangling dependency shouldn't crash the worker
    pred.successors.push(dep)
    succ.predecessors.push(dep)
  }

  return network
}

// Topological order via Kahn's algorithm — required for both forward and
// backward passes to visit nodes in dependency order without recursion depth
// risk on large (1,000+ task, NFR-PERF.4) schedules.
export function topologicalOrder(network: CpmNetwork): string[] {
  const inDegree = new Map<string, number>()
  for (const node of network.values()) {
    inDegree.set(node.name, node.predecessors.length)
  }

  const queue: string[] = []
  for (const [name, degree] of inDegree) {
    if (degree === 0) queue.push(name)
  }

  const order: string[] = []
  while (queue.length > 0) {
    const current = queue.shift()!
    order.push(current)
    const node = network.get(current)!
    for (const dep of node.successors) {
      const remaining = (inDegree.get(dep.successor) ?? 0) - 1
      inDegree.set(dep.successor, remaining)
      if (remaining === 0) queue.push(dep.successor)
    }
  }

  return order
}
