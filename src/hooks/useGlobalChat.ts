import type { Chat, StoredMessage } from "../lib/db";
import type { UIMessage } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "../lib/db";
import { useChat } from "@ai-sdk/react";
import { nanoid } from "nanoid";

type UseChatCoreProps = {
  initialChat?: Chat;
  initialId?: string;
};

export type UseGlobalChatReturn = ReturnType<typeof useGlobalChat>;

export function useGlobalChat({
  initialChat,
  initialId,
}: UseChatCoreProps) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const chatRef = useRef<Chat | null>(initialChat ?? null);

  const handleFinish = useCallback(async (options: { message: UIMessage }) => {
    if (!chatRef.current) return;
    
    try {
      const existingChat = await db.chats.get(chatRef.current.id);
      if (existingChat) {
        // Convert UIMessage to StoredMessage format for storage
        const storedMessage: StoredMessage = {
          id: options.message.id,
          role: options.message.role as 'system' | 'user' | 'assistant',
          content: options.message.parts?.map(part => part.type === 'text' ? part.text : '').join('') || '',
        };
        
        await db.chats.update(chatRef.current.id, {
          messages: [...existingChat.messages, storedMessage],
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }, []);

  const ensureChatExists = useCallback(
    async (input: string) => {
      if (chatRef.current) return chatRef.current.id;

      const newId = initialId ?? nanoid();

      const newChat: Chat = {
        id: newId,
        title: input,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      chatRef.current = newChat;
      
      try {
        await db.chats.add(newChat);
      } catch (error) {
        console.error('Error creating chat:', error);
      }

      return newId;
    },
    [initialId],
  );

  // Convert stored messages to UIMessages for the useChat hook
  const convertedInitialMessages = initialChat?.messages?.map(msg => ({
    id: msg.id,
    role: msg.role,
    parts: [{ type: 'text' as const, text: msg.content }]
  })) || [];

  // Direct OpenAI integration since API routes don't work on Expo Router web
  const [messages, setMessages] = useState(convertedInitialMessages);
  const [status, setStatus] = useState<'ready' | 'streaming'>('ready');
  const [error, setError] = useState<any>(null);

  const sendMessage = useCallback(async ({ text }: { text: string }) => {
    try {
      setStatus('streaming');
      setError(null);

      // Add user message immediately
      const userMessage = {
        id: nanoid(),
        role: 'user' as const,
        parts: [{ type: 'text' as const, text }]
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Import OpenAI client directly for immediate response
      // Note: the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const OpenAI = (await import('openai')).default;
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Only for demo - use server-side in production
      });

      const chatResponse = await client.chat.completions.create({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: `You are Usul AI, an Islamic research assistant created to help users explore and understand Islamic knowledge. Your primary expertise covers:

- Quranic studies and interpretation
- Hadith analysis and authentication
- Islamic jurisprudence (fiqh) and legal principles
- Islamic history and biographies of important figures
- Arabic language and its relationship to Islamic texts
- Comparative studies of different Islamic schools of thought
- Contemporary Islamic issues and their scholarly treatment

Guidelines for your responses:
- Provide scholarly, well-researched information
- Cite relevant Quranic verses and authentic hadith when applicable
- Acknowledge when topics have differences of scholarly opinion
- Be respectful of different schools of thought within Islam
- Clarify when discussing matters of scholarly debate
- Encourage further study and learning

You can also help with general topics, but your specialty is Islamic scholarship and research.`
          },
          { role: 'user', content: text }
        ],
        max_completion_tokens: 1000
      });

      const aiResponse = chatResponse.choices?.[0]?.message?.content || 'Sorry, I encountered an error processing your request. Please try again.';
      
      const aiMessage = {
        id: nanoid(),
        role: 'assistant' as const,
        parts: [{ 
          type: 'text' as const, 
          text: response
        }]
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setStatus('ready');

      // Call onFinish for persistence
      handleFinish({ message: aiMessage });

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err);
      setStatus('ready');
    }
  }, [handleFinish]);

  const stop = useCallback(() => {
    setStatus('ready');
  }, []);

  const regenerate = useCallback(() => {
    // Implement regeneration logic
    if (messages.length > 0) {
      const lastUserMessage = messages[messages.length - 2];
      if (lastUserMessage?.role === 'user') {
        // Remove last assistant message and regenerate
        setMessages(prev => prev.slice(0, -1));
        const text = lastUserMessage.parts?.[0]?.type === 'text' ? lastUserMessage.parts[0].text : '';
        if (text) {
          sendMessage({ text });
        }
      }
    }
  }, [messages, sendMessage]);

  const submit = useCallback(async () => {
    if (!input.trim() || isSubmitting || status !== 'ready') return;
    
    setIsSubmitting(true);

    try {
      // Ensure chat exists before sending
      const currentChatId = await ensureChatExists(input);
      
      // Create and save user message
      const userMessage: StoredMessage = {
        id: nanoid(),
        role: 'user',
        content: input,
      };

      // Add user message to chat
      if (chatRef.current) {
        const existingChat = await db.chats.get(chatRef.current.id);
        if (existingChat) {
          await db.chats.update(chatRef.current.id, {
            messages: [...existingChat.messages, userMessage],
            updatedAt: new Date(),
          });
        }
      }

      // Send message via AI SDK
      await sendMessage({
        text: input,
      });

      setInput("");
    } catch (error) {
      console.error('Error submitting message:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    input,
    isSubmitting,
    status,
    ensureChatExists,
    sendMessage,
  ]);

  const append = useCallback(
    (text: string) => {
      setInput(text);
      // Auto-submit when appending
      setTimeout(() => {
        if (status === 'ready') {
          submit();
        }
      }, 100);
    },
    [status, submit],
  );

  return {
    messages,
    setMessages,
    input,
    setInput,
    submit,
    append,
    status,
    stop,
    reload: regenerate,
    isSubmitting,
    error,
  };
}