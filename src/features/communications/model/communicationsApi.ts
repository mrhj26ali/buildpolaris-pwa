import { bffRequest } from '@/lib/clients/bffClient'
import type { Rfi, SubmittalPackage, Transmittal, MeetingSeries, MeetingMinutes, ActionItem, SubmittalLineStatus } from '@/types/domain'

export async function listRfis(project: string): Promise<Rfi[]> {
  return bffRequest<Rfi[]>(`/method/buildpolaris_bff.communications.api.list_rfis?project=${encodeURIComponent(project)}`, {
    method: 'GET',
  })
}

export interface CreateRfiPayload {
  project: string
  subject: string
  question: string
  assigned_to: string
  due_date: string
}

export async function createRfi(payload: CreateRfiPayload): Promise<Rfi> {
  return bffRequest<Rfi>('/method/buildpolaris_bff.communications.api.create_rfi', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function respondToRfi(name: string, response: string): Promise<Rfi> {
  return bffRequest<Rfi>('/method/buildpolaris_bff.communications.api.answer_rfi', {
    method: 'POST',
    body: JSON.stringify({ rfi: name, response }), // Note: BFF expects 'rfi', not 'name'
  })
}

export async function closeRfi(name: string): Promise<Rfi> {
  return bffRequest<Rfi>('/method/buildpolaris_bff.communications.api.close_rfi', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function listSubmittals(project: string): Promise<SubmittalPackage[]> {
  return bffRequest<SubmittalPackage[]>(
    `/method/buildpolaris_bff.communications.api.list_submittals?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}

export interface CreateSubmittalPayload {
  project: string
  spec_section: string
  line_descriptions: string[]
}

export async function createSubmittal(payload: CreateSubmittalPayload): Promise<SubmittalPackage> {
  return bffRequest<SubmittalPackage>('/method/buildpolaris_bff.communications.api.create_submittal', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function reviewSubmittalLine(
  submittal: string,
  lineName: string,
  status: SubmittalLineStatus,
): Promise<SubmittalPackage> {
  return bffRequest<SubmittalPackage>('/method/buildpolaris_bff.communications.api.review_submittal_line', {
    method: 'POST',
    body: JSON.stringify({ submittal, line: lineName, status }),
  })
}

export async function listTransmittals(project: string): Promise<Transmittal[]> {
  return bffRequest<Transmittal[]>(
    `/method/buildpolaris_bff.communications.api.list_transmittals?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}

export async function listMeetingSeries(project: string): Promise<MeetingSeries[]> {
  return bffRequest<MeetingSeries[]>(
    `/method/buildpolaris_bff.communications.api.list_meeting_series?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}

export async function listMeetingMinutes(series: string): Promise<MeetingMinutes[]> {
  return bffRequest<MeetingMinutes[]>(
    `/method/buildpolaris_bff.communications.api.list_meeting_minutes?series=${encodeURIComponent(series)}`,
    { method: 'GET' },
  )
}

export async function listActionItems(project: string): Promise<ActionItem[]> {
  return bffRequest<ActionItem[]>(
    `/method/buildpolaris_bff.communications.api.list_action_items?project=${encodeURIComponent(project)}`,
    { method: 'GET' },
  )
}

export async function completeActionItem(name: string): Promise<ActionItem> {
  return bffRequest<ActionItem>('/method/buildpolaris_bff.communications.api.close_action_item', {
    method: 'POST',
    body: JSON.stringify({ action_item: name }), // Note: BFF expects 'action_item'
  })
}

// --- Meetings ---
export interface RecordMinutesPayload {
  series: string
  occurred_at: string
  notes: string
  action_items?: Array<{
    subject: string
    assigned_to: string
    due_date: string
  }>
}

export async function recordMinutes(payload: RecordMinutesPayload): Promise<MeetingMinutes> {
  return bffRequest<MeetingMinutes>('/method/buildpolaris_bff.communications.api.record_minutes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}