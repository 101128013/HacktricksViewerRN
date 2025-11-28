import React, { useEffect, useState, useContext } from 'react';
import { SafeAreaView, View, StyleSheet, StatusBar, useColorScheme, Linking } from 'react-native';
import { NavigationProvider, NavigationContext } from './src/contexts/NavigationContext';
import { ZoomProvider } from './src/contexts/ZoomContext';
import TableOfContents from './src/components/TableOfContents';
import MarkdownRenderer from './src/components/MarkdownRenderer';
import { searchEngine } from './src/utils/miniSearchEngine';

// Import data directly
// In a production app, you might want to load this asynchronously or lazily
import tocDataRaw from './data/toc.json';

// Use require for the large JSON to avoid TS parsing overhead
// The .d.ts file we added helps, but this is safer for the IDE performance
const processedDocsRaw = require('./data/processed_docs.json');

// Types matching the component expectations
interface TocItem {
  id: string;
  title: string;
  path: string;
  level: number;
  subsections?: TocItem[];
}

// Transformer to convert raw TOC data to component format
const transformTocData = (items: any[], level = 0): TocItem[] => {
  if (!items) return [];
  
  return items.map((item, index) => ({
    id: item.path || `section-${level}-${index}-${item.title.replace(/\s+/g, '-')}`,
    title: item.title,
    path: item.path,
    level: level,
    subsections: item.items ? transformTocData(item.items, level + 1) : undefined,
  }));
};

// Inner component to consume contexts
const AppContent = ({ tocData }: { tocData: TocItem[] }) => {
  const { navigationState, dispatch } = useContext(NavigationContext);
  const { currentPath } = navigationState;
  const isDarkMode = (typeof useColorScheme === 'function' ? useColorScheme() : 'light') === 'dark';

  // Handle Deep Linking
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      // Expected format: hacktricks://path/to/doc.md
      if (url && url.startsWith('hacktricks://')) {
        const path = url.replace('hacktricks://', '');
        if (path) {
          dispatch({ type: 'NAVIGATE_TO', payload: path });
        }
      }
    };

    // Check for initial URL (guards for test environments where Linking may be undefined)
    if (Linking && typeof Linking.getInitialURL === 'function') {
      Linking.getInitialURL().then((url) => {
        if (url) handleDeepLink({ url });
      });
    }

    // Listen for incoming links
    const subscription = (Linking && typeof Linking.addEventListener === 'function') ? Linking.addEventListener('url', handleDeepLink) : { remove: () => {} };

    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  // Resolve content
  // processedDocsRaw is a dictionary where keys are paths
  const doc = currentPath ? (processedDocsRaw as any)[currentPath] : null;
  
  // Default content if nothing selected
  const defaultContent = `
# Welcome to Hacktricks Viewer

Select a topic from the sidebar to start reading.

## Features
- **Offline Access**: All documentation is available locally.
- **Search**: Filter topics in the sidebar.
- **Zoom**: Adjust text size for better readability.
- **Ad-Free**: Distraction-free reading experience.
  `;

  const content = doc ? doc.content : defaultContent;

  return (
    <View style={[styles.splitView, { backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff' }]}>
      <View style={[styles.sidebar, { borderColor: isDarkMode ? '#333' : '#e0e0e0' }]}>
        <TableOfContents data={tocData} />
      </View>
      <View style={styles.main}>
        <MarkdownRenderer 
          content={content} 
          theme={{
            colors: {
              background: isDarkMode ? '#1e1e1e' : '#ffffff',
              text: isDarkMode ? '#cccccc' : '#333333',
              primary: '#007acc',
              surface: isDarkMode ? '#252526' : '#f5f5f5',
            },
            fonts: {
              family: 'Segoe UI',
              size: { small: 12, medium: 14, large: 16 }
            }
          }}
        />
      </View>
    </View>
  );
};

const App = () => {
  const [tocData, setTocData] = useState<TocItem[]>([]);
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Initialize search engine
    // We use a timeout to ensure the UI renders first
    const timer = setTimeout(() => {
      try {
        searchEngine.indexDocuments(processedDocsRaw);
      } catch (e) {
        console.error("Failed to index documents", e);
      }
    }, 1000);

    // Transform the data structure
    const rawSections = (tocDataRaw as any).sections || [];
    
    const transformed = rawSections.flatMap((section: any) => {
      if (section.items && section.items.length > 0) {
        return [{
          id: `root-${section.title}`,
          title: section.title,
          path: '',
          level: 0,
          subsections: transformTocData(section.items, 1)
        }];
      }
      return [];
    });

    setTocData(transformed);

    return () => clearTimeout(timer);
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
    flex: 1,
  };

  return (
    <ZoomProvider>
      <NavigationProvider>
        <SafeAreaView style={backgroundStyle}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <AppContent tocData={tocData} />
        </SafeAreaView>
      </NavigationProvider>
    </ZoomProvider>
  );
};

const styles = StyleSheet.create({
  splitView: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 300,
    borderRightWidth: 1,
  },
  main: {
    flex: 1,
  },
});

export default App;
