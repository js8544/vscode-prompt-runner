import { OpenAI } from 'openai';
import { Provider } from '../utils/types';

export async function executePromptOpenAI(provider: Provider, model: string, prompt: string) {
  const client = new OpenAI({
    apiKey: provider.api_key,
    baseURL: provider.base_url || 'https://api.openai.com/v1',
  });

  const stream = await client.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt },
    ],
    stream: true,
  });

  return stream;
}
