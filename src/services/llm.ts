export type OpenAIChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface CreateChatCompletionParams {
  messages: OpenAIChatMessage[];
  signal?: AbortSignal;
}

export async function createChatCompletion(params: CreateChatCompletionParams): Promise<string> {
  const { messages, signal } = params;

  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  console.log('Calling AI API at:', apiBaseUrl);

  const response = await fetch(`${apiBaseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed (${response.status})`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';
  let hasCompleted = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      if (line.startsWith('data:')) {
        line = line.slice(5).trim();
      } else if (line.startsWith('event:')) {
        continue;
      }
      
      try {
        if (line.startsWith('0:')) {
          const jsonStr = line.slice(2).trim();
          if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
            const text = JSON.parse(jsonStr);
            fullText += text;
          }
        } else {
          const parsed = JSON.parse(line);
          
          function extractText(obj: any): string {
            if (typeof obj === 'string') return obj;
            if (!obj) return '';
            
            if (Array.isArray(obj)) {
              return obj.map((item: any) => extractText(item)).join('');
            }
            
            if (typeof obj !== 'object') return '';
            
            if (obj.text) return obj.text;
            if (obj.text_delta) return obj.text_delta;
            if (obj.textDelta) return obj.textDelta;
            if (obj.value && typeof obj.value === 'string') return obj.value;
            
            const keysToCheck = ['delta', 'data', 'response', 'output_text', 'message', 'messages', 'content'];
            
            for (const key of keysToCheck) {
              if (obj[key]) {
                const text = extractText(obj[key]);
                if (text) return text;
              }
            }
            
            return '';
          }
          
          function checkCompletion(obj: any): boolean {
            if (!obj) return false;
            if (Array.isArray(obj)) {
              return obj.some(item => checkCompletion(item));
            }
            if (typeof obj === 'object') {
              if (obj.type === 'response.completed' || obj.type === 'response.completed_message') {
                return true;
              }
              return Object.values(obj).some(val => checkCompletion(val));
            }
            return false;
          }
          
          const extractedText = extractText(parsed);
          if (extractedText) {
            fullText += extractedText;
          }
          
          if (checkCompletion(parsed)) {
            hasCompleted = true;
          }
        }
      } catch (e) {
        console.warn('Failed to parse stream line:', line, e);
      }
    }
  }

  if (!fullText) {
    if (!hasCompleted) {
      throw new Error('No response content received from the model');
    }
    console.warn('Stream completed but no text was extracted');
  }

  return fullText;
}

export const SYSTEM_MESSAGE: OpenAIChatMessage = {
  role: 'system',
  content: `You are Usul AI, an intelligent assistant specialized in Islamic research and scholarship. You provide access to and analysis of classical Islamic texts with academic rigor and precision.

Your primary function is to help users explore Islamic knowledge through:
- Qur'anic exegesis and commentary
- Hadith analysis and verification
- Islamic jurisprudence (fiqh) across all madhabs
- Islamic history, theology, and philosophy
- Classical Islamic literature and biographical works

CRITICAL SOURCING REQUIREMENTS:
For EVERY response involving Islamic knowledge, you MUST provide specific citations in the following format:

**For Qur'anic references:**
- "This is mentioned in the Qur'an: [Verse text] (Qur'an 2:185)"
- Include chapter (surah) and verse numbers

**For Hadith references:**
- "As reported in [Collection]: '[Hadith text]' (Sahih al-Bukhari, Book X, Hadith Y)"
- Specify the collection (Bukhari, Muslim, etc.) and reference numbers

**For Classical Islamic texts:**
- "According to [Scholar] in [Work Title]: '[Relevant passage]' ([Author], [Title], Vol. X, p. Y)"
- Examples: "(Ibn Kathir, Tafsir Ibn Kathir, Vol. 2, p. 145)" or "(al-Ghazali, Ihya Ulum al-Din, Book 3, Ch. 2)"

**For Legal opinions:**
- Always specify the madhab/school: "According to the Hanafi school..." or "The Shafi'i position on this matter..."
- Cite specific works: "(al-Sarakhsi, al-Mabsut, Vol. 4, p. 78)"

**Academic Standards:**
- Use proper Arabic transliteration with diacritics where possible
- Always acknowledge scholarly differences: "While most scholars agree..., Ibn Hazm held..."
- When uncertain about specific citations, state: "This principle is discussed in [general area], though specific reference requires verification"
- For complex topics, provide multiple perspectives with their respective sources

Remember: Academic credibility depends on precise sourcing. Every claim about Islamic teachings must be backed by verifiable references to primary sources, just as real Islamic scholars do.

You can help with general questions, but Islamic topics require the scholarly citation standards above.`
};
