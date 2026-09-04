import { createContext, useContext } from 'react';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  /** Expiration UNIX (secondes) posée par le backend dans le JWT. */
  exp?: number;
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

export const TOKEN_KEY = 'cv_tech_token';

/**
 * Décode le payload d'un JWT et rejette un token expiré.
 *
 * Le `exp` n'est pas une garantie de sécurité — c'est le backend qui refuse
 * un token périmé. Il sert ici à ne pas afficher une session ouverte alors
 * que chaque appel va échouer en 401.
 */
export function decodeToken(token: string): AuthUser | null {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload)) as AuthUser;
    if (typeof decoded.exp === 'number' && decoded.exp * 1000 <= Date.now()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}
