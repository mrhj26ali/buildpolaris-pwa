import { getSessionContext, type SessionContext } from './session';

let cachedContext: SessionContext | null = null;
let fetchPromise: Promise<SessionContext | null> | null = null;

/**
 * Module-level cache for the session context (FR-1.5).
 * Ensures identity, Role, Company, and assigned Projects are resolved in a single call 
 * and cached for application bootstrap without N round trips.
 */
export async function getAuthContext(): Promise<SessionContext | null> {
  if (cachedContext) return cachedContext;
  
  if (!fetchPromise) {
    fetchPromise = getSessionContext()
      .then(ctx => {
        cachedContext = ctx;
        return ctx;
      })
      .catch((err) => {
        console.error('[AuthStore] Failed to bootstrap session context', err);
        fetchPromise = null;
        return null;
      });
  }
  
  return fetchPromise;
}

export function clearAuthContext() {
  cachedContext = null;
  fetchPromise = null;
}
