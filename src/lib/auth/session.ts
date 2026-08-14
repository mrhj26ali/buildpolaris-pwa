import { bffRequest } from '@/lib/clients/bffClient';

export interface SessionContext {
  user: string;
  full_name: string;
  roles: string[];
  persona: string;
  company: string | null;
  is_admin: boolean;
  projects?: Array<{ name: string; project_name?: string }>;
}

export async function getSessionContext(): Promise<SessionContext> {
  return bffRequest<SessionContext>('/method/buildpolaris_bff.api.v1.auth.get_session_context');
}
