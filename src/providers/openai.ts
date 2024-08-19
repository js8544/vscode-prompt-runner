import { OpenAI } from 'openai';
import { Provider } from '../utils/types';
import { PromptConfig } from '../utils/types';

export async function* executePromptOpenAI(provider: Provider, model: string, prompt: string, config: PromptConfig): AsyncIterable<string> {
  const client = new OpenAI({
    apiKey: provider.api_key,
    baseURL: provider.base_url ?? undefined,
    organization: provider.organization_id ?? undefined,
    project: provider.project_id ?? undefined,
  });

  const stream = await client.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: config.max_tokens,
    temperature: config.temperature,
    top_p: config.top_p,
    stream: true,
  });

  for await (const chunk of stream) {
    // Extract the content from the chunk
    const content = chunk.choices[0]?.delta?.content || '';
    yield content;
  }

  return stream;
}
