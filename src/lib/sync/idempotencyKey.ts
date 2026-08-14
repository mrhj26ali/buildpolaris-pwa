export function generateIdempotencyKey(localUuid: string, operation: string): string {
  return `${localUuid}-${operation}-${Date.now()}`;
}
