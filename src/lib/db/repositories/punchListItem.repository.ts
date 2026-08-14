import { getDatabase } from '../database';
import type { PunchItem } from '@/types/domain';

export const punchListItemRepository = {
  async findByProject(projectId: string): Promise<PunchItem[]> {
    const db = await getDatabase();
    const docs = await db.punch_items.find({ selector: { project: projectId } }).exec();
    return docs.map(d => d.toJSON());
  },

  async getConflicts(): Promise<PunchItem[]> {
    const db = await getDatabase();
    const docs = await db.punch_items.find({ selector: { sync_status: 'conflict' } }).exec();
    return docs.map(d => d.toJSON());
  },

  async updateSyncStatus(localUuid: string, status: 'pending' | 'synced' | 'conflict', serverId?: string) {
    const db = await getDatabase();
    const doc = await db.punch_items.findOne(localUuid).exec();
    if (doc) {
      await doc.patch({ 
        sync_status: status, 
        synced_at: status === 'synced' ? new Date().toISOString() : null,
        server_id: serverId ?? doc.server_id
      });
    }
  }
};
