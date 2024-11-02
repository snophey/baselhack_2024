// This module defines various interfaces related to document structures.

/**
 * Represents a Document.
 * @typedef {Object} Document
 * @property {string} filename - The name of the document file.
 * @property {string} type - The type of the document.
 * @property {string} category - The category of the document.
 * @property {Array<Section>} sections - The sections contained in the document.
 */
export class Document {
    constructor(filename, type, category, sections) {
      this.filename = filename; // The name of the document file
      this.type = type; // The type of the document
      this.category = category; // The category of the document
      this.sections = sections; // The sections contained in the document
    }
  }
  
  /**
   * Represents a Section of a Document.
   * @typedef {Object} Section
   * @property {string} id - The unique identifier for the section.
   * @property {string} content - The content of the section.
   * @property {string} category - The category of the section.
   * @property {string} sourcepage - The page from which the content was sourced.
   * @property {string} sourcefile - The file from which the content was sourced.
   * @property {Array<number>} [embedding] - Optional. The embedding representation of the section.
   */
  export class Section {
    constructor(id, content, category, sourcepage, sourcefile, embedding) {
      this.id = id; // The unique identifier for the section
      this.content = content; // The content of the section
      this.category = category; // The category of the section
      this.sourcepage = sourcepage; // The page from which the content was sourced
      this.sourcefile = sourcefile; // The file from which the content was sourced
      this.embedding = embedding; // Optional. The embedding representation of the section
    }
  }
  
  /**
   * Represents a page of content.
   * @typedef {Object} ContentPage
   * @property {string} content - The text content of the page.
   * @property {number} offset - The offset of the content within the document.
   * @property {number} page - The page number of the content.
   */
  export class ContentPage {
    constructor(content, offset, page) {
      this.content = content; // The text content of the page
      this.offset = offset; // The offset of the content within the document
      this.page = page; // The page number of the content
    }
  }
  
  /**
   * Represents a section of content.
   * @typedef {Object} ContentSection
   * @property {string} content - The text content of the section.
   * @property {number} page - The page number where the content is found.
   */
  export class ContentSection {
    constructor(content, page) {
      this.content = content; // The text content of the section
      this.page = page; // The page number where the content is found
    }
  }
  