import axios from 'axios';

export async function browseWithJina(url: string): Promise<string> {
  const fullUrl = `https://r.jina.ai/${url}`;

  try {
    const response = await axios.get(fullUrl);
    return response.data;
  } catch (error: any) {
    throw new Error(`Error fetching content from ${fullUrl}: ${error.response?.status || error.message}`);
  }
}
