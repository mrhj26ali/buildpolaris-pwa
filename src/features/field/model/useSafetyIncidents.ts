import { useCallback, useEffect, useState } from 'react'
import { getDatabase } from '@/lib/db/database'
import { insertSafetyIncident, type SafetyIncidentInput } from '@/lib/db/repositories/safetyIncident.repository'
import { toMutable } from '@/lib/db/toMutable'
import type { SafetyIncidentDoc } from '@/lib/db/schemas/safetyIncident.schema'
import { syncEngine } from '@/lib/sync/SyncEngine'

export function useSafetyIncidents(project: string | undefined) {
  const [incidents, setIncidents] = useState<SafetyIncidentDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!project) return
    let subscription: { unsubscribe: () => void } | undefined

    void getDatabase().then((db) => {
      subscription = db.incidents
        .find({ selector: { project }, sort: [{ incident_date: 'desc' }] })
        .$.subscribe((docs) => {
          setIncidents(docs.map((d) => toMutable<SafetyIncidentDoc>(d.toJSON())))
          setLoading(false)
        })
    }).catch((error) => {
        console.error("RxDB Initialization Error:", error)
        setLoading(false) // Prevent infinite loading if DB fails
      })

    return () => subscription?.unsubscribe()
  }, [project])

  return { incidents, loading }
}

export function useCreateSafetyIncident() {
  const [submitting, setSubmitting] = useState(false)

  const create = useCallback(async (input: SafetyIncidentInput) => {
    setSubmitting(true)
    try {
      const doc = await insertSafetyIncident(input)
      void syncEngine.drainNow()
      return doc
    } finally {
      setSubmitting(false)
    }
  }, [])

  return { create, submitting }
}