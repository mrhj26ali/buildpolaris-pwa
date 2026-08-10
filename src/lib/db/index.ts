import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBValidationPlugin } from 'rxdb/plugins/validation';
import { dailyLogSchema, punchItemSchema } from './schemas/field';

addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBValidationPlugin);

let dbInstance: ReturnType<typeof createRxDatabase> | null = null;

export async function getDatabase() {
  if (!dbInstance) {
    dbInstance = createRxDatabase({
      name: 'buildpolarisdb',
      storage: getRxStorageDexie(),
      multiInstance: false,
    }).then(async (db) => {
      await db.addCollections({
        dailylogs: { schema: dailyLogSchema },
        punchitems: { schema: punchItemSchema },
      });
      return db;
    });
  }
  return dbInstance;
}
