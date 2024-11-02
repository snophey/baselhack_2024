//import { BaseLogger } from 'pino'; // BaseLogger
//import { SearchIndex } from '@azure/search-documents'; // SearchIndex
import pkgs from '@azure/search-documents';
const { SearchIndex } = pkgs;

//import { encoding_for_model, TiktokenModel } from '@dqbd/tiktoken'; // TiktokenModel
import pkgt from '@dqbd/tiktoken';
const { encoding_for_model, TiktokenModel } = pkgt;

import { AzureClients } from './AzureClients.js'; // AzureClients
import { wait } from '../util/index.js';
import { DocumentProcessor } from './DocumentProcessor.js';
import { extractText, extractTextFromPdf } from './formats/index.js';
import { MODELS_SUPPORTED_BATCH_SIZE } from './ModelLimits.js';
import { Section } from './Document.js'; // Section
import { AzureOpenAI } from 'openai'; // AzureOpenAI
import pkgp from 'pino';
const { BaseLogger } = pkgp;

// IndexFileOptions
// - useVectors: optional boolean, indicating if vector representation should be used
// - throwErrors: optional boolean, indicating if errors should be thrown on failure
export class IndexFileOptions {
  constructor() {
    /** @type {boolean | undefined} */
    this.useVectors = undefined;
    
    /** @type {boolean | undefined} */
    this.throwErrors = undefined;
  }
}

// FileInfos
// - filename: string, name of the file
// - data: Buffer, file data buffer
// - type: string, file type (e.g., 'pdf', 'txt')
// - category: string, file category
export class FileInfos {
  constructor(filename, data, type, category) {
    /** @type {string} */
    this.filename = filename;
    
    /** @type {Buffer} */
    this.data = data;
    
    /** @type {string} */
    this.type = type;
    
    /** @type {string} */
    this.category = category;
  }
}

// Constant for batch size in indexing
const INDEXING_BATCH_SIZE = 1000;

// Indexer class for managing Azure search indices and file indexing
export class Indexer {

  constructor(logger, azure, openai, embeddingModelName = 'text-embedding-3-large') {
    /** @type {BaseLogger} */
    this.logger = logger;
    
    /** @type {AzureClients} */
    this.azure = azure;
    
    /** @type {AzureOpenAI} */
    this.openai = openai;
    
    /** @type {string} */
    this.embeddingModelName = embeddingModelName;
  }

  // Creates or ensures an inventory search index exists
  async createInventorySearchIndex(indexName) {
    this.logger.debug(`Ensuring search index "${indexName}" exists`);
    const searchIndexClient = this.azure.searchIndex;
    const names = [];

    const indexNames = await searchIndexClient.listIndexes();
    for await (const index of indexNames) {
      names.push(index.name);
    }

    if (names.includes(indexName)) {
      this.logger.debug(`Search index "${indexName}" already exists`);
    } else {
      const index = {
        name: indexName,
        fields: [
          { name: "id", type: "Edm.String", key: true, filterable: true, sortable: true },
          { name: "name", type: "Edm.String", searchable: true, filterable: true, sortable: true, facetable: true },
          { name: "expiresAt", type: "Edm.Int32", filterable: true, sortable: true, facetable: true }
        ]
      };
      this.logger.debug(`Creating "${indexName}" search index...`);
      await searchIndexClient.createIndex(index);
    }
  }

