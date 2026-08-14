import { createRxDatabase, type RxCollection, type RxDatabase } from 'rxdb'
import { createAppStorage } from '~db-storage'
import {
  dailyLogSchema,
  jsaSchema,
  mutationQueueSchema,
  punchItemSchema,
  safetyIncidentSchema,
  type DailyLogDoc,
  type JsaDoc,
  type MutationQueueDoc,
  type PunchItemDoc,
  type SafetyIncidentDoc,
} from './schemas/field'

export interface BuildPolarisCollections {
  daily_logs: RxCollection<DailyLogDoc>
  jsa: RxCollection<JsaDoc>
  safety_incidents: RxCollection<SafetyIncidentDoc>
  punch_items: RxCollection<PunchItemDoc>
  mutation_queue: RxCollection<MutationQueueDoc>
}

export type BuildPolarisDatabase = RxDatabase<BuildPolarisCollections>

let databasePromise: Promise<BuildPolarisDatabase> | null = null

export function getDatabase(): Promise<BuildPolarisDatabase> {
  if (!databasePromise) {
    databasePromise = createRxDatabase<BuildPolarisCollections>({
      name: 'buildpolaris-pwa',
      storage: createAppStorage(),
      multiInstance: false,
    }).then(async (database) => {
      await database.addCollections({
        daily_logs: { schema: dailyLogSchema },
        jsa: { schema: jsaSchema },
        safety_incidents: { schema: safetyIncidentSchema },
        punch_items: { schema: punchItemSchema },
        mutation_queue: { schema: mutationQueueSchema },
      })
      return database
    })
  }
  return databasePromise
}

export async function queueOfflineMutation(
  input: Omit<MutationQueueDoc, 'created_at' | 'modified' | 'retry_count' | 'status'> & {
    created_at?: string
    modified?: number
    retry_count?: number
    status?: MutationQueueDoc['status']
  },
) {
  const db = await getDatabase()
  const payload = {
    ...input,
    created_at: input.created_at ?? new Date().toISOString(),
    modified: input.modified ?? Date.now(),
    retry_count: input.retry_count ?? 0,
    status: input.status ?? 'pending',
  }
  await db.mutation_queue.insert(payload)
  return payload
}
