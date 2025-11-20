import { SearchIndex, SearchResult, SearchQuery, QueryOperator, HighlightSegment, ArticleInfo, Posting } from '../types/search';

// TF-IDF based scoring weights
const FIELD_WEIGHTS = {
  title: 10,
  code: 3,
  section: 2,
  content: 1,
};

// Advanced search operators
const OPERATORS = {
  PHRASE: /"([^"]+)"/g,
  EXCLUDE: /-(\w+)/g,
  BOOST_TITLE: /title:(\w+)/g,
  BOOST_CODE: /code:(\w+)/g,
};

export class SearchEngine {
  private index: SearchIndex;
  private articles: Record<string, ArticleInfo>;

  constructor(index: SearchIndex) {
    this.index = index;
    this.articles = index.articles;
  }

  /**
   * Parse search query and extract operators
   */
  parseQuery(query: string): SearchQuery {
    const operators: QueryOperator[] = [];
    let cleanQuery = query;

    // Extract phrase queries
    const phrases = query.match(OPERATORS.PHRASE);
    if (phrases) {
      phrases.forEach(phrase => {
        operators.push({
          type: 'phrase',
          value: phrase.slice(1, -1), // Remove quotes
        });
        cleanQuery = cleanQuery.replace(phrase, '');
      });
    }

    // Extract exclusion terms
    const exclusions = query.match(OPERATORS.EXCLUDE);
    if (exclusions) {
      exclusions.forEach(exclusion => {
        operators.push({
          type: 'exclude',
          value: exclusion.substring(1), // Remove minus
        });
        cleanQuery = cleanQuery.replace(exclusion, '');
      });
    }

    // Extract field boosts
    const titleBoosts = query.match(OPERATORS.BOOST_TITLE);
    if (titleBoosts) {
      titleBoosts.forEach(boost => {
        operators.push({
          type: 'boost',
          value: boost.split(':')[1],
          boost: FIELD_WEIGHTS.title,
        });
        cleanQuery = cleanQuery.replace(boost, '');
      });
    }

    const codeBoosts = query.match(OPERATORS.BOOST_CODE);
    if (codeBoosts) {
      codeBoosts.forEach(boost => {
        operators.push({
          type: 'boost',
          value: boost.split(':')[1],
          boost: FIELD_WEIGHTS.code,
        });
        cleanQuery = cleanQuery.replace(boost, '');
      });
    }

    return {
      query: cleanQuery.trim(),
      operators,
    };
  }

  /**
   * Perform search with ranking
   */
  async search(query: string, maxResults: number = 50): Promise<SearchResult[]> {
    const parsed = this.parseQuery(query);
    const terms = this.tokenize(parsed.query);

    if (terms.length === 0 && parsed.operators.length === 0) {
      return [];
    }

    const results = new Map<string, SearchResult>();

    // Handle regular terms
    for (const term of terms) {
      const termResults = this.searchTerm(term);
      this.mergeResults(results, termResults, FIELD_WEIGHTS.content);
    }

    // Handle operators
    for (const operator of parsed.operators) {
      switch (operator.type) {
        case 'phrase':
          const phraseResults = this.searchPhrase(operator.value);
          this.mergeResults(results, phraseResults, FIELD_WEIGHTS.content);
          break;
        case 'exclude':
          this.excludeFromResults(results, operator.value);
          break;
        case 'boost':
          const boostResults = this.searchTerm(operator.value);
          this.mergeResults(results, boostResults, operator.boost || 1);
          break;
      }
    }

    // Sort by score and limit results
    const sortedResults = Array.from(results.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    // Add highlighting
    return sortedResults.map(result => ({
      ...result,
      highlights: this.highlightResult(result, parsed.query),
    }));
  }

  /**
   * Tokenize query into terms
   */
  private tokenize(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2); // Minimum term length
  }

  /**
   * Search for a single term
   */
  private searchTerm(term: string): Map<string, number> {
    const results = new Map<string, number>();
    const termInfo = this.index.terms[term];

    if (!termInfo) return results;

    const idf = Math.log(Object.keys(this.articles).length / termInfo.df);

    for (const posting of termInfo.postings) {
      const article = this.articles[posting.docId];
      if (!article) continue;

      const tf = posting.tf / article.wordCount; // Normalized term frequency
      const fieldWeight = FIELD_WEIGHTS[posting.field] || 1;
      const score = (tf * idf) * fieldWeight;

      results.set(posting.docId, (results.get(posting.docId) || 0) + score);
    }

    return results;
  }

