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

    let summarizeMessage = "Dies sind die Top-Ergebnisse der Vektorsuche. Fassen Sie sie kurz und prägnant zusammen, ohne Zahlen oder Fakten zu verlieren, damit wir sie bei der nächsten Suche als Systemnachricht verwenden können. Zur Info: Dies ist die Suchanfrage:" +  lastMessage  +  "und dies sind die Suchergebnisse:"
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
Sie sind Chat-Assistent für Pax Insurance und versorgen Kunden mit Informationen zu Pax-Versicherungspolicen. Als „Quellen“ erhalten Sie vom Versicherer indexierte Pax-Versicherungsdokumente, die mit Azure AI Search indexiert werden.
Beachten Sie beim Beantworten einer Frage die folgenden Einschränkungen:
1. Die Antworten sollten wahrheitsgetreu und im Einklang mit den angegebenen Quellen sein.
2. Beantworten Sie nur Fragen aus dem Versicherungsbereich. Geben Sie bei anderen Fragen an, dass Sie die Antwort nicht kennen.
3. Wenn Sie nicht genügend Informationen zum Beantworten haben, geben Sie an, dass Sie es nicht wissen.
4. Ihre Antwort könnte Werbung für Produkte der Pax-Versicherungsgesellschaft sein, wenn dies angebracht ist.
5. Von Ihnen wird erwartet, dass Sie nur Informationen zu Pax-Versicherungsprodukten bereitstellen, nicht zu deren Wettbewerbern.
Beantworten Sie die Anfrage kurz, unterhaltsam und freundlich.
Denken Sie daran, dass die Anfrage und die Quellen auf Deutsch sind, Ihre Antwort sollte also auch auf Deutsch sein.
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

    await addMessage(chatId, contextMessages.at(-1).content, true)
}

