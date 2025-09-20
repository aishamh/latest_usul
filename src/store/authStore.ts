import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'apple' | 'google' | 'email';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: (user: User) => set({ user, isAuthenticated: true, isLoading: false }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
})); 