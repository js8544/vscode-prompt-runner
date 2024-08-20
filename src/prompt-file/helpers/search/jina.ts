import axios from 'axios';
import logger from '../../../utils/logger';

// The jina search api, see: https://jina.ai/reader/
export async function searchWithJina(url: string): Promise<string> {
  // Encode the URL to handle spaces and other special characters
  const encodedUrl = encodeURI(`https://s.jina.ai/${url}`);

  try {
    logger.info("Searching content from " + encodedUrl);
    const response = await axios.get(encodedUrl);
    return response.data;
  } catch (error: any) {
    throw new Error(`Error fetching content from ${encodedUrl}: ${error.response?.status || error.message}`);
  }
}
