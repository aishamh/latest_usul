// Local-only authentication (without Firebase)
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { User } from '../store/authStore';

const USERS_STORAGE_KEY = 'usul_local_users';
const CURRENT_USER_KEY = 'usul_current_user';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // Hashed password using SHA-256
  provider: 'email' | 'local';
  createdAt: string;
}

// Hash password using SHA-256
async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
}

// Verify password against hash
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Get all stored users
async function getStoredUsers(): Promise<StoredUser[]> {
  try {
    const data = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading stored users:', error);
    return [];
  }
}

// Save users to storage
async function saveStoredUsers(users: StoredUser[]): Promise<void> {
  try {
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users:', error);
    throw new Error('Failed to save user data');
  }
}

// Create a new local user
export async function createLocalUser(email: string, password: string, name?: string): Promise<User> {
  const users = await getStoredUsers();
  
  // Check if user already exists
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password before storing
  const passwordHash = await hashPassword(password);

  // Create new user
  const newUser: StoredUser = {
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: email.trim(),
    name: name || email.split('@')[0],
    passwordHash,
    provider: 'local',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveStoredUsers(users);

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = newUser;
  return {
    ...userWithoutPassword,
    provider: 'email',
  } as User;
}

// Sign in with local credentials
export async function signInLocal(email: string, password: string): Promise<User> {
  const users = await getStoredUsers();
  
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password against stored hash
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    provider: 'email',
  } as User;
}

// Get current user
export async function getCurrentLocalUser(): Promise<User | null> {
  try {
    const data = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading current user:', error);
    return null;
  }
}

// Save current user
export async function setCurrentLocalUser(user: User | null): Promise<void> {
  try {
    if (user) {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (error) {
    console.error('Error saving current user:', error);
  }
}

// Sign out
export async function signOutLocal(): Promise<void> {
  await setCurrentLocalUser(null);
}

// Get all users (for debugging)
export async function getAllLocalUsers(): Promise<Omit<StoredUser, 'passwordHash'>[]> {
  const users = await getStoredUsers();
  return users.map(({ passwordHash, ...user }) => user);
}

