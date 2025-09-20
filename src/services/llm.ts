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

  // Get API key from environment variables only
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.');
  }

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