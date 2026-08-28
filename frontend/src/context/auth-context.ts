import { createContext, useContext } from 'react';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loginAction: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Séparé de AuthContext.tsx : un module qui exporte autre chose que des
// composants casse le Fast Refresh de Vite (react-refresh/only-export-components).
export const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}
