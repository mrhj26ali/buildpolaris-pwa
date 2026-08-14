import { createRxDatabase, type RxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { dailyLogSchema } from './schemas/dailyLog.schema';
import { punchListItemSchema } from './schemas/punchListItem.schema';

export type BuildPolarisDatabase = RxDatabase;

let databasePromise: Promise<BuildPolarisDatabase> | null = null;

export function getDatabase(): Promise<BuildPolarisDatabase> {
  if (!databasePromise) {
    databasePromise = createRxDatabase({
      name: 'buildpolaris-pwa',
      storage: getRxStorageDexie(),
      multiInstance: false,
    }).then(async (database) => {
      await database.addCollections({
        daily_logs: { schema: dailyLogSchema },
        punch_items: { schema: punchListItemSchema },
      });
      return database;
    });
  }
  return databasePromise;
}
