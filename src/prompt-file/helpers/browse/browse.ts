import { browseWithJina } from './jina';
import { browseWithRaw } from './raw';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export async function browse(url: string, provider: string): Promise<string> {
  if (!provider || typeof provider !== 'string') {
    provider = 'jina';
  }

  let content: string;

  switch (provider) {
    case 'jina':
      content = await browseWithJina(url);
      break;
    case 'raw':
      content = await browseWithRaw(url);
      break;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }

  // Prepend and append content to the result
  return `Content of ${url}: \n\`\`\`\n${content}\n\`\`\`\n`;
}
