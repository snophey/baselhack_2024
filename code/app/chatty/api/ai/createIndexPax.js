import { FileInfos, Indexer } from "./indexer/Indexer.js";
import { pino } from "pino"; 
import { createOpenAi } from "./indexer/OpenAi.js"; 
import { createAzureClients } from "./indexer/AzureClients.js"; 

import * as fs from 'fs'; 
import * as path from 'path'; 

// Export things here that you want to use in the other libs
export { createAzureClients }; // createAzureClients: function

// Azure Search and OpenAI credentials
const searchEndpoint = "https://klary-dev-ai.search.windows.net"; 
const searchApiKey = process.env.SEARCH_API_KEY ; 

const openaiEmbeddingsEndpoint = "https://klary-dev-openai.cognitiveservices.azure.com/openai/deployments/text-embedding-ada-002/embeddings?api-version=2023-05-15"; 
const embeddingModelName = "text-embedding-ada-002"; 
const openaiApiKey = process.env.OPENAI_API_KEY; 
const deployment = "klary-dev-ai"; 

const apiVersion = "2024-05-01-preview"; 

const indexName = "pax2-index"; 

const logger = pino({
    level: 'debug', // Set the log level (e.g., 'debug', 'info', 'warn', 'error')
}); 

const indexer = new Indexer(logger, createAzureClients(searchEndpoint, searchApiKey), createOpenAi({
    deployment, 
    endpoint: openaiEmbeddingsEndpoint, 
    apiKey: openaiApiKey, 
    apiVersion 
}), embeddingModelName); 

logger.info("Initialized Indexer.");

// Indexing process
await indexer.createPdfSearchIndex(indexName); 

const indexFileOptions = {
    useVectors: true, 
    throwErrors: true, 
};

logger.info("Indexing pdf files started");

// Path containing the .pdf files
const pdfDirectoryPath = './chatty/api/ai/data/pax/pdf'; 
const pdfFiles = fs.readdirSync(pdfDirectoryPath).filter(file => path.extname(file).toLowerCase() === '.pdf'); 
logger.info(`found ${pdfFiles.length} PDF files to index.`);

for (const file of pdfFiles) {
    try {
        const filePath = path.join(pdfDirectoryPath, file); 
        const fileBuffer = fs.readFileSync(filePath); 

        // Set up file information for indexing
        const fileInfos = { 
            filename: file, 
            data: fileBuffer, 
            type: "application/pdf",
            category: "pdf", 
        };

        // Index the file
        logger.info(`Indexing file: ${file}`);
        await indexer.indexFile(indexName, fileInfos, indexFileOptions); 
        logger.info(`Indexing of file ${file} completed.`);

    } catch (error) {
        logger.error(`Error indexing file ${file}: ${error.message}`); 
        if (indexFileOptions.throwErrors) {
            throw error; 
        }
    }
}

logger.info("Indexing of all PDF files completed.");

logger.info("Indexing text files started");

// Path containing the .txt files
const txtDirectoryPath = './chatty/api/ai/data/pax/text'; 
const txtFiles = fs.readdirSync(txtDirectoryPath).filter(file => path.extname(file).toLowerCase() === '.txt'); 
logger.info(`found ${txtFiles.length} txt files to index.`);

for (const file of txtFiles) {
    try {
        const filePath = path.join(txtDirectoryPath, file); 
        const fileBuffer = fs.readFileSync(filePath); 

        // Set up file information for indexing
        const fileInfos = { 
            filename: file, 
            data: fileBuffer, 
            type: "text/plain", 
            category: "text", 
        };

        // Index the file
        logger.info(`Indexing file: ${file}`);
        await indexer.indexFile(indexName, fileInfos, indexFileOptions); 
        logger.info(`Indexing of file ${file} completed.`);

    } catch (error) {
        logger.error(`Error indexing file ${file}: ${error.message}`); 
        if (indexFileOptions.throwErrors) {
            throw error; 
        }
    }
}

logger.info("Indexing of all text files completed.");