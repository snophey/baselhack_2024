import { ContentPage, ContentSection, Section } from './Document.js';
//import { BaseLogger } from 'pino';
import pkg from 'pino';
const { BaseLogger } = pkg;

// Define constants
const SENTENCE_ENDINGS = new Set(['.', '。', '．', '!', '?', '‼', '⁇', '⁈', '⁉']);
const WORD_BREAKS = new Set([',', '、', ';', ':', ' ', '(', ')', '[', ']', '{', '}', '\t', '\n']);
const MAX_SECTION_LENGTH = 1000;
const SENTENCE_SEARCH_LIMIT = 100;
const SECTION_OVERLAP = 100;

/**
 * DocumentProcessor class
 * Responsible for handling and processing documents.
 */
export class DocumentProcessor {
    /**
     * @type {Map<string, (data: Buffer) => Promise<ContentPage[]>>}
     */
    formatHandlers = new Map();

    /**
     * Constructor to initialize the DocumentProcessor.
     * @param {BaseLogger} logger - The logger instance for logging.
     */
    constructor(logger) {
        /** @type {BaseLogger} */
        this.logger = logger;
    }

    /**
     * Creates a document from a file.
     * @param {string} filename - The name of the file.
     * @param {Buffer} data - The file data.
     * @param {string} type - The file type.
     * @param {string} category - The document category.
     * @returns {Promise<{filename: string, type: string, category: string, sections: Section[]}>} - The created document.
     */
    async createDocumentFromFile(filename, data, type, category) {
        const pages = await this.extractText(data, type);
        const contentSections = this.splitPages(filename, pages);
        const sections = await this.createSections(filename, contentSections, category);
        return { filename, type, category, sections };
    }

    /**
     * Registers a handler for a specific format.
     * @param {string} type - The file type.
     * @param {(data: Buffer) => Promise<ContentPage[]>} handler - The handler function.
     */
    registerFormatHandler(type, handler) {
        this.formatHandlers.set(type, handler);
    }

    /**
     * Extracts text from file data based on file type.
     * @param {Buffer} data - The file data.
     * @param {string} type - The file type.
     * @returns {Promise<ContentPage[]>} - The extracted content pages.
     * @throws {Error} If the file type is unsupported.
     */
    async extractText(data, type) {
        const pages = [];
        const formatHandler = this.formatHandlers.get(type);
        if (!formatHandler) {
            throw new Error(`Unsupported file type: ${type}`);
        }
        const contentPages = await formatHandler(data);
        pages.push(...contentPages);
        return pages;
    }

    /**
     * Creates sections from content.
     * @param {string} filename - The file name.
     * @param {ContentSection[]} contentSections - The sections of content.
     * @param {string} category - The category of the document.
     * @returns {Promise<Section[]>} - The created sections.
     */
    async createSections(filename, contentSections, category) {
        const fileId = filenameToId(filename);
        const sections = [];
        for (const [index, { content, page }] of contentSections.entries()) {
            const section = {
                id: `${fileId}-page-${page}-section-${index}`,
                content,
                category,
                sourcepage: filename,
                sourcefile: filename,
            };
            sections.push(section);
        }
        return sections;
    }

    /**
     * Splits pages into content sections.
     * @param {string} filename - The name of the file.
     * @param {ContentPage[]} pages - The pages of the document.
     * @returns {ContentSection[]} - The content sections created.
     */
    splitPages(filename, pages) {
        this.logger.debug(`Splitting '${filename}' into sections`);
        
        const findPage = (offset) => {
            const pageCount = pages.length;
            for (let i = 0; i < pageCount - 1; i++) {
                if (offset >= pages[i].offset && offset < pages[i + 1].offset) {
                    return pages[i].page;
                }
            }
            return pages[pageCount - 1].page;
        };

        const contentSections = [];
        const allText = pages.map((page) => page.content).join('');
        const length = allText.length;
        let start = 0;
        let end = length;

        if (end <= MAX_SECTION_LENGTH) {
            return [{ content: allText, page: findPage(0) }];
        }

        while (start + SECTION_OVERLAP < length) {
            let lastWord = -1;
            end = start + MAX_SECTION_LENGTH;

            if (end > length) {
                end = length;
            } else {
                while (
                    end < length &&
                    end - start - MAX_SECTION_LENGTH < SENTENCE_SEARCH_LIMIT &&
                    !SENTENCE_ENDINGS.has(allText[end])
                ) {
                    if (WORD_BREAKS.has(allText[end])) {
                        lastWord = end;
                    }
                    end += 1;
                }
                if (end < length && !SENTENCE_ENDINGS.has(allText[end]) && lastWord > 0) {
                    end = lastWord;
                }
                if (end < length) {
                    end += 1;
                }
            }

            lastWord = -1;
            while (
                start > 0 &&
                start > end - MAX_SECTION_LENGTH - 2 * SENTENCE_SEARCH_LIMIT &&
                !SENTENCE_ENDINGS.has(allText[start])
            ) {
                if (WORD_BREAKS.has(allText[start])) {
                    lastWord = start;
                }
                start -= 1;
            }
            if (!SENTENCE_ENDINGS.has(allText[start]) && lastWord > 0) {
                start = lastWord;
            }
            if (start > 0) {
                start += 1;
            }

            const sectionText = allText.slice(start, end);
            contentSections.push({ page: findPage(start), content: sectionText });

            const lastTableStart = sectionText.lastIndexOf('<table');
            if (lastTableStart > 2 * SENTENCE_SEARCH_LIMIT && lastTableStart > sectionText.lastIndexOf('</table')) {
                const page = findPage(start);
                this.logger.debug(
                    `Section ends with unclosed table, starting next section with the table at page ${page} offset ${start} table start ${lastTableStart}`
                );
                start = Math.min(end - SECTION_OVERLAP, start + lastTableStart);
            } else {
                start = end - SECTION_OVERLAP;
            }
        }

        if (start + SECTION_OVERLAP < end) {
            contentSections.push({ content: allText.slice(start, end), page: findPage(start) });
        }

        return contentSections;
    }
}

/**
 * Converts a filename to an ID by replacing non-alphanumeric characters and hashing.
 * @param {string} filename - The filename to convert.
 * @returns {string} - The converted ID.
 */
function filenameToId(filename) {
    const filenameAscii = filename.replaceAll(/[^\w-]/g, '_');
    const filenameHash = Buffer.from(filename, 'utf8').toString('hex');
    return `file-${filenameAscii}-${filenameHash}`;
}
