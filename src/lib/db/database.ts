import { createRxDatabase, type RxCollection, type RxDatabase, addRxPlugin } from 'rxdb'
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'
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

export function getDatabase(): Promise<BuildPolarisDatabase> {
  if (!databasePromise) {
    databasePromise = createRxDatabase<BuildPolarisCollections>({
      name: 'buildpolaris-pwa',
      storage: getRxStorageDexie(),
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
