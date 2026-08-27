import { useCallback, useEffect, useRef, useState } from 'react'
import type { CpmComputation } from '@/lib/cpm'
import type { CpmTask, CpmDependency } from '@/lib/cpm/types'
import type { CpmWorkerRequest, CpmWorkerResponse } from './cpm.worker'

export function useCpmWorker() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef<Map<string, (c: CpmComputation) => void>>(new Map())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const worker = new Worker(new URL('./cpm.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<CpmWorkerResponse>) => {
      const resolver = pendingRef.current.get(event.data.requestId)
      if (resolver) {
        resolver(event.data.computation)
        pendingRef.current.delete(event.data.requestId)
      }
    }
    workerRef.current = worker
    setReady(true)
    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const compute = useCallback((
    tasks: CpmTask[], 
    dependencies: CpmDependency[], 
    holidayOffsets: number[] = []
  ): Promise<CpmComputation> => {
    return new Promise((resolve) => {
      const requestId = crypto.randomUUID()
      pendingRef.current.set(requestId, resolve)
      const request: CpmWorkerRequest = { requestId, tasks, dependencies, holidayOffsets }
      workerRef.current?.postMessage(request)
    })
  }, [])

  return { compute, ready }
}