// Sync Engine stub. 
// Will handle pull/push between RxDB and BFF in the implementation phase.
export class SyncEngine {
  async start() { console.log('[SyncEngine] Starting sync engine... (Stubbed)'); }
  async stop() { console.log('[SyncEngine] Stopping sync engine... (Stubbed)'); }
}
export const syncEngine = new SyncEngine();



