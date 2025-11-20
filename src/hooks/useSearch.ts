import { useState, useEffect, useCallback, useRef } from 'react';
import { SearchResult, SearchState, SearchIndex } from '../types/search';
import { SearchEngine, SearchHistory } from '../utils/searchUtils';

interface UseSearchOptions {
  searchIndex: SearchIndex | null;
  debounceMs?: number;
  maxResults?: number;
}

export const useSearch = ({ searchIndex, debounceMs = 300, maxResults = 50 }: UseSearchOptions) => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    isSearching: false,
    error: null,
    hasMore: false,
    page: 1,
    totalResults: 0,
    history: { queries: [], timestamp: Date.now() },
  });

  const searchEngineRef = useRef<SearchEngine | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize search engine when index is available
  useEffect(() => {
    if (searchIndex) {
      searchEngineRef.current = new SearchEngine(searchIndex);
    }
  }, [searchIndex]);

  // Load search history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const queries = await SearchHistory.getHistory();
        setSearchState(prev => ({
          ...prev,
          history: {
            queries,
            timestamp: Date.now(),
          },
        }));
      } catch (error) {
        console.warn('Failed to load search history:', error);
      }
    };

    loadHistory();
  }, []);

  const performSearch = useCallback(async (query: string, page: number = 1) => {
    if (!searchEngineRef.current) {
      setSearchState(prev => ({
        ...prev,
        error: 'Search index not available',
        isSearching: false,
      }));
      return;
    }

    if (!query.trim()) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        isSearching: false,
        error: null,
        totalResults: 0,
      }));
      return;
    }

    setSearchState(prev => ({
      ...prev,
      isSearching: true,
      error: null,
    }));

    try {
      const results = await searchEngineRef.current.search(query, maxResults * page);
      const pageResults = results.slice((page - 1) * maxResults, page * maxResults);

      setSearchState(prev => ({
        ...prev,
        results: page === 1 ? pageResults : [...prev.results, ...pageResults],
        isSearching: false,
        hasMore: results.length > page * maxResults,
        page,
        totalResults: results.length,
      }));

      // Add to history if not empty
      if (query.trim() && page === 1) {
        await SearchHistory.addToHistory(query.trim());
        const updatedHistory = await SearchHistory.getHistory();
        setSearchState(prev => ({
          ...prev,
          history: {
            queries: updatedHistory,
            timestamp: Date.now(),
          },
        }));
      }
    } catch (error) {
      setSearchState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Search failed',
        isSearching: false,
      }));
    }
  }, [maxResults]);

  const search = useCallback((query: string) => {
    setSearchState(prev => ({
      ...prev,
      query,
    }));

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce search
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query, 1);
    }, debounceMs);
  }, [performSearch, debounceMs]);

  const loadMore = useCallback(() => {
    if (!searchState.hasMore || searchState.isSearching) return;

    performSearch(searchState.query, searchState.page + 1);
  }, [searchState.hasMore, searchState.isSearching, searchState.query, searchState.page, performSearch]);

  const clearSearch = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      query: '',
      results: [],
      error: null,
      hasMore: false,
      page: 1,
      totalResults: 0,
    }));

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await SearchHistory.clearHistory();
      setSearchState(prev => ({
        ...prev,
        history: { queries: [], timestamp: Date.now() },
      }));
    } catch (error) {
      console.warn('Failed to clear search history:', error);
    }
  }, []);

  const repeatSearch = useCallback((query: string) => {
    search(query);
  }, [search]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    searchState,
    search,
    clearSearch,
    loadMore,
    clearHistory,
    repeatSearch,
  };
};