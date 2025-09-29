import Constants from 'expo-constants';

export type OpenAIChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface CreateChatCompletionParams {
  messages: OpenAIChatMessage[];
  signal?: AbortSignal;
}

// Using OpenAI GPT-4 as it's widely available and reliable
export async function createChatCompletion(params: CreateChatCompletionParams): Promise<string> {
  const { messages, signal } = params;

  // Get API key from environment variables - works in both Node and Expo
  const apiKey = process.env.OPENAI_API_KEY || Constants.expoConfig?.extra?.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('Available environment variables:', Object.keys(process.env));
    console.error('Constants.expoConfig:', Constants.expoConfig?.extra);
    throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.');
  }
  
  console.log('✓ OpenAI API key found, length:', apiKey.length);

  const url = 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4', // Using GPT-4 for reliability
      messages,
      max_tokens: 2048, // Correct parameter name
      temperature: 0.7,
      stream: false,
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error');
    let errorMessage = `Request failed (${response.status})`;
    
    console.error('OpenAI API Response Status:', response.status);
    console.error('OpenAI API Response Text:', text);
    
    try {
      const errorData = JSON.parse(text);
      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      // Use the raw text if JSON parsing fails
      if (text) errorMessage = text;
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  if (!content) {
    throw new Error('No response content received from the model');
  }
  return content as string;
}

// Islamic research assistant system message inspired by usul.ai
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