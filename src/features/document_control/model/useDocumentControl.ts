import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listDrawings,
  listRevisions,
  uploadRevision,
  listAnnotations,
  createAnnotation,
  type UploadRevisionPayload,
} from './documentControlApi'
import { refreshDrawingRevisionsCache } from '../lib/refreshRevisionsCache'
import { isOnline } from '@/lib/sync/reconnectListener'

const keys = {
  drawings: (p: string) => ['documents', 'drawings', p] as const,
  revisions: (d: string) => ['documents', 'revisions', d] as const,
  annotations: (r: string) => ['documents', 'annotations', r] as const,
}

export function useDrawings(project: string | undefined) {
  const query = useQuery({
    queryKey: keys.drawings(project ?? ''),
    queryFn: () => listDrawings(project!),
    enabled: !!project,
  })

  // UC-5.5: opportunistically refresh the offline cache whenever the drawings
  // list is fetched fresh online — keeps the superintendent's "which revision
  // is current" view accurate next time they lose signal.
  useEffect(() => {
    if (project && query.isSuccess && isOnline()) {
      void refreshDrawingRevisionsCache(project)
    }
  }, [project, query.isSuccess])

  return query
}

export function useRevisions(drawing: string | undefined) {
  return useQuery({
    queryKey: keys.revisions(drawing ?? ''),
    queryFn: () => listRevisions(drawing!),
    enabled: !!drawing,
  })
}

export function useUploadRevision(drawing: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UploadRevisionPayload) => uploadRevision(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.revisions(drawing) }),
  })
}

export function useAnnotations(revision: string | undefined) {
  return useQuery({
    queryKey: keys.annotations(revision ?? ''),
    queryFn: () => listAnnotations(revision!),
    enabled: !!revision,
  })
}

export function useCreateAnnotation(revision: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (text: string) => createAnnotation(revision, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.annotations(revision) }),
  })
}
