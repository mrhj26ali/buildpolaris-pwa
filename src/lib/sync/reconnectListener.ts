import { syncEngine } from './SyncEngine';

let initialized = false;

export function initReconnectListener() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  
  window.addEventListener('online', () => {
    console.info('[BuildPolaris] Network online, triggering sync...');
    syncEngine.syncNow().catch(err => console.error('[SyncEngine] Reconnect sync failed', err));
  });
}
