import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getSessionContext, SessionContext } from '@/lib/auth/session';
import { bffRequest } from '@/lib/clients/bffClient';

interface AuthContextValue {
  user: SessionContext | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const ctx = await getSessionContext();
      setUser(ctx);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const login = async (email: string, password: string) => {
    await bffRequest('/method/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ usr: email, pwd: password }),
    });
    await refresh();
  };

  const logout = async () => {
    await bffRequest('/method/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
