import { createOpenAi } from "../indexer/OpenAi.js";
const openaiChatEndpoint = "https://klary-dev-openai.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-08-01-preview";
const apiVersion = "2024-05-01-preview";
const openaiApiKey = process.env.OPENAI_API_KEY;
const deployment = "klary-dev-ai";
const openAiChatService = createOpenAi({
    deployment,
    endpoint: openaiChatEndpoint,
    apiKey: openaiApiKey,
    apiVersion
});

const tools = [
    {
        type: "function",
        function: {
            name: "is_ready_to_propose_redirect",
            description: "Bestimmt, ob es ein passender Zeitpunkt ist, um einen Produkt-Redirect vorzuschlagen, basierend auf dem Nachrichtenverlauf.",
            parameters: {
                type: "object",
                properties: {
                    ready: {
                        type: "boolean",
                        description: "Gibt an, ob es ein guter Zeitpunkt ist, den Redirect vorzuschlagen.",
                    },
                },
                required: ["ready"],
                additionalProperties: false,
            },
        }
    }
];



/**
 * Propose redirect checks given a message history if it is a good time to promote and 
 * redirect to the product.
 * 
 * @param {Array<{role: "system" | "user" | "assistant", content: string}>} messages - The conversation history array
 * @return {Promise<boolean>}
 */
export async function isReadyToProposeRedirect(messages) {
    const questions = [
        {
            content: "Bestimmt, ob es ein passender Zeitpunkt ist, um einen Produkt-Redirect vorzuschlagen, basierend auf dem Nachrichtenverlauf.",
            role: 'system'
        }
    ]
        .concat(messages)

    let response = await openAiChatService.chat.completions.create({
        model: 'gpt-4o',
        messages: questions,
        max_tokens: 50,
        tools,
    });

    console.log()
    try {
        const result = JSON.parse(response.choices[0].message.tool_calls[0].function.arguments)
        return result.ready;
    } catch (error) {
        console.error("Fehler beim Parsen der Antwort:", error);
        return false;
    }

}
