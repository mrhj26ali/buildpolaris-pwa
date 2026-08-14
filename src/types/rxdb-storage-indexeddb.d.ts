declare module 'rxdb/plugins/storage-indexeddb' {
  import type { RxStorage } from 'rxdb'
  export function getRxStorageIndexedDB(): RxStorage<any, any>
}
