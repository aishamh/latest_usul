export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'code' | 'image';
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  lastUpdated: Date;
  messages: Message[];
}