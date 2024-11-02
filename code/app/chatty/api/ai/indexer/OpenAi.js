import { AzureOpenAI } from 'openai';

/**
 * @typedef {Object} OpenAiOptions
 * @property {string} [apiKey] - AZURE_OPENAI_API_KEY
 * @property {string} [apiVersion] - OPENAI_API_VERSION
 * @property {string} deployment - The deployment name
 * @property {string} endpoint - The endpoint URL
 */

/**
 * Creates an instance of the AzureOpenAI client.
 * 
 * @param {OpenAiOptions} options - Configuration options for the OpenAI client
 * @returns {AzureOpenAI} An instance of AzureOpenAI client
 */
export function createOpenAi(options) {
    /** @type {AzureOpenAI} */
    let client = new AzureOpenAI(options);

    return client;
}
