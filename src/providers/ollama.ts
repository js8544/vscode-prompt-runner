import { OpenAI } from 'openai';
import { Message, Provider } from '../utils/types';
import { PromptConfig } from '../utils/types';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { formatMessagesForLog } from '../utils/formatMessages';
import logger from '../utils/logger';

// We use the OpenAI compatible api from Ollama
export async function* executePromptOllama(provider: Provider, model: string, messages: Message[], config: PromptConfig): AsyncIterable<string> {
  const client = new OpenAI({
    apiKey: provider.api_key,
    baseURL: provider.base_url || 'http://127.0.0.1:11434/v1',
  });

  if (messages.length === 0) {
    throw new Error('No messages to send to OpenAI');
  }

  if (messages[0].role !== 'system') {
    messages = [{ role: 'system', content: 'You are a helpful assistant.' }, ...messages];
  }

  logger.info(`Compiled messages: \n${formatMessagesForLog(messages)}`);


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
}
