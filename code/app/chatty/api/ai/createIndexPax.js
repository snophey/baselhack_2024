import { FileInfos, Indexer } from "./indexer/Indexer.js"; // FileInfos: { filename: string, data: Buffer, type: string, category: string }
import { pino } from "pino"; // pino: function
import { createOpenAi } from "./indexer/OpenAi.js"; // createOpenAi: function
import { createAzureClients } from "./indexer/AzureClients.js"; // createAzureClients: function

import * as fs from 'fs'; // fs: object
import * as path from 'path'; // path: object

// Export things here that you want to use in the other libs
export { createAzureClients }; // createAzureClients: function

// Azure Search and OpenAI credentials
const searchEndpoint = "https://klary-dev-ai.search.windows.net"; // string
const searchApiKey = process.env.SEARCH_API_KEY ; // string

const openaiEmbeddingsEndpoint = "https://klary-dev-openai.cognitiveservices.azure.com/openai/deployments/text-embedding-ada-002/embeddings?api-version=2023-05-15"; // string
const embeddingModelName = "text-embedding-ada-002"; // string
const openaiApiKey = process.env.OPENAI_API_KEY; // string
const deployment = "klary-dev-ai"; // string

const apiVersion = "2024-05-01-preview"; // string

const indexName = "pax2-index"; // string

const logger = pino({
    level: 'debug', // Set the log level (e.g., 'debug', 'info', 'warn', 'error')
}); // logger: object

const indexer = new Indexer(logger, createAzureClients(searchEndpoint, searchApiKey), createOpenAi({
    deployment, // string
    endpoint: openaiEmbeddingsEndpoint, // string
    apiKey: openaiApiKey, // string
    apiVersion // string
}), embeddingModelName); // embeddingModelName: string

logger.info("Initialized Indexer.");

// Indexing process
await indexer.createPdfSearchIndex(indexName); // indexName: string

const indexFileOptions = {
    useVectors: true, // boolean
    throwErrors: true, // boolean
};

logger.info("Indexing pdf files started");

// Path containing the .pdf files
const pdfDirectoryPath = './chatty/api/ai/data/pax/pdf'; // string
const pdfFiles = fs.readdirSync(pdfDirectoryPath).filter(file => path.extname(file).toLowerCase() === '.pdf'); // Array<string>
logger.info(`found ${pdfFiles.length} PDF files to index.`);

for (const file of pdfFiles) {
    try {
        const filePath = path.join(pdfDirectoryPath, file); // string
        const fileBuffer = fs.readFileSync(filePath); // Buffer

        // Set up file information for indexing
        const fileInfos = { // FileInfos
            filename: file, // string
            data: fileBuffer, // Buffer
            type: "application/pdf", // string
            category: "pdf", // string
        };

        // Index the file
        logger.info(`Indexing file: ${file}`);
        await indexer.indexFile(indexName, fileInfos, indexFileOptions); // indexName: string, fileInfos: FileInfos, indexFileOptions: object
        logger.info(`Indexing of file ${file} completed.`);

    } catch (error) {
        logger.error(`Error indexing file ${file}: ${error.message}`); // error: object
        if (indexFileOptions.throwErrors) {
            throw error; // throw: Error
        }
    }
}

logger.info("Indexing of all PDF files completed.");

logger.info("Indexing text files started");

// Path containing the .txt files
const txtDirectoryPath = './chatty/api/ai/data/pax/text'; // string
const txtFiles = fs.readdirSync(txtDirectoryPath).filter(file => path.extname(file).toLowerCase() === '.txt'); // Array<string>
logger.info(`found ${txtFiles.length} txt files to index.`);

for (const file of txtFiles) {
    try {
        const filePath = path.join(txtDirectoryPath, file); // string
        const fileBuffer = fs.readFileSync(filePath); // Buffer

        // Set up file information for indexing
        const fileInfos = { // FileInfos
            filename: file, // string
            data: fileBuffer, // Buffer
            type: "text/plain", // string
            category: "text", // string
        };

        // Index the file
        logger.info(`Indexing file: ${file}`);
        await indexer.indexFile(indexName, fileInfos, indexFileOptions); // indexName: string, fileInfos: FileInfos, indexFileOptions: object
        logger.info(`Indexing of file ${file} completed.`);

    } catch (error) {
        logger.error(`Error indexing file ${file}: ${error.message}`); // error: object
        if (indexFileOptions.throwErrors) {
            throw error; // throw: Error
        }
    }
}

logger.info("Indexing of all text files completed.");