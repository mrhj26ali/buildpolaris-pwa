import { getDatabase } from '@/lib/db/database';
import type { SyncMutationPayload } from '@/types/sync';

export async function drainOutbox(): Promise<SyncMutationPayload[]> {
  // The outbox is implicitly the documents in the RxDB collections with sync_status === 'pending'.
  // This file serves as the architectural boundary for outbox operations as defined in ARCH §6.2.
  const db = await getDatabase();
  const collections = ['daily_logs', 'jsas', 'incidents', 'punch_items'] as const;
  const mutations: SyncMutationPayload[] = [];

  for (const collName of collections) {
    const collection = db[collName];
    if (!collection) continue;
    const pending = await collection.find({ selector: { sync_status: 'pending' } }).exec();
    for (const doc of pending) {
      mutations.push({
        local_uuid: doc.local_uuid,
        target_collection: collName,
        operation: doc.server_id ? 'update' : 'create',
        payload: doc.toJSON(),
      });
    }
  }
  return mutations;
}
