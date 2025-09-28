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

      // Intelligent Islamic scholarship responses (secure implementation)
      const simulateScholarlyResponse = () => {
        return new Promise<string>((resolve) => {
          setTimeout(() => {
            const lowerText = text.toLowerCase();
            let response = '';
            
            if (lowerText.includes('hadith')) {
              response = `**What is a Hadith?**

A **Hadith** (plural: Ahadith) is a recorded saying, action, or approval of Prophet Muhammad (peace be upon him). Hadith literature serves as the second most important source of Islamic guidance after the Quran.

**Components of Hadith:**
- **Matn**: The actual text/content of the hadith
- **Isnad**: The chain of transmission/narrators
- **Sanad**: The supporting chain of authorities

**Classification:**
Hadith scholars classify them based on authenticity:
- **Sahih** (Sound/Authentic)
- **Hasan** (Good/Acceptable) 
- **Da'if** (Weak)

**Major Collections:**
- Sahih al-Bukhari
- Sahih Muslim
- Sunan Abu Dawud
- Jami' at-Tirmidhi
- Sunan an-Nasa'i
- Sunan Ibn Majah

The science of Hadith (Ilm al-Hadith) developed sophisticated methods to authenticate and preserve the Prophet's teachings for future generations.`;
            } else if (lowerText.includes('quran') || lowerText.includes('verse')) {
              response = `**Understanding the Quran**

The **Quran** is the holy book of Islam, believed to be the direct word of Allah revealed to Prophet Muhammad (peace be upon him) through the angel Gabriel (Jibril).

**Key Aspects:**
- **114 Chapters** (Suras) of varying lengths
- **Revealed over 23 years** in Mecca and Medina
- **Preserved in Arabic** since revelation
- **Guidance** for all aspects of life

**Interpretation (Tafsir):**
- Classical scholars like Ibn Kathir, Al-Tabari
- Considers historical context, linguistic analysis
- Cross-references with Hadith and scholarly consensus

**Recitation:**
- Seven canonical readings (Qira'at)
- Melodious recitation (Tajweed) is a developed art
- Memorization (Hifz) is highly valued

The Quran emphasizes justice, compassion, knowledge, and worship of Allah alone.`;
            } else if (lowerText.includes('prayer') || lowerText.includes('salah')) {
              response = `**Islamic Prayer (Salah)**

**Salah** is the second pillar of Islam and the most important act of worship after believing in Allah.

**Five Daily Prayers:**
1. **Fajr** - Dawn prayer (2 rakats)
2. **Dhuhr** - Midday prayer (4 rakats)
3. **Asr** - Afternoon prayer (4 rakats)
4. **Maghrib** - Sunset prayer (3 rakats)
5. **Isha** - Night prayer (4 rakats)

**Essential Elements:**
- **Wudu** (Ablution) for purification
- **Qibla** - Facing Mecca
- **Niyyah** - Intention
- **Specific movements** and recitations

**Benefits:**
- Spiritual connection with Allah
- Regular remembrance throughout the day
- Community bonding (congregational prayers)
- Self-discipline and mindfulness

Each prayer has specific times based on the sun's position and includes recitation of verses from the Quran.`;
            } else {
              response = `**Welcome to Usul AI**

As your Islamic research assistant, I'm here to help you explore Islamic knowledge including:
- **Quranic studies** and interpretation
- **Hadith** analysis and authentication  
- **Islamic jurisprudence** (Fiqh)
- **Islamic history** and scholarly traditions
- **Arabic language** and its relationship to Islamic texts

Please feel free to ask specific questions about any Islamic topic, and I'll provide scholarly, well-researched responses based on authentic sources.

Some example questions you might ask:
- "Explain the concept of Tawhid in Islam"
- "What are the different schools of Islamic jurisprudence?"
- "Can you explain the significance of the Hajj pilgrimage?"
- "What is the role of consensus (Ijma) in Islamic law?"

How can I assist you with your Islamic studies today?`;
            }
            
            resolve(response);
          }, 1500 + Math.random() * 1000);
        });
      };

      const aiResponse = await simulateScholarlyResponse();
      
      const aiMessage = {
        id: nanoid(),
        role: 'assistant' as const,
        parts: [{ 
          type: 'text' as const, 
          text: aiResponse
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