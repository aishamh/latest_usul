import Constants from 'expo-constants';

export type OpenAIChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface CreateChatCompletionParams {
  messages: OpenAIChatMessage[];
  signal?: AbortSignal;
}

// Using from the blueprint: the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
export async function createChatCompletion(params: CreateChatCompletionParams): Promise<string> {
  const { messages, signal } = params;

  // Get API key from environment or constants
  const apiKey = Constants.expoConfig?.extra?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY.');
  }

  const url = 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-5', // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages,
      max_completion_tokens: 2048,
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Chat request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  if (!content) {
    throw new Error('Empty response from model');
  }
  return content as string;
}

// Islamic research assistant system message inspired by usul.ai
export const SYSTEM_MESSAGE: OpenAIChatMessage = {
  role: 'system',
  content: `You are Usul AI, an intelligent assistant specialized in Islamic research and general knowledge. You help users explore, understand, and analyze Islamic texts, history, jurisprudence, theology, and related topics with accuracy and respect.

Key capabilities:
- Answer questions about Islamic texts, history, and scholarship
- Provide explanations of Islamic concepts and terminology  
- Assist with research across various Islamic disciplines
- Offer balanced perspectives on scholarly debates
- Help users understand classical and contemporary Islamic thought

Always:
- Provide accurate, well-sourced information
- Respect diverse Islamic traditions and scholarly opinions
- Be helpful for both academic research and general inquiry
- Maintain a respectful and scholarly tone
- Acknowledge when you're uncertain about specific details

You can also help with general questions beyond Islamic topics when needed.`
}; 