import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Keyboard,
  Modal,
  Dimensions,
} from 'react-native';
import { useSearch } from '../hooks/useSearch';
import { SearchIndex } from '../types/search';

const { width: screenWidth } = Dimensions.get('window');

interface SearchBarProps {
  searchIndex: SearchIndex | null;
  onResultSelect?: (path: string) => void;
  placeholder?: string;
  showHistory?: boolean;
}

interface SearchSuggestion {
  type: 'history' | 'operator';
  text: string;
  description?: string;
}

const SEARCH_OPERATORS = [
  { operator: '"text"', description: 'Search for exact phrases' },
  { operator: '-word', description: 'Exclude words from results' },
  { operator: 'title:word', description: 'Search only in titles' },
  { operator: 'code:word', description: 'Search only in code blocks' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  searchIndex,
  onResultSelect,
  placeholder = 'Search documentation...',
  showHistory = true,
}) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<TextInput>(null);

  const { searchState, search, clearSearch, clearHistory, repeatSearch } = useSearch({
    searchIndex,
    debounceMs: 300,
  });

  // Update suggestions based on query and history
  useEffect(() => {
    const newSuggestions: SearchSuggestion[] = [];

    if (showHistory && !query && searchState.history.queries.length > 0) {
      // Show recent searches
      searchState.history.queries.slice(0, 5).forEach(historyQuery => {
        newSuggestions.push({
          type: 'history',
          text: historyQuery,
        });
      });
    } else if (query && query.length > 0) {
      // Show operator suggestions
      const lastChar = query.slice(-1);
      if (lastChar === '"' || query.includes('"')) {
        // Suggest closing quote
        newSuggestions.push({
          type: 'operator',
          text: query.endsWith('"') ? query : query + '"',
          description: 'Complete exact phrase search',
        });
      } else if (query.startsWith('-')) {
        // Already using exclusion
        newSuggestions.push(...SEARCH_OPERATORS.slice(1));
      } else {
        // Show all operators
        SEARCH_OPERATORS.forEach(({ operator, description }) => {
          newSuggestions.push({
            type: 'operator',
            text: operator,
            description,
          });
        });
      }
    }

    setSuggestions(newSuggestions);
  }, [query, searchState.history.queries, showHistory]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (text.trim()) {
      search(text);
    } else {
      clearSearch();
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'history') {
      setQuery(suggestion.text);
      repeatSearch(suggestion.text);
    } else {
      // Insert operator into current query
      const newQuery = suggestion.text;
      setQuery(newQuery);
      if (newQuery.trim()) {
        search(newQuery);
      }
    }
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleClearHistory = () => {
    clearHistory();
    setSuggestions([]);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow selection
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionText}>
          {item.type === 'history' && '🕒 '}
          {item.text}
        </Text>
        {item.description && (
          <Text style={styles.suggestionDescription}>{item.description}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSearchStatus = () => {
    if (searchState.isSearching) {
      return <Text style={styles.statusText}>Searching...</Text>;
    }
    if (searchState.error) {
      return <Text style={styles.errorText}>{searchState.error}</Text>;
    }
    if (searchState.query && searchState.results.length > 0) {
      return (
        <Text style={styles.statusText}>
          {searchState.totalResults} results ({searchState.page} page{searchState.page > 1 ? 's' : ''})
        </Text>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#888"
          value={query}
          onChangeText={handleQueryChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />

        {query.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setQuery('');
              clearSearch();
              inputRef.current?.focus();
            }}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {renderSearchStatus()}

      {/* Suggestions Modal */}
      <Modal
        visible={showSuggestions && suggestions.length > 0}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuggestions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSuggestions(false)}
        >
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `${item.type}-${index}`}
              renderItem={renderSuggestion}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />

            {showHistory && suggestions.some(s => s.type === 'history') && (
              <TouchableOpacity
                style={styles.clearHistoryButton}
                onPress={handleClearHistory}
              >
                <Text style={styles.clearHistoryText}>Clear History</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  clearButtonText: {
    color: '#888',
    fontSize: 16,
  },
  statusText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    width: screenWidth - 32,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#333',
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  suggestionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  suggestionDescription: {
    color: '#888',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    textAlign: 'right',
  },
  clearHistoryButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  clearHistoryText: {
    color: '#ff6b6b',
    fontSize: 14,
  },
});

export default SearchBar;