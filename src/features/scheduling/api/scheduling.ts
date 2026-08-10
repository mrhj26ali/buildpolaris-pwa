import { bffRequest } from '@/lib/bffClient';

export interface CpmTask {
  id: string;
  duration: number;
  predecessors: string[];
  start_date?: string;
  finish_date?: string;
  total_float?: number;
  is_critical?: boolean;
}

export interface CpmResult {
  tasks: CpmTask[];
  critical_path: string[];
  project_duration: number;
  project_finish_date: string;
}

export async function runCpmEngine(tasks: CpmTask[], projectStartDate: string) {
  return bffRequest<CpmResult>('/method/buildpolaris_bff.api.scheduling.run_cpm_engine', {
    method: 'POST',
    body: JSON.stringify({ tasks, project_start_date: projectStartDate }),
  });
}

export async function createBaseline(project: string, baselineName: string) {
  return bffRequest<{ baseline: string }>('/method/buildpolaris_bff.api.scheduling.create_baseline', {
    method: 'POST',
    body: JSON.stringify({ project, baseline_name: baselineName }),
  });
}