  // Ensures a PDF search index exists or creates it if it doesn't
  async createPdfSearchIndex(indexName) {
    this.logger.debug(`Ensuring search index "${indexName}" exists`);
    const searchIndexClient = this.azure.searchIndex;
    const names = [];

    const indexNames = await searchIndexClient.listIndexes();
    for await (const index of indexNames) {
      names.push(index.name);
    }

    if (names.includes(indexName)) {
      this.logger.debug(`Search index "${indexName}" already exists`);
    } else {
      const index = {
        name: indexName,
        fields: [
          { name: 'id', type: 'Edm.String', key: true },
          { name: 'content', type: 'Edm.String', searchable: true, analyzerName: 'de.microsoft' },
          { name: 'embedding', type: 'Collection(Edm.Single)', hidden: true, searchable: true, vectorSearchDimensions: 1536, vectorSearchProfileName: 'defaultProfile' },
          { name: 'category', type: 'Edm.String', filterable: true, facetable: true },
          { name: 'sourcepage', type: 'Edm.String', filterable: true, facetable: true },
          { name: 'sourcefile', type: 'Edm.String', filterable: true, facetable: true }
        ]
      };
      this.logger.debug(`Creating "${indexName}" search index...`);
      await searchIndexClient.createIndex(index);
    }
  }

  // Deletes a specified search index
  async deleteSearchIndex(indexName) {
    this.logger.debug(`Deleting search index "${indexName}"`);
    const searchIndexClient = this.azure.searchIndex;
    await searchIndexClient.deleteIndex(indexName);
  }

  // Indexes a file into the specified search index
  async indexFile(indexName, fileInfos, options = {}) {
    const { filename, data, type, category } = fileInfos;
    this.logger.debug(`Indexing file "${filename}" into search index "${indexName}"...`);

    try {
      const documentProcessor = new DocumentProcessor(this.logger);
      documentProcessor.registerFormatHandler('text/plain', extractText);
      documentProcessor.registerFormatHandler('text/json', extractText);
      documentProcessor.registerFormatHandler('text/markdown', extractText);
      documentProcessor.registerFormatHandler('application/pdf', extractTextFromPdf);

      const document = await documentProcessor.createDocumentFromFile(filename, data, type, category);
      const sections = document.sections;

      if (options.useVectors) {
        await this.updateEmbeddingsInBatch(sections);
      }

      const searchClient = this.azure.searchIndex.getSearchClient(indexName);
      const batchSize = INDEXING_BATCH_SIZE;
      let batch = [];

      for (let index = 0; index < sections.length; index++) {
        batch.push(sections[index]);
        if (batch.length === batchSize || index === sections.length - 1) {
          const { results } = await searchClient.uploadDocuments(batch);
          const succeeded = results.filter((r) => r.succeeded).length;
          this.logger.debug(`Indexed ${batch.length} sections, ${succeeded} succeeded`);
          batch = [];
        }
      }
    } catch (error) {
      if (options.throwErrors) {
        throw error;
      } else {
        this.logger.error(`Error indexing file "${filename}": ${error.message}`);
      }
    }
  }

  // Creates embeddings for a batch of texts
  async createEmbeddingsInBatch(texts) {
    const embeddingsClient = this.openai.embeddings;
    const result = await embeddingsClient.create({ input: texts, model: this.embeddingModelName });
    return result.data.map((d) => d.embedding);
  }

  // Updates embeddings in batch for a list of sections
  async updateEmbeddingsInBatch(sections) {
    const batchSize = MODELS_SUPPORTED_BATCH_SIZE[this.embeddingModelName];
    const batchQueue = [];
    let tokenCount = 0;

    for (const [index, section] of sections.entries()) {
      tokenCount += getTokenCount(section.content, this.embeddingModelName);
      batchQueue.push(section);

      if (tokenCount > batchSize.tokenLimit || batchQueue.length >= batchSize.maxBatchSize || index === sections.length - 1) {
        const embeddings = await this.createEmbeddingsInBatch(batchQueue.map((section) => section.content));
        for (const [index_, section] of batchQueue.entries()) section.embedding = embeddings[index_];
        this.logger.debug(`Batch Completed. Batch size ${batchQueue.length} Token count ${tokenCount}`);

        batchQueue.length = 0;
        tokenCount = 0;
      }
    }
    return sections;
  }
}

// Counts tokens for a given input and model
export function getTokenCount(input, model) {
  const encoder = encoding_for_model(model);
  const tokens = encoder.encode(input).length;
  encoder.free();
  return tokens;
}
