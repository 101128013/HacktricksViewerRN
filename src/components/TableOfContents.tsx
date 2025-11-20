import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { NavigationContext } from '../contexts/NavigationContext';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { ThemeTransitionWrapper } from './ThemeTransitionWrapper';

import { searchEngine } from '../utils/miniSearchEngine';

// Types based on architecture
interface TocItem {
  id: string;
  title: string;
  path: string;
  level: number;
  subsections?: TocItem[];
}

interface TableOfContentsProps {
  data: TocItem[];
}

interface TocSectionProps {
  item: TocItem;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
  onNavigate: (path: string) => void;
  searchQuery: string;
  styles: any;
}

// TocSection Component
const TocSectionComponent: React.FC<TocSectionProps> = ({
  item,
  isExpanded,
  isActive,
  onToggle,
  onNavigate,
  searchQuery,
  styles,
}) => {
  const hasSubsections = item.subsections && item.subsections.length > 0;
  
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <Text key={index} style={styles.highlightedText}>
          {part}
        </Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    );
  };

  const matchesQuery = searchQuery && item.title.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.tocSection,
          isActive && styles.activeItem,
          matchesQuery && styles.matchedItem,
          { paddingLeft: 16 + (item.level * 10) } // Indentation
        ]}
        onPress={hasSubsections ? onToggle : () => onNavigate(item.path)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {hasSubsections ? (
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
          ) : (
            <View style={{ width: 12, marginRight: 8 }} />
          )}
          <Text
            style={[
              styles.tocSectionText,
              isActive && styles.activeText,
            ]}
            numberOfLines={1}
          >
            {highlightText(item.title, searchQuery)}
          </Text>
        </View>
      </TouchableOpacity>
      
      {hasSubsections && isExpanded && (
        <View>
          {item.subsections!.map((subsection) => (
            <TocSectionComponent
              key={subsection.id}
              item={subsection}
              isExpanded={false} // Recursive expansion logic would be needed for deep expansion
              isActive={false} // Logic to check if child is active
              onToggle={() => {}} // Needs state management for deep nesting
              onNavigate={onNavigate}
              searchQuery={searchQuery}
              styles={styles}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// Main TableOfContents Component
const TableOfContents: React.FC<TableOfContentsProps> = ({ data }) => {
  const { navigationState, dispatch } = useContext(NavigationContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Search Effect
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const results = searchEngine.search(searchQuery);
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
    } else {
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: [] });
    }
    dispatch({ type: 'SET_SEARCH_QUERY', payload: searchQuery });
  }, [searchQuery]);
  
  // Define styles locally for now to ensure it works without complex hook dependencies
  // In a real app, use the theme hook properly
  const themeStyles = StyleSheet.create({
    container: {
      flex: 1,
    },
    searchContainer: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    searchInput: {
      borderRadius: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      backgroundColor: 'rgba(128,128,128,0.1)',
    },
    listContainer: {
      paddingBottom: 20,
    },
    tocSection: {
      paddingVertical: 8,
      paddingRight: 16,
    },
    tocSectionText: {
      fontSize: 14,
      color: '#888', // Default text color
    },
    activeItem: {
      backgroundColor: 'rgba(0, 122, 204, 0.1)',
    },
    activeText: {
      color: '#007acc',
      fontWeight: 'bold',
    },
    matchedItem: {
      backgroundColor: 'rgba(255, 235, 59, 0.1)',
    },
    highlightedText: {
      backgroundColor: '#ffeb3b',
      color: '#000',
    },
    expandIcon: {
      fontSize: 12,
      marginRight: 8,
      width: 12,
      color: '#888',
    },
  });

  const handleToggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleNavigate = (path: string) => {
    dispatch({ type: 'NAVIGATE_TO', payload: path });
  };

  // Render Search Result Item
  const renderSearchResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        themeStyles.tocSection,
        { paddingLeft: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }
      ]}
      onPress={() => handleNavigate(item.path)}
    >
      <Text style={[themeStyles.tocSectionText, { fontWeight: 'bold' }]}>{item.title}</Text>
      <Text style={{ fontSize: 12, color: '#888' }} numberOfLines={1}>{item.path}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: TocItem }) => {
    const isExpanded = expandedSections.has(item.id);
    const isActive = navigationState.currentPath === item.path;

    return (
      <TocSectionComponent
        item={item}
        isExpanded={isExpanded}
        isActive={isActive}
        onToggle={() => handleToggleSection(item.id)}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        styles={themeStyles}
      />
    );
  };

  const isSearching = searchQuery.trim().length > 1;
  const displayData = isSearching ? navigationState.searchResults : data;

  return (
    <View style={themeStyles.container}>
      <View style={themeStyles.searchContainer}>
        <TextInput
          style={themeStyles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        renderItem={isSearching ? renderSearchResult : renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={themeStyles.listContainer}
      />
    </View>
  );
};

export default TableOfContents;
