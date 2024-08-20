import axios from 'axios';
import logger from '../../../utils/logger';

export async function browseWithRaw(url: string): Promise<string> {
  try {
    logger.info("Fetching content from " + url);
    const response = await axios.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(`Error fetching content from ${url}: ${error.response?.status || error.message}`);
  }
}
