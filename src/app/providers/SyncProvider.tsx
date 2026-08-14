import { useEffect, type ReactNode } from 'react'
import { syncEngine } from '@/lib/sync/SyncEngine'
import { getDatabase } from '@/lib/db/database'

// Starts RxDB + SyncEngine once, for the lifetime of the app shell. Placed as
// its own provider (rather than inlined in main.tsx) so it can be skipped in
// route-level unit tests that don't need real IndexedDB.
export function SyncProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void getDatabase().then(() => syncEngine.start())
    return () => syncEngine.stop()
  }, [])

  return <>{children}</>
}
