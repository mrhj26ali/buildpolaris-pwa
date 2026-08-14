import { getDatabase } from '../database';
import type { DailyLog } from '@/types/domain';

export const dailyLogRepository = {
  async findByProject(projectId: string): Promise<DailyLog[]> {
    const db = await getDatabase();
    const docs = await db.daily_logs.find({ selector: { project: projectId }, sort: [{ log_date: 'desc' }] }).exec();
    return docs.map(d => d.toJSON());
  },

  async getPendingCount(): Promise<number> {
    const db = await getDatabase();
    const docs = await db.daily_logs.find({ selector: { sync_status: 'pending' } }).exec();
    return docs.length;
  },

  async getConflicts(): Promise<DailyLog[]> {
    const db = await getDatabase();
    const docs = await db.daily_logs.find({ selector: { sync_status: 'conflict' } }).exec();
    return docs.map(d => d.toJSON());
  }
};
