export type OpenAIChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface CreateChatCompletionParams {
  messages: OpenAIChatMessage[];
  signal?: AbortSignal;
  chatId?: string;
  bookIds?: string[];
  authorIds?: string[];
  genreIds?: string[];
  isRetry?: boolean;
  locale?: 'en' | 'ar';
}

export async function createChatCompletion(params: CreateChatCompletionParams): Promise<string> {
  const { messages, signal, chatId, bookIds, authorIds, genreIds, isRetry, locale } = params;

  // Prefer Azure backend from Swagger docs; allow override via Expo env
  const baseUrl = (process as any).env?.EXPO_PUBLIC_USUL_API || 'https://usul-api-fqhbhse7dvbydgg8.eastus-01.azurewebsites.net';
  const apiUrl = `${baseUrl}/chat/multi${(locale || 'en') ? `?locale=${encodeURIComponent(locale || 'en')}` : ''}`;
  console.log('Calling AI API at:', apiUrl);

  const usulMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream, application/json;q=0.9, */*;q=0.8',
    },
    body: JSON.stringify({ 
      messages: usulMessages,
      chatId,
      bookIds,
      authorIds,
      genreIds,
      isRetry: Boolean(isRetry),
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed (${response.status})`);
  }

  // Try to parse AI SDK data stream (SSE-like) and accumulate text deltas
  try {
    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\n\n/);
        buffer = events.pop() || '';
        for (const evt of events) {
          for (const line of evt.split(/\n/)) {
            const trimmed = line.trim();
            // Accept either SSE-style lines (data: ...) or raw frames like "8:[{...}]"
            const payload = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
            if (!payload || payload === '[DONE]') continue;
            const extracted = extractTextFromPayload(payload);
            if (extracted) fullText += extracted;
          }
        }
      }
      if (fullText.trim()) return sanitizeReadable(fullText);
    }
  } catch {}

  const text = await response.text();
  // If the entire SSE stream was buffered into text (common on RN), parse it
  if (text.includes('\ndata:') || text.startsWith('data:') || /(^|\n)[0-9]+:\s*\[\{/m.test(text)) {
    let fullText = '';
    const events = text.split(/\n\n/);
    for (const evt of events) {
      const lines = evt.split(/\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        const payload = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
        if (!payload || payload === '[DONE]') continue;
        const extracted = extractTextFromPayload(payload);
        if (extracted) fullText += extracted;
      }
    }
    const assembled = sanitizeReadable(fullText);
    if (assembled) return assembled;
  }

  const sanitized = sanitizeReadable(text);
  if (!sanitized.trim()) {
    throw new Error('No response content received from the model');
  }
  return sanitized.trim();
}

function sanitizeReadable(input: string): string {
  // Remove scripts/styles and tags, decode entities, normalize whitespace
  const withoutScripts = input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  const withLineBreaks = withoutScripts
    .replace(/<(br|BR)\s*\/?>(\s*)/g, '\n')
    .replace(/<\/(p|div|h\d|li|ul|ol|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  const decoded = decodeEntities(withLineBreaks);

  return decoded
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \f\v]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function decodeEntities(text: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&ndash;': '–',
    '&mdash;': '—',
    '&hellip;': '…',
  };
  return text.replace(/&(amp|lt|gt|quot|#39|apos|nbsp|ndash|mdash|hellip);/g, (m) => map[m] || m);
}

function extractTextFromPayload(payload: string): string {
  // Strip channel/frame prefixes like "8:" then parse JSON and extract text-only events
  const cleaned = payload.replace(/^[0-9]+:\s*/, '');
  let result = '';
  const acceptType = (t: string) => {
    const key = t.toUpperCase();
    return key === 'TEXT' || key === 'TEXT_DELTA' || key === 'DELTA' || key === 'ANSWER' || key === 'CONTENT';
  };
  const ignoreType = (t: string) => {
    const key = t.toUpperCase();
    return key === 'STATUS' || key === 'SOURCES' || key === 'CHAT_ID' || key === 'SEARCH' || key === 'QUERIES';
  };
  const addFrom = (obj: any) => {
    if (!obj) return;
    if (typeof obj === 'string') {
      result += obj;
      return;
    }
    if (typeof obj.text === 'string') result += obj.text;
    if (Array.isArray(obj.content)) {
      const tp = obj.content.find((p: any) => p?.type === 'text' && typeof p.text === 'string');
      if (tp?.text) result += tp.text;
    }
    if (typeof obj.delta === 'string') result += obj.delta;
    if (obj.type && typeof obj.value === 'string' && acceptType(obj.type)) result += obj.value;
  };
  try {
    const data = JSON.parse(cleaned);
    if (Array.isArray(data)) {
      for (const item of data) {
        if (item?.type && typeof item.type === 'string') {
          if (ignoreType(item.type)) continue;
          if (acceptType(item.type) && typeof item.value === 'string') {
            result += item.value;
            continue;
          }
        }
        addFrom(item);
      }
    } else {
      addFrom(data);
    }
  } catch {
    // If not JSON, ignore rather than polluting UI with logs
  }
  return result;
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
