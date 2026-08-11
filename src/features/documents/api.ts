// src/features/documents/api.ts
import { bffRequest } from '@/lib/clients/bffClient';

export interface DrawingNode {
  name: string;
  sheet_number: string;
  discipline: string;
  title: string;
  classification_code: string | null;
  current_revision: string | null;
  revision_count: number;
}

export interface RevisionNode {
  name: string;
  revision_code: string;
  status: 'WIP' | 'Shared' | 'Published' | 'Archived';
  status_code: 'S0' | 'S1' | 'S2';
  uploaded_by: string | null;
  uploaded_at: string | null;
  authorized_by: string | null;
  authorized_at: string | null;
}

export interface AnnotationNode {
  name: string;
  annotation_type: 'Cloud' | 'Pin' | 'Text';
  author: string | null;
  geometry: string | null;
  comment: string | null;
  sync_status: 'Local' | 'Synced';
  linked_rfi: string | null;
  linked_punch_item: string | null;
}

export async function getDrawingRegister(projectId: string): Promise<DrawingNode[]> {
  return bffRequest<DrawingNode[]>('/method/buildpolaris_bff.api.document_control.get_drawing_register', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getRevisionHistory(drawingId: string): Promise<RevisionNode[]> {
  return bffRequest<RevisionNode[]>('/method/buildpolaris_bff.api.document_control.get_revision_history', {
    method: 'POST',
    body: JSON.stringify({ drawing_id: drawingId }),
  });
}

export async function getPublishedDrawings(projectId: string): Promise<DrawingNode[]> {
  return bffRequest<DrawingNode[]>('/method/buildpolaris_bff.api.document_control.get_published_drawings', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getAnnotations(revisionId: string): Promise<AnnotationNode[]> {
  return bffRequest<AnnotationNode[]>('/method/buildpolaris_bff.api.document_control.get_annotations', {
    method: 'POST',
    body: JSON.stringify({ revision_id: revisionId }),
  });
}

export async function createDrawing(payload: {
  project: string;
  sheet_number: string;
  title: string;
  discipline?: string;
  classification_code?: string;
}): Promise<string> {
  return bffRequest<string>('/method/buildpolaris_bff.application.document_control_service.create_drawing', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createRevision(payload: {
  drawing_id: string;
  revision_code: string;
  native_file?: string;
  rendition_file?: string;
}): Promise<string> {
  return bffRequest<string>('/method/buildpolaris_bff.application.document_control_service.create_revision', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function promoteToShared(revisionId: string): Promise<void> {
  await bffRequest('/method/buildpolaris_bff.application.document_control_service.promote_to_shared', {
    method: 'POST',
    body: JSON.stringify({ revision_id: revisionId }),
  });
}

export async function publishRevision(revisionId: string): Promise<void> {
  await bffRequest('/method/buildpolaris_bff.application.document_control_service.publish_revision', {
    method: 'POST',
    body: JSON.stringify({ revision_id: revisionId }),
  });
}




