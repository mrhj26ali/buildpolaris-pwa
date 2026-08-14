// Session-context cache. Per ARCH §4.1: "cached in lib/auth/authStore.ts, never
// re-derived per-screen." A tiny external store (subscribe/getSnapshot) so it can
// back useSyncExternalStore in useAuth.ts without a context provider re-render
// tax on every feature slice.

import type { SessionContext } from '@/types/domain'

export type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; session: SessionContext }
  | { status: 'unauthenticated' }

type Listener = () => void

let state: AuthState = { status: 'loading' }
const listeners = new Set<Listener>()

export function getAuthState(): AuthState {
  return state
}

export function subscribeAuth(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function setState(next: AuthState) {
  state = next
  listeners.forEach((l) => l())
}

export function setAuthenticated(session: SessionContext) {
  setState({ status: 'authenticated', session })
}

export function setUnauthenticated() {
  setState({ status: 'unauthenticated' })
}

export function setLoading() {
  setState({ status: 'loading' })
}

export function hasRole(role: string): boolean {
  return state.status === 'authenticated' && state.session.roles.includes(role as never)
}

export function isProjectAssigned(projectName: string): boolean {
  if (state.status !== 'authenticated') return false
  return state.session.projects.some((p) => p.name === projectName)
}
