import { pino } from "pino"; // pino: function
import { createOpenAi } from "./indexer/OpenAi.js"; // createOpenAi: function
import { createAzureClients } from "./indexer/AzureClients.js"; // createAzureClients: function
import { addMessage, getAllMessagesByChatId } from "../db/query/message.js";
import OpenAI from "openai";


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



////////////////////////
///

// Azure Search and OpenAI credentials
const searchEndpoint = "https://klary-dev-ai.search.windows.net"; // string
const searchApiKey = process.env.SEARCH_API_KEY; // string

const openaiEmbeddingsEndpoint = "https://klary-dev-openai.cognitiveservices.azure.com/openai/deployments/text-embedding-ada-002/embeddings?api-version=2023-05-15"; // string
const embeddingModelName = "text-embedding-ada-002"; // string
const openaiChatEndpoint = "https://klary-dev-openai.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview"; // string
const openaiApiKey = process.env.OPENAI_API_KEY; // string
const deployment = "klary-dev-ai"; // string

const apiVersion = "2024-05-01-preview"; // string

const indexName = "pax2-index"; // string

const logger = pino({
    level: 'debug', // Set the log level (e.g., 'debug', 'info', 'warn', 'error')
}); // logger: object



// Now perform search using Azure Search directly
const searchClient = createAzureClients(searchEndpoint, searchApiKey).search(indexName); // indexName: string


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


async function getSummarizedTopSearchResults(lastMessage) {

    const embeddingResponse = await openAiService.embeddings.create({ // embeddings: function
        model: 'text-embedding-model', // string
        input: lastMessage, // string
    });

    const embedding = await embeddingResponse.data[0].embedding; // Array<number>
    logger.info("Performing vector-based search using embeddings.");

    const vectorSearchResults = await searchClient.search(lastMessage, {
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

    let summarizeMessage = "Das sind die top Resultate aus der Vektorsuche. Fasse es kurz und prägnant zusammen, damit wir es in der nächsten suche als System-Nachricht verwenden können. FYI: this was the last user message" 
    + lastMessage 
    for await (const result of vectorSearchResults.results) {
        //logger.info(`Vector search result from document ${result.document.id}: ${result.document.content}`); // result: object

        // Log the complete document
        const documentId = result.document.id; // string
        const document = await searchClient.getDocument(documentId); // object
        //logger.info(`Content of document id ${documentId}: ${JSON.stringify(document.content)}`); // document: object
        summarizeMessage += cleanDocumentContent(document.content); 
    }


    let result = await openAiChatService.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
            role: 'system',
            content: summarizeMessage 
        }],
        max_tokens: 200,
        //stream: true // better for realtime and long responses
    });
    
    return {
        role: 'system',
        content: result.choices.map(c => (c.message))[0].content
    }
}

////
//////////////////////////7

/**
 * 
 * @param {{message: string, is_ai_message: 0|1 }[]} messages
 * @return  
 */
function mapMessageToOpenAiMessage(messages) {
    return messages.map(m => ({ content: m.message, role: m.is_ai_message ? 'assistant' : 'user' }))
}

export async function generateNextMessage(chatId) {


    const messages = mapMessageToOpenAiMessage(await getAllMessagesByChatId(chatId))

    let contextMessages = [
        {
            role: 'system',
            content: `  
Sie sind ein Chat-Assistent, der den Kunden Informationen über Versicherungspolicen gibt. 
Sie erhalten indizierte Versicherungsdokumente des Versicherers als „Quellen“, die mithilfe der Azure-Ai-Suche indiziert werden. 
Die Antworten sollten jedoch wahrheitsgemäß sein und mit den angegebenen Quellen übereinstimmen.
Wenn es nicht genügend Informationen gibt, um zu antworten, sagen Sie, dass Sie es nicht wissen.
Beantworten Sie die Anfrage in einer prägnanten, unterhaltsamen und freundlichen Art und Weise. 
Denken Sie daran, dass die Anfrage und die Quellen in deutscher Sprache angegeben sind. Ihre Antwort sollte also auch auf Deutsch sein.
        ` }
    ]
        .concat(messages)
        

    const topResultSum = await getSummarizedTopSearchResults(contextMessages[contextMessages.length -1].content)
    contextMessages.push(topResultSum)
    
    
    let result = await openAiChatService.chat.completions.create({
        model: 'gpt-4o',
        messages: contextMessages,
        max_tokens: 200,
        //stream: true // better for realtime and long responses
    });

    let message = result.choices.map(c => (c.message))
    contextMessages.push(message[0])
    console.log(message) 

    await addMessage(chatId, contextMessages.at(-1), true)
}

