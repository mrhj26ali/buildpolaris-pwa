import { bffRequest } from '@/lib/bffClient';

export interface TaskNode {
  name: string;
  task_name: string;
  parent_task: string | null;
  exp_start_date: string;
  exp_end_date: string;
  progress: number;
  is_critical: boolean;
  wbs_code: string;
}

export async function getWbsTree(projectId: string): Promise<TaskNode[]> {
  return bffRequest<TaskNode[]>('/method/buildpolaris_bff.api.scheduling.get_wbs_tree', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}

export async function saveDependency(projectId: string, predecessor: string, successor: string, type: string, lagDays: number) {
  return bffRequest('/method/buildpolaris_bff.api.scheduling.save_dependency', {
    method: 'POST',
    body: JSON.stringify({ project: projectId, predecessor, successor, type, lag_days: lagDays }),
  });
}

export async function getHealthCheck(projectId: string) {
  return bffRequest('/method/buildpolaris_bff.api.scheduling.get_health_check', {
    method: 'POST',
    body: JSON.stringify({ project: projectId }),
  });
}