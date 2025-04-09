import { createContext, useContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<User | undefined>;
  login: (email: string, password: string) => Promise<User | undefined>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
