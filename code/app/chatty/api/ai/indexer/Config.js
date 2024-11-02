// Import Node.js built-in modules and dotenv for environment configuration
import process from 'node:process';
import path from 'node:path';
import * as dotenv from 'dotenv';

/**
 * @typedef {Object} AppConfig
 * @property {string} azureStorageAccount - Azure Storage Account name.
 * @property {string} azureStorageContainer - Azure Storage Container name.
 * @property {string} azureSearchService - Azure Search Service name.
 * @property {string} azureSearchIndex - Azure Search Index name.
 * @property {string} azureOpenAiService - Azure OpenAI Service name.
 * @property {string} azureOpenAiEmbeddingDeployment - Azure OpenAI Embedding Deployment name.
 * @property {string} azureOpenAiEmbeddingModel - Azure OpenAI Embedding Model name.
 * @property {string} kbFieldsContent - Knowledge Base fields content.
 * @property {string} kbFieldsSourcePage - Knowledge Base fields source page.
 */

/**
 * Converts camelCase to UPPER_SNAKE_CASE.
 * @param {string} string_ - The camelCase string.
 * @returns {string} The converted UPPER_SNAKE_CASE string.
 */
const camelCaseToUpperSnakeCase = (string_) => string_.replaceAll(/[A-Z]/g, (l) => `_${l}`).toUpperCase();

/**
 * Loads the application configuration from environment variables.
 * @returns {AppConfig} The application configuration.
 * @throws {Error} If any required environment variable is missing.
 */
export function loadConfig() {
    const environmentPath = path.resolve(process.cwd(), '.env');
    
    console.log(`Loading .env config from ${environmentPath}...`);
    dotenv.config({ path: environmentPath });

    /** @type {AppConfig} */
    const config = {
        azureStorageAccount: process.env.AZURE_STORAGE_ACCOUNT || '',
        azureStorageContainer: process.env.AZURE_STORAGE_CONTAINER || '',
        azureSearchService: process.env.AZURE_SEARCH_SERVICE || '',
        azureSearchIndex: process.env.AZURE_SEARCH_INDEX || '',
        azureOpenAiService: process.env.AZURE_OPENAI_SERVICE || '',
        azureOpenAiEmbeddingDeployment: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || '',
        azureOpenAiEmbeddingModel: process.env.AZURE_OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
        kbFieldsContent: process.env.KB_FIELDS_CONTENT || 'content',
        kbFieldsSourcePage: process.env.KB_FIELDS_SOURCEPAGE || 'sourcepage',
    };

    // Verify that all required config values are set
    for (const [key, value] of Object.entries(config)) {
        if (!value) {
            const variableName = camelCaseToUpperSnakeCase(key).replace('OPEN_AI', 'OPENAI');
            const message = `${variableName} environment variable must be set`;
            console.error(message);
            throw new Error(message);
        }
    }

    return config;
}
