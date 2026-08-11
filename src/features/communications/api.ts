// src/features/communications/api.ts
import { bffRequest } from '@/lib/clients/bffClient';

export interface RFINode {
  name: string;
  rfi_number: string;
  subject: string;
  status: 'Draft' | 'Open' | 'Answered' | 'Closed';
  raised_by: string;
  assigned_to: string;
  requested_reply_date: string | null;
  cost_impact: number;
  schedule_impact: number;
}

export interface SubmittalNode {
  name: string;
  spec_section: string;
  status: string;
  revision_number: number;
  ball_in_court: string;
  required_by_date: string | null;
}

export interface ActionItemNode {
  name: string;
  subject: string;
  assigned_to: string;
  due_date: string | null;
  priority: string;
  status: string;
}

export async function getRfiList(projectId: string): Promise<RFINode[]> {
  return bffRequest<RFINode[]>('/method/buildpolaris_bff.api.communications.get_rfi_list', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getSubmittalList(projectId: string): Promise<SubmittalNode[]> {
  return bffRequest<SubmittalNode[]>('/method/buildpolaris_bff.api.communications.get_submittal_list', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function getActionItemList(projectId: string): Promise<ActionItemNode[]> {
  return bffRequest<ActionItemNode[]>('/method/buildpolaris_bff.api.communications.get_action_item_list', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function createRfi(payload: {
  project: string;
  subject: string;
  description?: string;
}): Promise<string> {
  return bffRequest<string>('/method/buildpolaris_bff.application.communications_service.create_rfi', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}



