// Stub for AI sidecar communication. To be implemented in the AI phase.
export class AiClientError extends Error {}

export async function aiRequest<T>(_path: string, _options: RequestInit = {}): Promise<T> {
  throw new Error('AI Sidecar is not yet implemented. This is a stub.');
}