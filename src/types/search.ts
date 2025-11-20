// Search-related type definitions

export interface SearchResult {
  id: string;
  title: string;
  path: string;
  excerpt: string;
  score: number;
  highlights: {
    title: HighlightSegment[];
    content: HighlightSegment[];
  };
  sections?: string[];
  codeBlocks?: string[];
}

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

export interface SearchIndex {
  terms: Record<string, TermInfo>;
  articles: Record<string, ArticleInfo>;
}

export interface TermInfo {
  df: number; // document frequency
  postings: Posting[];
}

export interface Posting {
  docId: string;
  tf: number; // term frequency
  positions: number[];
  field: 'title' | 'content' | 'section' | 'code';
}

export interface ArticleInfo {
  id: string;
  title: string;
  path: string;
  sections: string[];
  codeBlocks: string[];
  wordCount: number;
}

export interface SearchQuery {
  query: string;
  operators: QueryOperator[];
  filters?: SearchFilters;
}

export interface QueryOperator {
  type: 'phrase' | 'exclude' | 'boost';
  value: string;
  boost?: number;
}

export interface SearchFilters {
  field?: 'title' | 'content' | 'section' | 'code' | 'all';
  minScore?: number;
  maxResults?: number;
}

export interface SearchHistory {
  queries: string[];
  timestamp: number;
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  totalResults: number;
  history: SearchHistory;
}