  /**
   * Search for exact phrase
   */
  private searchPhrase(phrase: string): Map<string, number> {
    const results = new Map<string, number>();
    const terms = this.tokenize(phrase);

    if (terms.length === 0) return results;

    // Find articles containing all terms
    const candidateArticles = this.findArticlesWithAllTerms(terms);

    for (const docId of candidateArticles) {
      const positions = this.getPhrasePositions(docId, terms);
      if (positions.length > 0) {
        results.set(docId, positions.length * FIELD_WEIGHTS.content);
      }
    }

    return results;
  }

  /**
   * Find articles containing all terms
   */
  private findArticlesWithAllTerms(terms: string[]): string[] {
    if (terms.length === 0) return [];

    let candidates = new Set(Object.keys(this.articles));

    for (const term of terms) {
      const termInfo = this.index.terms[term];
      if (!termInfo) return [];

      const termDocs = new Set(termInfo.postings.map(p => p.docId));
      candidates = new Set([...candidates].filter(doc => termDocs.has(doc)));
    }

    return Array.from(candidates);
  }

  /**
   * Get positions where phrase occurs
   */
  private getPhrasePositions(docId: string, terms: string[]): number[] {
    if (terms.length === 0) return [];

    const positions: number[] = [];
    const termPositions = terms.map(term => {
      const posting = this.index.terms[term]?.postings.find(p => p.docId === docId);
      return posting?.positions || [];
    });

    if (termPositions.some(pos => pos.length === 0)) return [];

    // Find consecutive positions
    for (const startPos of termPositions[0]) {
      let isPhrase = true;
      for (let i = 1; i < terms.length; i++) {
        if (!termPositions[i].includes(startPos + i)) {
          isPhrase = false;
          break;
        }
      }
      if (isPhrase) {
        positions.push(startPos);
      }
    }

    return positions;
  }

  /**
   * Merge search results
   */
  private mergeResults(
    results: Map<string, SearchResult>,
    newResults: Map<string, number>,
    weight: number
  ): void {
    for (const [docId, score] of newResults) {
      const article = this.articles[docId];
      if (!article) continue;

      const existing = results.get(docId);
      const newScore = (existing?.score || 0) + (score * weight);

      results.set(docId, {
        id: docId,
        title: article.title,
        path: article.path,
        excerpt: this.generateExcerpt(article, score),
        score: newScore,
        highlights: { title: [], content: [] }, // Will be filled later
        sections: article.sections,
        codeBlocks: article.codeBlocks,
      });
    }
  }

  /**
   * Exclude documents containing a term
   */
  private excludeFromResults(results: Map<string, SearchResult>, term: string): void {
    const termInfo = this.index.terms[term.toLowerCase()];
    if (!termInfo) return;

    const excludedDocs = new Set(termInfo.postings.map(p => p.docId));
    for (const docId of excludedDocs) {
      results.delete(docId);
    }
  }

  /**
   * Generate excerpt from article content
   */
  private generateExcerpt(article: ArticleInfo, score: number): string {
    // Simple excerpt generation - in real implementation, you'd extract relevant snippets
    const maxLength = 200;
    const title = article.title;
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  }

  /**
   * Highlight search terms in result
   */
  private highlightResult(result: SearchResult, query: string): { title: HighlightSegment[]; content: HighlightSegment[] } {
    const titleHighlights = this.highlightText(result.title, query);
    const contentHighlights = this.highlightText(result.excerpt, query);

    return {
      title: titleHighlights,
      content: contentHighlights,
    };
  }

  /**
   * Highlight text with search terms
   */
  private highlightText(text: string, query: string): HighlightSegment[] {
    const terms = this.tokenize(query);
    if (terms.length === 0) return [{ text, highlighted: false }];

    let segments: HighlightSegment[] = [{ text, highlighted: false }];

    for (const term of terms) {
      const regex = new RegExp(`(${term})`, 'gi');
      segments = segments.flatMap(segment => {
        if (segment.highlighted) return [segment];

        const parts = segment.text.split(regex);
        return parts.map(part => ({
          text: part,
          highlighted: regex.test(part),
        }));
      });
    }

    return segments;
  }
}

// Utility functions for search history management
export const SearchHistory = {
  KEY: 'search_history',

  async getHistory(): Promise<string[]> {
    // In React Native, use AsyncStorage
    // For now, return empty array
    return [];
  },

  async addToHistory(query: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const filtered = history.filter(q => q !== query);
      filtered.unshift(query);

      // Keep only last 10 searches
      // const limited = filtered.slice(0, 10);

      // Save to storage
      // AsyncStorage.setItem(this.KEY, JSON.stringify(limited));
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
  },

  async clearHistory(): Promise<void> {
    try {
      // AsyncStorage.removeItem(this.KEY);
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  },
};