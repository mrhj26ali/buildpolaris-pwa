import { useCallback, useSyncExternalStore } from 'react'
import { getAuthState, subscribeAuth, setAuthenticated, setUnauthenticated, setLoading } from './authStore'
import { login as loginRequest, logout as logoutRequest, getSessionContext } from './session'
import { BffApiError } from '@/lib/clients/bffClient'

export function useAuthState() {
  return useSyncExternalStore(subscribeAuth, getAuthState, getAuthState)
}

export function useAuth() {
  const state = useAuthState()

  const bootstrap = useCallback(async () => {
    setLoading()
    try {
      const session = await getSessionContext()
      setAuthenticated(session)
    } catch (error) {
      if (error instanceof BffApiError && error.status === 401) {
        setUnauthenticated()
      } else {
        setUnauthenticated()
      }
    }
  }, [])

  const login = useCallback(async (usr: string, pwd: string) => {
    await loginRequest(usr, pwd)
    await bootstrap()
  }, [bootstrap])

  const logout = useCallback(async () => {
    await logoutRequest()
    setUnauthenticated()
  }, [])

  return {
    status: state.status,
    session: state.status === 'authenticated' ? state.session : null,
    isAuthenticated: state.status === 'authenticated',
    isAdmin: state.status === 'authenticated' && state.session.is_admin,
    bootstrap,
    login,
    logout,
  }
}
