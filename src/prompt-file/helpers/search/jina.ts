import axios from 'axios';

// The jina search api, see: https://jina.ai/reader/
export async function searchWithJina(url: string): Promise<string> {
  const fullUrl = `https://s.jina.ai/${url}`;

  try {
    const response = await axios.get(fullUrl);
    return response.data;
  } catch (error: any) {
    throw new Error(`Error fetching content from ${fullUrl}: ${error.response?.status || error.message}`);
  }
}
