const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

function getToken(): string | null {
  return localStorage.getItem('cv_tech_token');
}

/**
 * Permet à AuthProvider de réagir à un 401 sans que ce module importe React.
 * Sans ce rappel, un token refusé laissait l'interface en session ouverte et
 * chaque action se soldait par « Unauthorized » jusqu'à déconnexion manuelle.
 */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    // 401 sur une route authentifiée = token expiré ou révoqué. La connexion
    // elle-même renvoie aussi 401 sur mauvais identifiants : ne pas la traiter
    // comme une expiration, sinon on efface un token qui n'existe pas encore.
    if (response.status === 401 && !endpoint.startsWith('/user/login')) {
      onUnauthorized?.();
    }
    const err = await response.json().catch(() => ({}));
    const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message || `Erreur ${response.status}`;
    throw new Error(msg);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

export interface RegisterData { username: string; email: string; password: string; }
export interface LoginData { username: string; password: string; }
export interface LoginResponse { access_token: string; }
export interface UserInfo { id: number; username: string; email: string; role: string; }

export interface Cv {
  id: number; name: string; firstname: string; age: number;
  cin: number; job: string; path?: string;
  createdAt?: string; updatedAt?: string; deletedAt?: string | null;
}

export interface CvCreateData { name: string; firstname: string; age: number; cin: number; job: string; path?: string; }
export type CvUpdateData = Partial<CvCreateData>;
export interface CvStat { age: number; nombreDeCv: string; }

export const register = (data: RegisterData) => request<UserInfo>('/user', { method: 'POST', body: JSON.stringify(data) });
export const login = (data: LoginData) => request<LoginResponse>('/user/login', { method: 'POST', body: JSON.stringify(data) });
export const getCvs = () => request<Cv[]>('/cv');
export const getCvById = (id: number) => request<Cv>(`/cv/${id}`);
export const createCv = (data: CvCreateData) => request<Cv>('/cv', { method: 'POST', body: JSON.stringify(data) });
export const updateCv = (id: number, data: CvUpdateData) => request<Cv>(`/cv/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteCv = (id: number) => request<void>(`/cv/${id}`, { method: 'DELETE' });
export const restoreCv = (id: number) => request<void>(`/cv/${id}/restore`, { method: 'PATCH' });
export const getCvStats = () => request<CvStat[]>('/cv/stats');
