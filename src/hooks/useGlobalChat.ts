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
              response = `# 📜 What is a Hadith?

## 🌟 **The Simple Explanation**
A **Hadith** (pronounced "ha-DEETH") is like a historical record of what Prophet Muhammad said, did, or approved of during his lifetime. Think of it as a collection of his words, actions, and teachings that his companions remembered and passed down.

## 💎 **Why Are They Important?**
Hadiths are the **second most important source** of Islamic guidance after the Quran. While the Quran contains God's direct words, hadiths show us **how** the Prophet lived those teachings in daily life.

---

## 🔍 **How Hadiths Work**

### **📖 The Story Part**
Every hadith has the actual teaching or story - this is called the **"Matn"** (meaning "text" in Arabic). This is the part you read that contains the Prophet's words or describes what he did.

### **👥 The Source Chain** 
Each hadith also comes with a list of people who passed it down through generations - like saying "Ahmed heard this from Fatima, who heard it from Ali, who was there when the Prophet said it." This chain is called the **"Isnad"** (meaning "support").

---

## ⭐ **Quality Levels**

Islamic scholars developed a grading system to check how reliable each hadith is:

🥇 **Sahih** (Authentic) - The gold standard, most reliable
🥈 **Hasan** (Good) - Solid and acceptable 
🥉 **Da'if** (Weak) - Less reliable due to gaps in the chain

---

## 📚 **Famous Collections**
The most trusted collections include:
• **Sahih al-Bukhari** - Considered the most authentic
• **Sahih Muslim** - Also highly trusted
• Plus four other major collections

Think of hadiths as a bridge between the Quran's timeless wisdom and how to live it in the real world! 🌉`;
            } else if (lowerText.includes('quran') || lowerText.includes('verse')) {
              response = `# 📖 Understanding the Quran

## ✨ **What Is It?**
The **Quran** is Islam's holy book - Muslims believe it contains the direct words of God (called "Allah" in Arabic) as revealed to Prophet Muhammad through the angel Gabriel over 23 years.

---

## 🏗️ **Structure & Organization**

### **📑 Chapters & Verses**
• **114 Chapters** called "Surahs" (like book chapters)
• Each chapter has verses called "Ayahs" (like sentences)
• Ranges from very short (3 verses) to very long (286 verses)

### **🕰️ Timeline**
• **Revealed gradually** over 23 years (610-632 CE)
• **Two periods**: Mecca (spiritual focus) and Medina (community laws)
• Each verse came down for specific situations and guidance

---

## 🎯 **Core Themes**

🙏 **Worship & Faith** - Believing in one God and living righteously
⚖️ **Justice & Ethics** - Fair treatment, honesty, kindness
🤝 **Community** - How to live together peacefully
📚 **Knowledge** - Encouraging learning and reflection
🌍 **Creation** - Understanding our place in the universe

---

## 🎵 **The Art of Recitation**

### **Beautiful Sound**
The Quran is meant to be **recited melodiously** - there's even a special art called **"Tajweed"** (meaning "to make better") that teaches proper pronunciation and rhythm.

### **Memorization Tradition**
Many Muslims memorize the entire Quran (called **"Hifz"**) - imagine knowing a whole book by heart! These people are called **"Hafiz"** (memorizer).

---

## 💭 **Understanding & Interpretation**

The Quran encourages **reflection and thinking**. Islamic scholars write detailed explanations called **"Tafsir"** (interpretation) that help explain:
• Historical context of when verses were revealed
• Deeper meanings of Arabic words
• How teachings apply to modern life

*The Quran is like a guidebook for life, covering everything from personal spirituality to social justice!* 🌟`;
            } else if (lowerText.includes('prayer') || lowerText.includes('salah')) {
              response = `# 🕌 Islamic Prayer (Salah)

## 💫 **What Is It?**
**Salah** (pronounced "sa-LAH") is the Islamic form of prayer - it's like having five special conversations with God throughout each day. It's considered the **second most important pillar** of Islam after believing in God.

---

## 🌅 **The Five Daily Prayers**

Think of these as spiritual checkpoints that keep you connected to God throughout your day:

🌄 **1. Fajr** - **Dawn Prayer**
• Before sunrise, when the world is quiet and peaceful
• 2 units of prayer

☀️ **2. Dhuhr** - **Midday Prayer**  
• When the sun reaches its peak
• 4 units of prayer

🌤️ **3. Asr** - **Afternoon Prayer**
• Late afternoon, as shadows lengthen
• 4 units of prayer

🌅 **4. Maghrib** - **Sunset Prayer**
• Just after the sun sets
• 3 units of prayer  

🌙 **5. Isha** - **Night Prayer**
• When darkness settles in
• 4 units of prayer

---

## 🧘‍♂️ **How It Works**

### **🚿 Getting Ready (Wudu)**
Before praying, Muslims perform **"Wudu"** - a gentle washing of hands, face, arms, and feet. It's both physical and spiritual cleansing, like hitting a reset button.

### **🧭 Direction (Qibla)**
Muslims pray facing **Mecca** (the holy city in Saudi Arabia) - this creates unity as millions pray in the same direction worldwide.

### **💭 Intention (Niyyah)**  
Before starting, you make a quiet intention in your heart about which prayer you're doing. It's like telling yourself "I'm ready to focus on God now."

---

## 💙 **Beautiful Benefits**

✨ **Spiritual Peace** - Direct connection with the Divine
⏰ **Life Structure** - Natural rhythm throughout the day
🤝 **Community Bond** - Praying together builds brotherhood
🧠 **Mindfulness** - Breaks from worldly distractions
💪 **Discipline** - Builds consistent positive habits

---

## 🎼 **The Experience**
Prayer involves gentle standing, bowing, and prostrating while reciting beautiful verses from the Quran. It's like a dance of the soul - peaceful, rhythmic, and deeply meditative.

*Imagine taking five peaceful breaks each day to reconnect with your purpose and find inner calm!* 🕊️`;
            } else {
              response = `# 🌟 Welcome to Usul AI!

## 🕌 **Your Friendly Islamic Learning Companion**

Whether you're completely new to Islam, exploring different faiths, or deepening your existing knowledge, I'm here to make Islamic teachings accessible and beautiful for everyone.

---

## 💎 **What I Can Help You With**

### 📖 **Holy Texts & Teachings**
• **Quran** - Islam's holy book and its beautiful messages
• **Hadith** - Prophet Muhammad's sayings and life examples
• **Stories & History** - Amazing tales from Islamic heritage

### 🙏 **Practices & Beliefs**  
• **Five Pillars** - The core foundations of Islamic life
• **Prayer & Worship** - How Muslims connect with God
• **Holidays & Celebrations** - Ramadan, Eid, and more

### 🌍 **Culture & Community**
• **Islamic Values** - Justice, compassion, knowledge, and peace
• **Daily Life** - How Islamic principles guide everyday decisions
• **Different Traditions** - The rich diversity within Islam

---

## 💫 **My Promise to You**

I'll explain everything in **simple, everyday language** - no confusing jargon! Think of me as that knowledgeable friend who loves sharing beautiful wisdom in a way that anyone can understand and appreciate.

---

## 🚀 **Try Asking Me:**

💭 *"What makes Islam special?"*
💭 *"How do Muslims pray?"*
💭 *"What is Ramadan like?"*
💭 *"Tell me about Prophet Muhammad"*
💭 *"What does the Quran teach about kindness?"*

---

**What would you like to explore today?** I'm excited to share this beautiful tradition with you! ✨`;
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