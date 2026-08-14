import { bffRequest } from '@/lib/clients/bffClient'
import type { Drawing, DrawingRevision, DrawingAnnotation } from '@/types/domain'

export async function listDrawings(project: string): Promise<Drawing[]> {
  return bffRequest<Drawing[]>(
    `/method/buildpolaris_bff.document_control.api.list_drawings?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}

export async function listRevisions(drawing: string): Promise<DrawingRevision[]> {
  return bffRequest<DrawingRevision[]>(
    `/method/buildpolaris_bff.document_control.api.list_revisions?drawing=${encodeURIComponent(drawing)}`,
    { method: 'GET' },
  )
}

export interface UploadRevisionPayload {
  drawing: string
  revision_code: string
  issued_for: string
  file: File
}

export async function uploadRevision(payload: UploadRevisionPayload): Promise<DrawingRevision> {
  const formData = new FormData()
  formData.append('drawing', payload.drawing)
  formData.append('revision_code', payload.revision_code)
  formData.append('issued_for', payload.issued_for)
  formData.append('file', payload.file)

  return bffRequest<DrawingRevision>('/method/buildpolaris_bff.document_control.api.upload_revision', {
    method: 'POST',
    body: formData,
  })
}

export async function listAnnotations(revision: string): Promise<DrawingAnnotation[]> {
  return bffRequest<DrawingAnnotation[]>(
    `/method/buildpolaris_bff.document_control.api.list_annotations?revision=${encodeURIComponent(revision)}`,
    { method: 'GET' },
  )
}

export async function createAnnotation(revision: string, text: string): Promise<DrawingAnnotation> {
  return bffRequest<DrawingAnnotation>('/method/buildpolaris_bff.document_control.api.create_annotation', {
    method: 'POST',
    body: JSON.stringify({ revision, text }),
  })
}

// UC-5.5 / ERD §5.1: refreshes the read-only drawing_revisions_meta RxDB cache.
// Called opportunistically while online — never itself a queued write.
export async function fetchCurrentRevisionsForOfflineCache(
  project: string,
): Promise<{ name: string; drawing: string; drawing_number: string; revision_code: string; is_current: boolean; issued_for: string }[]> {
  return bffRequest(
    `/method/buildpolaris_bff.document_control.api.list_current_revisions?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}
