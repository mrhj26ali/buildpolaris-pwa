import Dexie, { type Table } from 'dexie'

interface PendingMedia {
  local_file_ref: string
  file: Blob
  fileName: string
  mimeType: string
}

class MediaCacheDB extends Dexie {
  pendingFiles!: Table<PendingMedia, string>
  constructor() {
    super('buildpolaris_media_cache')
    this.version(1).stores({
      pendingFiles: 'local_file_ref',
    })
  }
}

export const mediaCacheDB = new MediaCacheDB()

export async function storePendingMedia(local_file_ref: string, file: File) {
  await mediaCacheDB.pendingFiles.put({
    local_file_ref,
    file: file,
    fileName: file.name,
    mimeType: file.type,
  })
}

export async function uploadPendingMediaForRefs(refs: string[]): Promise<Record<string, string>> {
  const mapping: Record<string, string> = {}
  if (refs.length === 0) return mapping

  const pending = await mediaCacheDB.pendingFiles.where('local_file_ref').anyOf(refs).toArray()
  for (const item of pending) {
    try {
      const fileToUpload = new File([item.file], item.fileName, { type: item.mimeType })
      // Dynamic import to avoid circular dependency with bffClient
      const { uploadFile } = await import('@/lib/clients/bffClient')
      const frappeFileName = await uploadFile(fileToUpload)
      mapping[item.local_file_ref] = frappeFileName
      await mediaCacheDB.pendingFiles.delete(item.local_file_ref)
    } catch (e) {
      console.error('Failed to upload pending media', item.local_file_ref, e)
      // Leave it in the cache for the next sync cycle
    }
  }
  return mapping
}