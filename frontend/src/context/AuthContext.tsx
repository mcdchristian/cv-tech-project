import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthUser } from './auth-context';

const TOKEN_KEY = 'cv_tech_token';

function decodePayload(token: string): AuthUser | null {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64);
    return JSON.parse(json) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  // `user` est entièrement dérivé du token : le calculer évite l'aller-retour
  // setState-dans-un-effet, qui provoquait un rendu supplémentaire et une passe
  // où l'utilisateur était null alors que le token était déjà présent.
  const user = useMemo(() => (token ? decodePayload(token) : null), [token]);

  // L'effet ne fait plus que synchroniser le stockage, son vrai rôle.
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loginAction: (newToken: string) => setToken(newToken),
      logout: () => setToken(null),
      isAuthenticated: !!token,
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
