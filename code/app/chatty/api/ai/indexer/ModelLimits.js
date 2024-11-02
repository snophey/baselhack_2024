/**
 * @typedef {Object} ModelLimit
 * @property {number} tokenLimit - The limit for tokens
 * @property {number} maxBatchSize - The maximum batch size
 */

/*
# [Embeddings](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#embeddings)

text-embedding-3-large is the latest and most capable embedding model. Upgrading
between embeddings models is not possible. In order to move from using
text-embedding-ada-002 to text-embedding-3-large you would need to generate new
embeddings.

text-embedding-3-large text-embedding-3-small text-embedding-ada-002

In testing, OpenAI reports both the large and small third generation embeddings
models offer better average multi-language retrieval performance with the MIRACL
benchmark while still maintaining performance for English tasks with the MTEB
benchmark.

https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#embeddings

use swedencentral
*/

export const MODELS_SUPPORTED_BATCH_SIZE = /** @type {Record<string, ModelLimit>} */ ({
  'text-embedding-3-large': {
    tokenLimit: 8100,
    maxBatchSize: 16,
  },
  'text-embedding-ada-002': {
    tokenLimit: 8191,   
    maxBatchSize: 16,   
  },
  'text-embedding-3-small': {
    tokenLimit: 4096,   
    maxBatchSize: 16,    
  },
});
