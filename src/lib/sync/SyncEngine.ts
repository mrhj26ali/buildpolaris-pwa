import { bffRequest } from '@/lib/clients/bffClient';
import { getDatabase } from '@/lib/db/database';
import type { SyncMutationPayload, SyncResponse } from '@/types/sync';
import { resolveSyncConflict } from './conflictResolver';

export class SyncEngine {
  private started = false;
  private timer: number | null = null;
  private syncInProgress = false;

  async start() {
    if (this.started) return;
    this.started = true;
    await this.syncNow();
    if (typeof window !== 'undefined') {
      this.timer = window.setInterval(() => {
        this.syncNow().catch((error) => console.error('[SyncEngine] periodic sync failed', error));
      }, 30000);
      window.addEventListener('online', () => {
        this.syncNow().catch((error) => console.error('[SyncEngine] online sync failed', error));
      });
    }
  }

  async stop() {
    this.started = false;
    if (this.timer && typeof window !== 'undefined') {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  async queueMutation(mutation: SyncMutationPayload) {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      this.syncNow().catch(() => {});
    }
  }

  async syncNow(): Promise<SyncResponse | null> {
    if (this.syncInProgress) return null;
    this.syncInProgress = true;

    try {
      const db = await getDatabase();
      const collections = ['daily_logs', 'jsas', 'incidents', 'punch_items'] as const;
      
      const response: SyncResponse = {
        applied: [],
        conflicts: [],
        errors: [],
        server_timestamp: Date.now(),
      };

      for (const collName of collections) {
        const collection = db[collName];
        if (!collection) continue;

        const pendingDocs = await collection.find({ selector: { sync_status: 'pending' } }).exec();
        if (pendingDocs.length === 0) continue;

        const mutations = pendingDocs.map((doc) => ({
          local_uuid: doc.local_uuid,
          doctype: collName,
          action: doc.server_id ? 'update' : 'create',
          data: doc.toJSON(),
          base_version: doc._rev,
        }));

        try {
          const result = await bffRequest<SyncResponse>('/method/buildpolaris_bff.api.field.sync_field_mutations', {
            method: 'POST',
            body: JSON.stringify({ mutations, last_sync_timestamp: 0 }),
          });

          response.applied.push(...result.applied);
          response.conflicts.push(...result.conflicts);
          response.errors.push(...result.errors);

          for (const doc of pendingDocs) {
            const applied = result.applied.find((r) => r.local_uuid === doc.local_uuid);
            const conflict = result.conflicts.find((r) => r.local_uuid === doc.local_uuid);
            
            if (applied) {
              await doc.patch({ server_id: applied.server_id, sync_status: 'synced', synced_at: new Date().toISOString() });
            } else if (conflict) {
              const resolution = resolveSyncConflict(collName, doc.toJSON(), conflict.server_data);
              if (resolution.action === 'manual') {
                await doc.patch({ sync_status: 'conflict' });
              }
            }
          }
        } catch (error) {
          console.error(`[SyncEngine] Failed to sync ${collName}`, error);
        }
      }
      return response;
    } finally {
      this.syncInProgress = false;
    }
  }
}

export const syncEngine = new SyncEngine();
