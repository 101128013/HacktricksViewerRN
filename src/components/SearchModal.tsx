import React, { useContext } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NavigationContext } from '../contexts/NavigationContext';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import { useSearch } from '../hooks/useSearch';
import { SearchIndex } from '../types/search';

const { height: screenHeight } = Dimensions.get('window');

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  searchIndex: SearchIndex | null;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  searchIndex,
}) => {
  const { dispatch } = useContext(NavigationContext);
  const { searchState, loadMore } = useSearch({ searchIndex });

  const handleResultPress = (path: string) => {
    dispatch({ type: 'NAVIGATE_TO', payload: path });
    onClose();
  };

  const handleSearchResultSelect = (path: string) => {
    handleResultPress(path);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <SearchBar
            searchIndex={searchIndex}
            onResultSelect={handleSearchResultSelect}
            placeholder="Search Hacktricks documentation..."
            showHistory={true}
          />
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          <SearchResults
            results={searchState.results}
            isSearching={searchState.isSearching}
            hasMore={searchState.hasMore}
            onLoadMore={loadMore}
            onResultPress={handleResultPress}
            query={searchState.query}
          />
        </View>

        {/* Close button overlay */}
        <View style={styles.closeButtonContainer}>
          {/* This could be a floating close button if needed */}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  header: {
    backgroundColor: '#252526',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Account for status bar
  },
  resultsContainer: {
    flex: 1,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 20,
    zIndex: 1000,
  },
});

export default SearchModal;