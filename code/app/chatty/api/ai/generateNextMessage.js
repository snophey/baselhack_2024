import { pino } from "pino"; 
import { createOpenAi } from "./indexer/OpenAi.js";
import { createAzureClients } from "./indexer/AzureClients.js";
import { addMessage, getAllMessagesByChatId } from "../db/query/message.js";

// Clean document content
const cleanDocumentContent = (content) => { 
    // Remove reference blocks like [19][20] if there are any
    let cleanedContent = content.replace(/\[\d+\]/g, '');

    // Replace escaped newlines with a space
    cleanedContent = cleanedContent.replace(/\\n+/g, ' ');

    // Replace multiple spaces with a single space
    cleanedContent = cleanedContent.replace(/\s{2,}/g, ' ');

    // Trim any extra leading or trailing spaces
    cleanedContent = cleanedContent.trim();

    return cleanedContent; 
};

// Azure Search and OpenAI credentials
const searchEndpoint = "https://klary-dev-ai.search.windows.net"; 
const searchApiKey = process.env.SEARCH_API_KEY; 
const openaiEmbeddingsEndpoint = "https://klary-dev-openai.cognitiveservices.azure.com/openai/deployments/text-embedding-ada-002/embeddings?api-version=2023-05-15"; 
const openaiChatEndpoint = "https://klary-dev-openai.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview"; 
const openaiApiKey = process.env.OPENAI_API_KEY; 
const deployment = "klary-dev-ai"; 

const apiVersion = "2024-05-01-preview"; 

const indexName = "pax2-index"; 

const logger = pino({
    level: 'debug', // Set the log level (e.g., 'debug', 'info', 'warn', 'error')
}); 


// Now perform search using Azure Search directly
const searchClient = createAzureClients(searchEndpoint, searchApiKey).search(indexName); 

const openAiService = createOpenAi({
    deployment, 
    endpoint: openaiEmbeddingsEndpoint, 
    apiKey: openaiApiKey, 
    apiVersion 
});

const openAiChatService = createOpenAi({
    deployment, 
    endpoint: openaiChatEndpoint, 
    apiKey: openaiApiKey, 
    apiVersion 
});


async function getSummarizedTopSearchResults(lastMessage) {

    const embeddingResponse = await openAiService.embeddings.create({ 
        model: 'text-embedding-model', 
        input: lastMessage, 
    });

    const embedding = await embeddingResponse.data[0].embedding; 
    logger.info("Performing vector-based search using embeddings.");

    const vectorSearchResults = await searchClient.search(lastMessage, {
        top: 10, 
        vectorSearchOptions: {
            queries: [
                {
                    kind: 'vector', 
                    vector: embedding, 
                    kNearestNeighborsCount: 10, 
                    fields: ['embedding'] 
                },
            ],
            filterMode: 'preFilter' 
        },

        // ENABLE SEMANTIC RANKING
        // queryType: 'semantic', 
        // semanticSearchOptions: {
        //     answers: {
        //         answerType: "extractive", 
        //         count: 1, // number
        //         threshold: 0.7 
        //     },
        //     captions: {
        //         captionType: "extractive", 
        //         highlight: true, 
        //     },
        //     configurationName: 'default' 
        // }
    });

    let summarizeMessage = "Dies sind die Top-Ergebnisse der Vektorsuche. Fassen wir sie kurz und prägnant zusammen, ohne dabei Zahlen oder wichtige Fakten wie Produktnamen zu verlieren, damit wir sie bei der nächsten Suche als Systemnachricht verwenden können. Zur Info: Dies ist die Suchanfrage:" + lastMessage + "und dies sind die Suchergebnisse:"
    for await (const result of vectorSearchResults.results) {
        //logger.info(`Vector search result from document ${result.document.id}: ${result.document.content}`); // result: object

        // Log the complete document
        const documentId = result.document.id;
        const document = await searchClient.getDocument(documentId); 
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

