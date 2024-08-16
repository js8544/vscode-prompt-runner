import { OpenAI } from 'openai';
import { Provider } from '../utils/types';

// We use the OpenAI compatible api from Ollama
export async function* executePromptOllama(provider: Provider, model: string, prompt: string): AsyncIterable<string> {
  const client = new OpenAI({
    apiKey: provider.api_key,
    baseURL: provider.base_url || 'http://127.0.0.1:11434/v1',
  });

  const stream = await client.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    // Extract the content from the chunk
    const content = chunk.choices[0]?.delta?.content || '';
    yield content;
  }
}
