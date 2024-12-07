export interface User {
  id: string;
  email: string;
  name: string;
  role: 'jobseeker' | 'employer';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AppState {
  auth: AuthState;
} 