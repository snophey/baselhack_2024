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
const searchApiKey = ""; // string

const openaiEmbeddingsEndpoint = "https://klary-dev-openai.cognitiveservices.azure.com/openai/deployments/text-embedding-ada-002/embeddings?api-version=2023-05-15"; // string
const embeddingModelName = "text-embedding-ada-002"; // string
const openaiChatEndpoint = "https://klary-dev-openai.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview"; // string
const openaiApiKey = ""; // string
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

// Now perform search using Azure Search directly
const searchClient = createAzureClients(searchEndpoint, searchApiKey).search({ // search: function
    id: String, // string
    content: String, // string
    embedding: Array // number[]
})(indexName); // indexName: string

// Define a search query
// const query = "Wie lange ist die minimal Versicherungsdauer für die PAX-Todesfallversicherung?";
// const query = "Wie funktioniert die Sterbegeldversicherung?"
const query = "Bitte listen Sie alle Versicherungspläne auf, die PAX anbietet?"; // string

// USING SEARCH CLIENT

// Define basic search options (no embeddings here)
const searchOptions = {
    top: 3, // number
    //filter: "category eq 'text'", // string
};

logger.info("Performing text-based search.");
const searchResults = await searchClient.search(query, searchOptions); // search: function
// Log search results
for await (const result of searchResults.results) {
    console.log(result);
    logger.info(`Result from document ${result.document.id}: ${result.document.content}`); // result: object
}

// USING SEARCH CLIENT WITH EMBEDDINGS

// Embedding-based search using OpenAiService instance
logger.info("Fetching embeddings from OpenAI for the query.");

const openAiService = createOpenAi({
    deployment, // string
    endpoint: openaiEmbeddingsEndpoint, // string
    apiKey: openaiApiKey, // string
    apiVersion // string
});

const openAiChatService = createOpenAi({
    deployment, // string
    endpoint: openaiChatEndpoint, // string
    apiKey: openaiApiKey, // string
    apiVersion // string
});

const embeddingResponse = await openAiService.embeddings.create({ // embeddings: function
    model: 'text-embedding-model', // string
    input: query, // string
});

const embedding = await embeddingResponse.data[0].embedding; // Array<number>
logger.info("Performing vector-based search using embeddings.");

const vectorSearchResults = await searchClient.search(query, {
    top: 10, // number
    vectorSearchOptions: {
        queries: [
            {
                kind: 'vector', // string
                vector: embedding, // Array<number>
                kNearestNeighborsCount: 10, // number
                fields: ['embedding'] // Array<string>
            },
        ],
        filterMode: 'preFilter' // string
    },

    // ENABLE SEMANTIC RANKING
    // queryType: 'semantic', // string
    // semanticSearchOptions: {
    //     answers: {
    //         answerType: "extractive", // string
    //         count: 1, // number
    //         threshold: 0.7 // number
    //     },
    //     captions: {
    //         captionType: "extractive", // string
    //         highlight: true, // boolean
    //     },
    //     configurationName: 'default' // string
    // }
});

// Clean document content
const cleanDocumentContent = (content) => { // content: string => string
    // Remove reference blocks like [19][20] if there are any
    let cleanedContent = content.replace(/\[\d+\]/g, '');

    // Replace escaped newlines with a space
    cleanedContent = cleanedContent.replace(/\\n+/g, ' ');

    // Replace multiple spaces with a single space
    cleanedContent = cleanedContent.replace(/\s{2,}/g, ' ');

    // Trim any extra leading or trailing spaces
    cleanedContent = cleanedContent.trim();

    return cleanedContent; // returns: string
};

// Log vector search results & Format sources for the RAG prompt
const sources = []; // Array<string>
for await (const result of vectorSearchResults.results) {
    //logger.info(`Vector search result from document ${result.document.id}: ${result.document.content}`); // result: object

    // Log the complete document
    const documentId = result.document.id; // string
    const document = await searchClient.getDocument(documentId); // object
    //logger.info(`Content of document id ${documentId}: ${JSON.stringify(document.content)}`); // document: object
    const cleanedContent = cleanDocumentContent(document.content); // string
    sources.push(`${cleanedContent}`); // Array<string>
}

logger.info("Search completed.");

// RAG (Retrieval-Augmented Generation)
logger.info("RAG started.");

const GROUNDED_PROMPT_EN = `
You are a chat assistant that provides information about insurance policies to the clients. 
You are given indexed policy documents from the insurer as "Sources" which are indexed using azure ai search. 
You are also free to use the domain knowledge in this area to improve the answers. However, the answers should be truthful to align with the given sources.
If there isn't enough information to answer, say you don't know.
Answer the query in a concise, conversational and friendly manner. 
Keep in mind that the given Query and Sources are in German language. So your answer should be also in German.
Query: {query}
Sources:\n{sources}
`;

const GROUNDED_PROMPT_DE = `
Sie sind ein Chat-Assistent, der den Kunden Informationen über Versicherungspolicen gibt. 
Sie erhalten indizierte Versicherungsdokumente des Versicherers als „Quellen“, die mithilfe der Azure-Ai-Suche indiziert werden. 
Die Antworten sollten jedoch wahrheitsgemäß sein und mit den angegebenen Quellen übereinstimmen.
Wenn es nicht genügend Informationen gibt, um zu antworten, sagen Sie, dass Sie es nicht wissen.
Beantworten Sie die Anfrage in einer prägnanten, unterhaltsamen und freundlichen Art und Weise. 
Denken Sie daran, dass die Anfrage und die Quellen in deutscher Sprache angegeben sind. Ihre Antwort sollte also auch auf Deutsch sein.
Abfrage: {query}
Quellen:\n{sources}
`;

//logger.info(`my sources ${sources}`); // Array<string>
// Create the RAG prompt
const formattedPrompt = GROUNDED_PROMPT_DE.replace('{query}', query).replace('{sources}', sources.join('\n')); // string
//logger.info(`formattedPrompt ${formattedPrompt}`);

// Generate response using OpenAI
const stream = await openAiChatService.chat.completions.create({ // completions: function
    model: 'gpt-4o', // string
    messages: [{ role: 'user', content: formattedPrompt }], // Array<object>
    max_tokens: 1000, // number
    stream: true // boolean
});

logger.info("Prompt Answer:");
// handle streaming response
for await (const part of stream) {
    process.stdout.write(part.choices[0]?.delta?.content || ''); // part: object
};

logger.info("RAG completed.");
