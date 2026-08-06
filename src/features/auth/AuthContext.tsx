import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User { email: string; fullName: string; roles: string[] }
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Stubbed for chore branch. Will connect to BFF in implementation phase.
    setIsLoading(false); 
  }, []);

  async function login(email: string, password: string) {
    console.log('Login stubbed', email, password);
    setUser({ email, fullName: email, roles: ['Admin'] });
  }

  async function logout() {
    setUser(null);
  }

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