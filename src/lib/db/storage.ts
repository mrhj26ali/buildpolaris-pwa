import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'

export function createAppStorage() {
  return getRxStorageDexie()
}