export type ConflictResolutionAction = 'apply' | 'reject' | 'retry' | 'manual';

export interface ConflictResolution {
  action: ConflictResolutionAction;
  surfaceToUser: boolean;
  reason?: string;
}

export function resolveSyncConflict(
  collection: string,
  localDoc: any,
  serverDoc: any
): ConflictResolution {
  // Per ERD §5.4: daily_logs, jsas, incidents are append-only.
  if (['daily_logs', 'jsas', 'incidents'].includes(collection)) {
    return { action: 'apply', surfaceToUser: false, reason: 'Append-only collection.' };
  }

  // punch_items: manual conflict resolution
  if (collection === 'punch_items') {
    if (localDoc.status !== serverDoc.status || localDoc.assigned_to !== serverDoc.assigned_to) {
      return {
        action: 'manual',
        surfaceToUser: true,
        reason: 'Punch item modified locally and server-side simultaneously.',
      };
    }
  }

  return { action: 'apply', surfaceToUser: false };
}
