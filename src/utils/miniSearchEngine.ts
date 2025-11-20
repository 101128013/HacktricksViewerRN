import MiniSearch from 'minisearch';

export interface SearchResultItem {
  id: string;
  title: string;
  path: string;
  score: number;
  match: {
    [key: string]: string[];
  };
  excerpt?: string;
}

export class MiniSearchEngine {
  private miniSearch: MiniSearch;
  private isIndexed: boolean = false;

  constructor() {
    this.miniSearch = new MiniSearch({
      fields: ['title', 'content', 'sections'], // fields to index for full-text search
      storeFields: ['title', 'path'], // fields to return with search results
      searchOptions: {
        boost: { title: 2, sections: 1.5 },
        fuzzy: 0.2,
        prefix: true,
      },
    });
  }

  /**
   * Index the documents.
   * @param docs Dictionary of documents from processed_docs.json
   */
  indexDocuments(docs: Record<string, any>) {
    if (this.isIndexed) return;

    const documents = Object.entries(docs).map(([path, doc]) => {
      // Flatten sections for indexing
      const sectionsText = doc.sections 
        ? doc.sections.map((s: any) => s.title + ' ' + s.content).join(' ') 
        : '';

      return {
        id: path,
        title: doc.title,
        path: doc.path,
        content: doc.content,
        sections: sectionsText,
      };
    });

    this.miniSearch.addAll(documents);
    this.isIndexed = true;
  }

  /**
   * Search for a query string.
   */
  search(query: string): SearchResultItem[] {
    if (!query || !this.isIndexed) return [];

    const results = this.miniSearch.search(query);

    return results.map(result => ({
      id: result.id,
      title: result.title,
      path: result.path,
      score: result.score,
      match: result.match,
      // We could generate an excerpt here if we stored the content, 
      // but for performance we might just return the title/path for now
      // or fetch the content from the main store using the path.
    }));
  }
}

export const searchEngine = new MiniSearchEngine();
