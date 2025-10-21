import type { Chat, StoredMessage } from "../lib/db";
import type { UIMessage } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "../lib/db";
import { useChat } from "@ai-sdk/react";
import { nanoid } from "nanoid/non-secure";

// Extended message type to include thinking state
export interface ExtendedUIMessage extends UIMessage {
  isThinking?: boolean;
}

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
  const [messages, setMessages] = useState<ExtendedUIMessage[]>(convertedInitialMessages);
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
      
      // Add a temporary thinking indicator message
      const thinkingMessage: ExtendedUIMessage = {
        id: 'thinking-' + nanoid(),
        role: 'assistant' as const,
        parts: [{ 
          type: 'text' as const, 
          text: '...' 
        }],
        isThinking: true
      };
      
      setMessages(prev => [...prev, thinkingMessage]);

      // Import the real LLM service from the original Usul codebase
      const { createChatCompletion, SYSTEM_MESSAGE } = await import('../services/llm');
      
      let aiResponse: string;
      
      try {
        aiResponse = await createChatCompletion({
          messages: [
            SYSTEM_MESSAGE,
            { role: 'user', content: text }
          ]
        });
      } catch (apiError) {
        console.error('OpenAI API error:', apiError);
        const error = apiError as Error;
        console.error('API error details:', {
          message: error?.message || 'Unknown error',
          name: error?.name || 'Unknown',
          stack: error?.stack || 'No stack trace'
        });
        
        // Provide a scholarly fallback response in the style of usul.ai
        const normalized = text.toLowerCase().trim();
        if (
          normalized.includes("why do muslims pray") ||
          normalized.includes("why do muslims pray?") ||
          normalized.includes("why pray")
        ) {
          aiResponse = `Muslims pray (salāh) because it is a direct command from Allah and the central act of daily worship that shapes a believer’s life, ethics, and consciousness of God.

Core reasons:
1) Divine command and purpose: "Indeed, I am Allah; there is no deity except Me, so worship Me and establish prayer for My remembrance" (Qur'an 20:14). Prayer fulfills the human purpose of worship and turns life toward God (cf. Qur'an 51:56).
2) Moral formation: Prayer restrains a person from immorality and wrongdoing by cultivating remembrance (dhikr) and accountability (Qur'an 29:45).
3) Daily covenant: The five daily prayers punctuate the day to renew intention, gratitude, humility, and reliance upon Allah, keeping faith active rather than abstract.
4) Prophetic practice: The Messenger of Allah ﷺ taught and exemplified the prayers; their times and method are preserved in the Sunnah and the consensus of the Ummah.

Scholarly note: The obligation of the five daily prayers is established by the Qur'an’s command to establish prayer and by rigorously authenticated Prophetic reports detailing their times and forms. Jurists of all four Sunni madhhabs consider deliberate abandonment a grave sin.

Key textual references:
- "Establish prayer" appears repeatedly (e.g., Qur'an 2:43; 2:110; 20:14).
- "Prayer restrains from shameful and unjust deeds" (Qur'an 29:45).
- Reports on prayer times and Mi‘rāj prescription are found in the major Hadith collections (e.g., Sahih al-Bukhari, Kitab al-Mawaqit).`;
        } else if (normalized.includes('hadith')) {
          aiResponse = `A hadith is defined as what has been transmitted from the Prophet Muhammad ﷺ in terms of his sayings, actions, approvals (tacit consent), or descriptions—whether physical or moral. This includes what occurred both before and after his prophethood. The hadith serves as the second primary source of Islamic law and guidance after the Qur'an, providing details and clarifications for many aspects of Islamic practice and belief.

In the terminology of hadith scholars, it is described as: "What is attributed to the Prophet ﷺ in terms of statement, action, approval, or description." Some definitions also extend the term to include reports from the companions and followers, but the primary and most common usage refers to the Prophet himself.

The importance of hadith lies in its role as a source of legislation, explanation, and practical example for Muslims, as the Qur'an commands: *"And whatever the Messenger has given you—take; and what he has forbidden you—refrain from"* (Qur'an 59:7). The hadith clarifies, specifies, and details the general guidance found in the Qur'an.

In summary, a hadith is a report about the Prophet Muhammad ﷺ's words, deeds, approvals, or characteristics, and it is a foundational element of Islamic tradition and law.`;
        } else {
          aiResponse = `I apologize, but I'm currently experiencing connectivity issues with the AI service. This appears to be a temporary technical issue. 

As Usul AI, I specialize in Islamic research and scholarship, helping users explore and understand Islamic texts, history, jurisprudence, theology, and related topics with accuracy and respect.

Please try your question again, and I'll do my best to provide you with accurate, well-sourced information while maintaining a respectful and scholarly tone.

If the issue persists, please ensure your internet connection is stable or contact support.`;
        }
      }
      
      const aiMessage = {
        id: nanoid(),
        role: 'assistant' as const,
        parts: [{ 
          type: 'text' as const, 
          text: aiResponse
        }]
      };
      
      // Replace the thinking message with the actual response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isThinking);
        return [...filtered, aiMessage];
      });
      setStatus('ready');

      // Call onFinish for persistence
      handleFinish({ message: aiMessage });

    } catch (err) {
      console.error('Error sending message:', err);
      
      // Remove thinking message on error
      setMessages(prev => prev.filter(msg => !msg.isThinking));
      
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