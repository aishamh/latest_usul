import { create } from 'zustand';
import { Conversation, Message } from '../types/conversation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConversationState {
  conversations: Conversation[];
  currentConversationId: string | null;
  setCurrentConversationId: (id: string) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  addMessage: (conversationId: string, message: Message) => void;
  getConversationById: (id: string) => Conversation | undefined;
}

const CONVERSATIONS_STORAGE_KEY = 'usul_conversations';

const saveConversations = async (conversations: Conversation[]) => {
  try {
    await AsyncStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save conversations:', error);
  }
};

export const useConversationStore = create<ConversationState>()((set, get) => ({
  conversations: [],
  currentConversationId: null,
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  addConversation: (conversation) => {
    const newState = [conversation, ...get().conversations];
    set({ conversations: newState });
    saveConversations(newState);
  },
  updateConversation: (id, updates) => {
    const newState = get().conversations.map((conv) =>
      conv.id === id ? { ...conv, ...updates } : conv
    );
    set({ conversations: newState });
    saveConversations(newState);
  },
  addMessage: (conversationId, message) => {
    const newState = get().conversations.map((conv) =>
      conv.id === conversationId
        ? {
            ...conv,
            messages: [...conv.messages, message],
            lastMessage: message.content,
            lastUpdated: new Date(),
          }
        : conv
    );
    set({ conversations: newState });
    saveConversations(newState);
  },
  getConversationById: (id) => {
    return get().conversations.find((conv) => conv.id === id);
  },
}));

// Initialize conversations from storage
const initializeConversations = async () => {
  try {
    const stored = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    if (stored) {
      const conversations = JSON.parse(stored);
      // Convert stored date strings back to Date objects
      const processedConversations = conversations.map((conv: any) => ({
        ...conv,
        lastUpdated: new Date(conv.lastUpdated),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      useConversationStore.setState({ conversations: processedConversations });
    }
  } catch (error) {
    console.error('Failed to initialize conversations:', error);
  }
};

// Initialize when running in browser environment
if (typeof window !== 'undefined') {
  initializeConversations();
}