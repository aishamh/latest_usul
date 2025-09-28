import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom message interface for storage
export interface StoredMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Chat interface based on Usul's implementation
export interface Chat {
  id: string;
  title: string;
  messages: StoredMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Web-only Dexie database (lazy loaded)
let webDB: any = null;

// Initialize database based on platform
export async function initializeDatabase() {
  try {
    if (Platform.OS === 'web') {
      // Dynamically import Dexie only on web
      const Dexie = (await import('dexie')).default;
      
      class UsulChatDatabase extends Dexie {
        chats!: any;

        constructor() {
          super('UsulChatDB');
          this.version(1).stores({
            chats: 'id, title, createdAt, updatedAt'
          });
        }
      }
      
      webDB = new UsulChatDatabase();
      await webDB.open();
      console.log('Web database initialized successfully');
    } else {
      // Use AsyncStorage for React Native
      console.log('Using AsyncStorage for React Native');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Auto-initialize database on web
if (typeof window !== 'undefined') {
  initializeDatabase();
}

// Database operations abstraction
export const db = {
  chats: {
    async get(id: string): Promise<Chat | undefined> {
      if (Platform.OS === 'web' && webDB) {
        return await webDB.chats.get(id);
      } else {
        const stored = await AsyncStorage.getItem(`chat_${id}`);
        return stored ? JSON.parse(stored) : undefined;
      }
    },

    async add(chat: Chat): Promise<void> {
      if (Platform.OS === 'web' && webDB) {
        await webDB.chats.add(chat);
      } else {
        await AsyncStorage.setItem(`chat_${chat.id}`, JSON.stringify(chat));
      }
    },

    async update(id: string, changes: Partial<Chat>): Promise<void> {
      if (Platform.OS === 'web' && webDB) {
        await webDB.chats.update(id, changes);
      } else {
        const existing = await this.get(id);
        if (existing) {
          const updated = { ...existing, ...changes };
          await AsyncStorage.setItem(`chat_${id}`, JSON.stringify(updated));
        }
      }
    }
  }
};