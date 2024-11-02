import { pino } from "pino"; // pino: function
import { createOpenAi } from "./indexer/OpenAi.js"; // createOpenAi: function
import { createAzureClients } from "./indexer/AzureClients.js"; // createAzureClients: function


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


async function getTopSearchResults(lastMessage) {

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
}

////
//////////////////////////7

async function generateNextMessage(chatId) {
    const messages = payload?.messages || []

    // todo get all messages from db 

    
    // todo get form db
    let contextMessages = []
    let message = {
        role: 'system',
        content: `  
Sie sind ein Chat-Assistent, der den Kunden Informationen über Versicherungspolicen gibt. 
Sie erhalten indizierte Versicherungsdokumente des Versicherers als „Quellen“, die mithilfe der Azure-Ai-Suche indiziert werden. 
Die Antworten sollten jedoch wahrheitsgemäß sein und mit den angegebenen Quellen übereinstimmen.
Wenn es nicht genügend Informationen gibt, um zu antworten, sagen Sie, dass Sie es nicht wissen.
Beantworten Sie die Anfrage in einer prägnanten, unterhaltsamen und freundlichen Art und Weise. 
Denken Sie daran, dass die Anfrage und die Quellen in deutscher Sprache angegeben sind. Ihre Antwort sollte also auch auf Deutsch sein.
        ` }
    contextMessages.push(message)


    let result = await openAiChatService.chat.completions.create({
        model: 'gpt-4o',
        messages: contextMessages,
        max_tokens: 200,
        //stream: true // better for realtime and long responses
    });

    message = result.choices.map(c => (c.message))
    contextMessages.push(message[0])

    message = {
        role: 'system',
        content: `Can you create a nice welcome message for the user? Start it with "Hi, I'm your AI assistant, here to help you find creative ways to minimize food waste"`
    };
    contextMessages.push(message)

    // // // // next system message.. 
    result = await openAiChatService.chat.completions.create({
        model: 'gpt-4o',
        messages: contextMessages,
        max_tokens: 200,
        //stream: true // better for realtime and long responses
    });

    message = result.choices.map(c => (c.message))
    messages.push(message[0])
    contextMessages.push(message[0])

    message = {
        role: 'user',
        content: `We have ${expireSoon[0]},  ${expireSoon[1]}, and  ${expireSoon[2]} that is expiring soon. Can you give me some deals we can make from these items to attract customers?`
    };
    messages.push(message)
    contextMessages.push(message)

    result = await openAiChatService.chat.completions.create({
        model: 'gpt-4o',
        messages: contextMessages,
        max_tokens: 200,
        //stream: true // better for realtime and long responses
    });

    console.log(result)
    return {
        messages
    }
}

