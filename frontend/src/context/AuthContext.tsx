import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, TOKEN_KEY, decodeToken } from './auth-context';
import { setUnauthorizedHandler } from '../api/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    // Un token déjà expiré au chargement ne doit pas ouvrir une session morte.
    return stored && decodeToken(stored) ? stored : null;
  });

  // `user` est entièrement dérivé du token : le calculer évite l'aller-retour
  // setState-dans-un-effet et la passe où user est null alors que token existe.
  const user = useMemo(() => (token ? decodeToken(token) : null), [token]);

  const logout = useCallback(() => setToken(null), []);

  // L'effet ne fait que synchroniser le stockage, son vrai rôle.
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  // Un 401 renvoyé par l'API signifie que le token n'est plus accepté :
  // le purger ramène l'utilisateur au formulaire de connexion au lieu de le
  // laisser sur une interface qui échoue à chaque action.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Déconnecte à l'échéance exacte, sans attendre le prochain appel raté.
  useEffect(() => {
    if (!user?.exp) return;
    // Un délai négatif déclenche le timer au tick suivant : pas besoin d'un
    // cas particulier pour un token déjà échu, et cela évite un setState
    // synchrone dans le corps de l'effet.
    const msLeft = Math.max(0, user.exp * 1000 - Date.now());
    const timer = setTimeout(() => setToken(null), msLeft);
    return () => clearTimeout(timer);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      token,
      loginAction: (newToken: string) => setToken(newToken),
      logout,
      isAuthenticated: !!token,
    }),
    [user, token, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
