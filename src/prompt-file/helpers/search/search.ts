import { searchWithJina } from './jina';

export async function search(keyword: string, provider: string): Promise<string> {
  if (!provider || typeof provider !== 'string') {
    provider = 'jina';
  }

  let content: string;

  switch (provider) {
    case 'jina':
      content = await searchWithJina(keyword);
      break;
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }

  // Prepend and append content to the result
  return `Search result of ${keyword}: \n\`\`\`\n${content}\n\`\`\`\n`;
}
