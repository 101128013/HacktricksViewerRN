import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SearchResult } from '../types/search';

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onResultPress: (path: string) => void;
  query: string;
}

interface SearchResultItemProps {
  result: SearchResult;
  onPress: (path: string) => void;
  query: string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result, onPress, query }) => {
  const renderHighlightedText = (segments: { text: string; highlighted: boolean }[]) => {
    return segments.map((segment, index) => (
      <Text
        key={index}
        style={segment.highlighted ? styles.highlightedText : styles.normalText}
      >
        {segment.text}
      </Text>
    ));
  };

  return (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => onPress(result.path)}
      activeOpacity={0.7}
    >
      {/* Title with highlighting */}
      <View style={styles.titleContainer}>
        {renderHighlightedText(result.highlights.title)}
      </View>

      {/* Path */}
      <Text style={styles.pathText}>{result.path}</Text>

      {/* Excerpt with highlighting */}
      <View style={styles.excerptContainer}>
        <Text style={styles.excerptLabel}>Excerpt: </Text>
        {renderHighlightedText(result.highlights.content)}
      </View>

      {/* Metadata */}
      <View style={styles.metadataContainer}>
        <Text style={styles.scoreText}>Score: {result.score.toFixed(2)}</Text>
        {result.sections && result.sections.length > 0 && (
          <Text style={styles.sectionsText}>
            Sections: {result.sections.slice(0, 3).join(', ')}
            {result.sections.length > 3 && '...'}
          </Text>
        )}
        {result.codeBlocks && result.codeBlocks.length > 0 && (
          <Text style={styles.codeBlocksText}>
            Code blocks: {result.codeBlocks.length}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isSearching,
  hasMore,
  onLoadMore,
  onResultPress,
  query,
}) => {
  const renderResult = ({ item }: { item: SearchResult }) => (
    <SearchResultItem
      result={item}
      onPress={onResultPress}
      query={query}
    />
  );

  const renderFooter = () => {
    if (!hasMore && !isSearching) return null;

    return (
      <View style={styles.footerContainer}>
        {isSearching ? (
          <ActivityIndicator size="small" color="#4fc3f7" />
        ) : hasMore ? (
          <TouchableOpacity style={styles.loadMoreButton} onPress={onLoadMore}>
            <Text style={styles.loadMoreText}>Load More Results</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderEmpty = () => {
    if (isSearching) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#4fc3f7" />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      );
    }

    if (!query.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Start typing to search</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No results found for "{query}"</Text>
        <Text style={styles.emptySubtext}>Try different keywords or operators like:</Text>
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionText}>"exact phrase"</Text>
          <Text style={styles.suggestionText}>-exclude word</Text>
          <Text style={styles.suggestionText}>title:search term</Text>
          <Text style={styles.suggestionText}>code:language</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderResult}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={results.length === 0 ? styles.emptyListContainer : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  resultItem: {
    backgroundColor: '#252526',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  titleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  normalText: {
    color: '#cccccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  highlightedText: {
    backgroundColor: '#ffeb3b',
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pathText: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  excerptContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  excerptLabel: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metadataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreText: {
    color: '#4fc3f7',
    fontSize: 12,
  },
  sectionsText: {
    color: '#888',
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },
  codeBlocksText: {
    color: '#888',
    fontSize: 12,
  },
  footerContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#2d4a7a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  loadMoreText: {
    color: '#4fc3f7',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#cccccc',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  suggestionsContainer: {
    alignItems: 'center',
  },
  suggestionText: {
    color: '#4fc3f7',
    fontSize: 14,
    marginVertical: 2,
    fontFamily: 'monospace',
  },
});

export default SearchResults;