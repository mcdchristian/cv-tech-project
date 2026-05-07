import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthUser { id: number; username: string; email: string; role: string; }

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loginAction: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

function decodePayload(token: string): AuthUser | null {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64);
    return JSON.parse(json);
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cv_tech_token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const t = localStorage.getItem('cv_tech_token');
    return t ? decodePayload(t) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('cv_tech_token', token);
      setUser(decodePayload(token));
    } else {
      localStorage.removeItem('cv_tech_token');
      setUser(null);
    }
  }, [token]);

  const loginAction = (newToken: string) => setToken(newToken);
  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ user, token, loginAction, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
