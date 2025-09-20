export type OpenAIChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface CreateChatCompletionParams {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: OpenAIChatMessage[];
  temperature?: number;
  signal?: AbortSignal;
}

export async function createChatCompletion(params: CreateChatCompletionParams): Promise<string> {
  const { baseUrl, apiKey, model, messages, temperature = 0.7, signal } = params;

  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stream: false,
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