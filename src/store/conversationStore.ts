import { create } from 'zustand';
import { Conversation, Message } from '../types/conversation';

export interface ConversationState {
  conversations: Conversation[];
  currentConversationId: string | null;
  setCurrentConversationId: (id: string) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  addMessage: (conversationId: string, message: Message) => void;
  getConversationById: (id: string) => Conversation | undefined;
}

export const useConversationStore = create<ConversationState>()((set, get) => ({
  conversations: [],
  currentConversationId: null,
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),
  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv
      ),
    })),
  addMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: [...conv.messages, message],
              lastMessage: message.content,
              lastUpdated: new Date(),
            }
          : conv
      ),
    })),
  getConversationById: (id) => {
    return get().conversations.find((conv) => conv.id === id);
  },
}));