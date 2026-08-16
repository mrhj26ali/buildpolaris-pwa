import { createRxDatabase, type RxCollection, type RxDatabase, addRxPlugin } from 'rxdb'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
import { wrappedKeyEncryptionCryptoJsStorage } from 'rxdb/plugins/encryption-crypto-js'
import { dailyLogSchema, type DailyLogDoc } from './schemas/dailyLog.schema'
import { jsaSchema, type JsaDoc } from './schemas/jsa.schema'
import { safetyIncidentSchema, type SafetyIncidentDoc } from './schemas/safetyIncident.schema'
import { punchItemSchema, type PunchItemDoc } from './schemas/punchListItem.schema'
import { tasksLookaheadSchema, type TaskLookaheadDoc } from './schemas/tasksLookahead.schema'
import { drawingRevisionsMetaSchema, type DrawingRevisionMetaDoc } from './schemas/drawingRevisionsMeta.schema'

if (import.meta.env.DEV) {
  addRxPlugin(RxDBDevModePlugin)
}

// Exactly the six collections ERD §5.1 enumerates. This union is intentionally
// closed — adding a seventh RxDB collection for a non-field-execution feature
// would violate ARCH §3.2's scope discipline ("this is not 'make the whole app
// offline'"); if that's ever genuinely needed, it belongs in a fresh ADR, not a
// silent addition here.
export interface BuildPolarisCollections {
  daily_logs: RxCollection<DailyLogDoc>
  jsas: RxCollection<JsaDoc>
  incidents: RxCollection<SafetyIncidentDoc>
  punch_items: RxCollection<PunchItemDoc>
  tasks_lookahead: RxCollection<TaskLookaheadDoc>
  drawing_revisions_meta: RxCollection<DrawingRevisionMetaDoc>
}

export type BuildPolarisDatabase = RxDatabase<BuildPolarisCollections>

let databasePromise: Promise<BuildPolarisDatabase> | null = null

// NFR-PRIV.1/.2 — safety_incidents in particular can carry sensitive personal
// data (names of involved persons, injury narratives), so its collection (and,
// for simplicity/consistency, every writable field-execution collection) is
// wrapped with RxDB's encryption-crypto-js storage plugin. Encryption is
// per-field via schema.encrypted (see the `encrypted` list below), backed by
// AES via crypto-js under the wrapped storage.
//
// LICENSING NOTE: rxdb/plugins/encryption-crypto-js is part of RxDB's premium
// plugin set as of v15+ and requires a valid RxDB premium/Pro license key at
// runtime (see https://rxdb.info/premium.html) — without one, collection
// creation throws. Call setRxDatabasePremiumKey (or the current v17
// equivalent — verify against your RxDB license tier before shipping) at app
// bootstrap. This file assumes that key is provided via
// import.meta.env.VITE_RXDB_PREMIUM_KEY; if your team is on the free tier,
// swap wrappedKeyEncryptionCryptoJsStorage(...) below back to a plain
// getRxStorageDexie() and track field-level encryption as a follow-up, since
// shipping unencrypted incident data is a real NFR-PRIV gap, not a
// cosmetic one.
const password = import.meta.env.VITE_RXDB_ENCRYPTION_PASSWORD ?? 'CHANGE_ME_DEV_ONLY_NOT_FOR_PRODUCTION'

const encryptedStorage = wrappedKeyEncryptionCryptoJsStorage({
  storage: getRxStorageDexie(),
})

export function getDatabase(): Promise<BuildPolarisDatabase> {
  if (!databasePromise) {
    databasePromise = createRxDatabase<BuildPolarisCollections>({
      name: 'buildpolaris-pwa',
      storage: encryptedStorage,
      password,
      multiInstance: false,
      eventReduce: true,
    }).then(async (database) => {
      await database.addCollections({
        daily_logs: { schema: dailyLogSchema },
        jsas: { schema: jsaSchema },
        incidents: { schema: safetyIncidentSchema },
        punch_items: { schema: punchItemSchema },
        tasks_lookahead: { schema: tasksLookaheadSchema },
        drawing_revisions_meta: { schema: drawingRevisionsMetaSchema },
      })
      return database
    })
  }
  return databasePromise
}
