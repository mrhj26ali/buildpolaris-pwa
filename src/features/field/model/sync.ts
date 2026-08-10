import { getDatabase } from '@/lib/db';
import { syncFieldMutations, FieldMutation } from '../api/sync';

export async function queueMutation(collection: string, data: any) {
  const db = await getDatabase();
  const local_id = crypto.randomUUID();
  const doc = await db[collection].insert({
    ...data,
    local_id,
    modified: Date.now(),
    synced: false,
  });
  return doc;
}

export async function runSync() {
  const db = await getDatabase();
  const collections = ['dailylogs', 'punchitems'];
  
  let lastSync = parseInt(localStorage.getItem('bp_last_sync') || '0', 10);
  const unsyncedDocs: FieldMutation[] = [];
  
  for (const colName of collections) {
    const col = db[colName];
    if (!col) continue;
    const docs = await col.find({ selector: { synced: false } }).exec();
    unsyncedDocs.push(...docs.map(d => ({
      local_id: d.local_id,
      server_name: d.server_name,
      doctype: colName === 'dailylogs' ? 'Daily Log' : 'Punch List Item',
      action: d.server_name ? 'update' : 'create',
      data: d.toJSON(),
    })));
  }
  
  if (unsyncedDocs.length === 0) return;
  
  try {
    const result = await syncFieldMutations(unsyncedDocs, lastSync);
    if (result.data) {
      for (const applied of result.data.applied) {
        // Update local doc with server_name and synced status
        // Implementation depends on specific RxDB collection mapping
      }
      localStorage.setItem('bp_last_sync', result.data.server_timestamp.toString());
    }
  } catch (e) {
    console.error('Sync failed', e);
  }
}
