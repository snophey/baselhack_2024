// Imports
import { AzureKeyCredential, SearchClient, SearchIndexClient } from '@azure/search-documents';

/**
 * AzureClients type
 * Represents the set of Azure client instances created for interacting with Azure services.
 * @typedef {ReturnType<createAzureClients>} AzureClients
 */

/**
 * Creates Azure client instances for interacting with the Azure Search service.
 * @param {string} endpoint - The Azure Search service endpoint.
 * @param {string} apiKey - The API key for accessing the Azure Search service (must be an admin key).
 * @returns {{
 *   credential: AzureKeyCredential,
 *   searchIndex: SearchIndexClient,
 *   search: <T>(index: string) => SearchClient<T>
 * }} An object containing:
 *   - `credential`: The AzureKeyCredential for authentication.
 *   - `searchIndex`: The SearchIndexClient instance for managing search indexes.
 *   - `search`: A function that returns a SearchClient for a specified index, using the provided generic type for document results.
 */
export function createAzureClients(endpoint, apiKey) {
    const credential = new AzureKeyCredential(apiKey);
    const searchIndexClient = new SearchIndexClient(endpoint, credential);

    return {
        credential,
        searchIndex: searchIndexClient,
        search: function(index) {
            return new SearchClient(endpoint, index, credential);
        }
    };
}
// Exporting AzureClients type
export const AzureClients = createAzureClients; // Exporting the function for Azure clients creation
