import { bffRequest } from '@/lib/clients/bffClient';

export interface RFI { name: string; subject: string; status: string; priority: string; date_required?: string; }
export interface ActionItem { name: string; subject: string; status: string; priority: string; due_date?: string; }
export interface Submittal { name: string; subject: string; status: string; spec_section?: string; }
export interface Transmittal { name: string; subject: string; status: string; transmittal_date?: string; }

export interface CommDashboard {
  project: string;
  rfi_count: number;
  rfi_overdue: number;
  submittal_count: number;
  transmittal_count: number;
  action_item_count: number;
  action_item_overdue: number;
  total_overdue: number;
}

const BASE = '/method/buildpolaris_bff.api.communications';

// Reads
export const getRfiList = (project: string) => bffRequest<RFI[]>(`${BASE}.get_rfi_list`, { method: 'POST', body: JSON.stringify({ project }) });
export const getSubmittalList = (project: string) => bffRequest<Submittal[]>(`${BASE}.get_submittal_list`, { method: 'POST', body: JSON.stringify({ project }) });
export const getTransmittalList = (project: string) => bffRequest<Transmittal[]>(`${BASE}.get_transmittal_list`, { method: 'POST', body: JSON.stringify({ project }) });
export const getActionItemList = (project: string) => bffRequest<ActionItem[]>(`${BASE}.get_action_item_list`, { method: 'POST', body: JSON.stringify({ project }) });
export const getCommunicationsDashboard = (project: string) => bffRequest<CommDashboard>(`${BASE}.get_communications_dashboard`, { method: 'POST', body: JSON.stringify({ project }) });

// Mutations
export const createRfi = (payload: { project: string; subject: string; description?: string; priority?: string; date_required?: string }) => 
  bffRequest<{ name: string }>(`${BASE}.create_rfi`, { method: 'POST', body: JSON.stringify(payload) });

export const closeRfi = (project: string, rfiId: string) => 
  bffRequest<{ name: string }>(`${BASE}.close_rfi`, { method: 'POST', body: JSON.stringify({ project, rfi_id: rfiId }) });

export const createSubmittal = (payload: { project: string; subject: string; spec_section?: string }) => 
  bffRequest<{ name: string }>(`${BASE}.create_submittal`, { method: 'POST', body: JSON.stringify(payload) });

export const createTransmittal = (payload: { project: string; subject: string }) => 
  bffRequest<{ name: string }>(`${BASE}.create_transmittal`, { method: 'POST', body: JSON.stringify(payload) });

export const createActionItem = (payload: { project: string; subject: string; assigned_to?: string; due_date?: string; priority?: string }) => 
  bffRequest<{ name: string }>(`${BASE}.create_action_item`, { method: 'POST', body: JSON.stringify(payload) });

export const closeActionItem = (project: string, actionItemId: string) => 
  bffRequest<{ name: string }>(`${BASE}.close_action_item`, { method: 'POST', body: JSON.stringify({ project, action_item_id: actionItemId }) });
