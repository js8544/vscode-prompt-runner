import axios from 'axios';

export async function browseWithRaw(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(`Error fetching content from ${url}: ${error.response?.status || error.message}`);
  }
}
