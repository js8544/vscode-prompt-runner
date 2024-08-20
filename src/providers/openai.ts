import { OpenAI } from 'openai';
import { Message, Provider } from '../utils/types';
import { PromptConfig } from '../utils/types';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export async function* executePromptOpenAI(provider: Provider, model: string, messages: Message[], config: PromptConfig): AsyncIterable<string> {
  const client = new OpenAI({
    apiKey: provider.api_key,
    baseURL: provider.base_url ?? undefined,
    organization: provider.organization_id ?? undefined,
    project: provider.project_id ?? undefined,
  });

  if (messages.length === 0) {
    throw new Error('No messages to send to OpenAI');
  }

  if (messages[0].role !== 'system') {
    messages = [{ role: 'system', content: 'You are a helpful assistant.' }, ...messages];
  }

  const stream = await client.chat.completions.create({
    model: model,
    messages: messages as ChatCompletionMessageParam[],
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
