import { useCallback, useEffect, useState } from 'react'
import { getDatabase } from '@/lib/db/database'
import { insertJsa, type JsaInput } from '@/lib/db/repositories/jsa.repository'
import { toMutable } from '@/lib/db/toMutable'
import type { JsaDoc } from '@/lib/db/schemas/jsa.schema'
import { syncEngine } from '@/lib/sync/SyncEngine'

export function useJsas(project: string | undefined) {
  const [jsas, setJsas] = useState<JsaDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!project) return
    let subscription: { unsubscribe: () => void } | undefined

    void getDatabase().then((db) => {
      subscription = db.jsas
        .find({ selector: { project }, sort: [{ jsa_date: 'desc' }] })
        .$.subscribe((docs) => {
          setJsas(docs.map((d) => toMutable<JsaDoc>(d.toJSON())))
          setLoading(false)
        })
    }).catch((error) => {
        console.error("RxDB Initialization Error:", error)
        setLoading(false) // Prevent infinite loading if DB fails
      })

    return () => subscription?.unsubscribe()
  }, [project])

  return { jsas, loading }
}

export function useCreateJsa() {
  const [submitting, setSubmitting] = useState(false)

  const create = useCallback(async (input: JsaInput) => {
    setSubmitting(true)
    try {
      const doc = await insertJsa(input)
      void syncEngine.drainNow()
      return doc
    } finally {
      setSubmitting(false)
    }
  }, [])

  return { create, submitting }
}