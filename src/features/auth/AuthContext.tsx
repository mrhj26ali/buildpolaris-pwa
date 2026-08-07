import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getSessionContext, loginRequest, logoutRequest } from './api'
import { clearCsrfToken } from '@/lib/bffClient'
import type { User } from '@/types/auth'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function refresh() {
    try {
      setUser(await getSessionContext())
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    refresh().finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    await loginRequest({ usr: email, pwd: password })
    await refresh()
  }

  async function logout() {
    try {
      await logoutRequest()
    } finally {
      clearCsrfToken()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}