import { ContentPage } from '../Document.js'; // Import ContentPage

/**
 * Extracts text content from a Buffer.
 *
 * @param {Buffer} data - The data as a Buffer.
 * @returns {Promise<ContentPage[]>} - A promise that resolves to an array of ContentPage objects.
 */
export async function extractText(data) {
  const text = data.toString('utf8'); // Convert Buffer to UTF-8 string
  return [{ content: text, offset: 0, page: 0 }]; // Return array of ContentPage
}
