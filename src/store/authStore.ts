import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

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

// Subscribe to Firebase auth state and hydrate from storage as fallback
const initializeAuth = async () => {
  try {
    // First, try to hydrate from storage to avoid flicker
    const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      useAuthStore.setState({ user, isAuthenticated: true, isLoading: false });
    } else {
      useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: true });
    }
  } catch {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: true });
  }

  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const unified: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || 'unknown@user',
        name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
        provider: (firebaseUser.providerData?.[0]?.providerId?.includes('apple')
          ? 'apple'
          : firebaseUser.providerData?.[0]?.providerId?.includes('google')
            ? 'google'
            : 'email') as User['provider'],
        avatar: firebaseUser.photoURL || undefined,
      };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(unified));
      useAuthStore.setState({ user: unified, isAuthenticated: true, isLoading: false });
    } else {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  });
};

if (typeof window !== 'undefined') {
  initializeAuth();
}