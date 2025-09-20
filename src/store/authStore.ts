import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

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

const AUTH_STORAGE_KEY = 'usul_auth_user';

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check for stored auth
  login: async (user: User) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Failed to save auth state:', error);
      set({ user, isAuthenticated: true, isLoading: false }); // Still login but without persistence
    }
  },
  logout: async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear auth state:', error);
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));

// Initialize auth state from storage
const initializeAuth = async () => {
  try {
    const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      useAuthStore.setState({ user, isAuthenticated: true, isLoading: false });
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    useAuthStore.setState({ isLoading: false });
  }
};

// Initialize when running in browser environment
if (typeof window !== 'undefined') {
  initializeAuth();
} else {
  // For server-side rendering, set loading to false immediately
  useAuthStore.setState({ isLoading: false });
} 