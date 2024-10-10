import Anthropic from '@anthropic-ai/sdk';
import { Message, Provider } from '../utils/types';
import { PromptConfig } from '../utils/types';
import logger from '../utils/logger';
import { formatMessagesForLog } from '../utils/formatMessages';

export async function* executePromptAnthropic(provider: Provider, model: string, messages: Message[], config: PromptConfig): AsyncIterable<string> {
  const client = new Anthropic({
    apiKey: provider.api_key,
    baseURL: provider.base_url ?? undefined,
  });

  if (messages.length === 0) {
    throw new Error('No messages to send to Anthropic');
  }

  // Extract system message if present
  let systemMessage: string | undefined;
  if (messages[0].role === 'system') {
    const content = messages.shift()?.content;
    systemMessage = typeof content === 'string' ? content : undefined;
  }

  logger.info(`Compiled messages: \n${formatMessagesForLog(messages)}`);

  const stream = client.messages
    .stream({
      model: model,
      system: systemMessage,
      messages: messages.filter(msg => msg.role !== 'system').map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: typeof msg.content === 'string' ? msg.content : msg.content[0]?.text ?? ''
      })),
      max_tokens: config.max_tokens || 4000,
      temperature: config.temperature,
      top_p: config.top_p,
    });

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      if ('text' in event.delta) {
        yield event.delta.text;
      } else if ('json' in event.delta) {
        yield JSON.stringify(event.delta.json);
      }
    }
  }

  return stream;
}
