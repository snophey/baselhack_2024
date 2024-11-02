import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
// Importing necessary types from the PDF.js library
// TextItem - represents an item of text in a PDF page
// ContentPage - represents the structure of a page's content

/**
 * Extracts text content from a PDF file represented as a Buffer.
 *
 * @param {Buffer} data - The PDF data as a Buffer.
 * @returns {Promise<Array<{ content: string, offset: number, page: number }>>} 
 * A promise that resolves to an array of ContentPage objects.
 */
export async function extractTextFromPdf(data) {
  const pages = []; // Array to hold the content pages
  const pdf = await pdfjs.getDocument(new Uint8Array(data)).promise; // Load the PDF document
  let offset = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i); // Get each page
    const textContent = await page.getTextContent(); // Extract text content from the page
    let previousY = 0;
    
    const text = textContent.items
      .filter((item) => 'str' in item) // Filter out items without text
      .map((item) => {
        const textItem = item; // Each item is a TextItem
        const y = textItem.transform[5]; // Y coordinate for line determination
        let textContent = textItem.str; // Get the text string

        if (y !== previousY && previousY !== 0) {
          // If the Y coordinate changes, we're on a new line
          textContent = '\n' + textContent; // Add a newline if the Y coordinate changes
        }
        previousY = y; // Update previousY for the next iteration
        return textContent; // Return the text content
      })
      .join(''); // Join the text items into a single string

    pages.push({ content: text + '\n', offset, page: i }); // Add the page's content to the pages array
    offset += text.length; // Update the offset
  }
  return pages; // Return the array of pages
}
