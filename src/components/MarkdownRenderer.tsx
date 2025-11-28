import React, { useMemo, memo, useRef, useEffect } from 'react';
import { ScrollView, StyleSheet, Linking, Alert, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/styles/hljs';
import { useZoom } from '../contexts/ZoomContext';

interface MarkdownRendererProps {
  content: string;
  zoomLevel?: number;
  searchHighlights?: {
    terms: string[];
    currentIndex?: number;
  };
  onHighlightNavigation?: (direction: 'next' | 'prev') => void;
  theme?: {
    colors: {
      background: string;
      text: string;
      primary: string;
      surface: string;
    };
    fonts: {
      family: string;
      size: {
        small: number;
        medium: number;
        large: number;
      };
    };
  };
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  zoomLevel: propZoomLevel,
  searchHighlights,
  onHighlightNavigation,
  theme = {
    colors: {
      background: '#1e1e1e',
      text: '#cccccc',
      primary: '#007acc',
      surface: '#252526',
    },
    fonts: {
      family: 'Segoe UI',
      size: {
        small: 12,
        medium: 14,
        large: 16,
      },
    },
  },
}) => {
  const { zoomLevel: contextZoomLevel } = useZoom();
  const zoomLevel = propZoomLevel ?? contextZoomLevel;
  const scrollViewRef = useRef<ScrollView>(null);

  // Handle search highlight navigation
  useEffect(() => {
    if (searchHighlights?.currentIndex !== undefined && searchHighlights.terms.length > 0) {
      // Scroll to current highlight (implementation would depend on how highlights are rendered)
      // This is a placeholder for the scrolling logic
    }
  }, [searchHighlights?.currentIndex, searchHighlights]);

  const fontSize = useMemo(() => {
    const baseSize = theme.fonts.size.medium;
    return (baseSize * zoomLevel) / 100;
  }, [zoomLevel, theme.fonts.size.medium]);

  // Ad Removal and Content Cleaning
  const cleanedContent = useMemo(() => {
    if (!content) return '';
    
    let cleaned = content;

    // 1. Remove Banner Includes (Ads)
    // Matches {{#include ...banners...}}
    cleaned = cleaned.replace(/\{\{#include\s+.*?banners.*?\}\}/gi, '');

    // 2. Transform {{#ref}} links to standard Markdown links
    // Pattern: {{#ref}}\npath\n{{#endref}}
    cleaned = cleaned.replace(
      /\{\{#ref\}\}\s*\n(.*?)\n\s*\{\{#endref\}\}/g, 
      (match, path) => {
        // Create a readable label from the path
        const label = path.split('/').pop()?.replace('.md', '').replace(/-/g, ' ') || 'Link';
        return `\n[📄 ${label}](${path})\n`;
      }
    );

    // 3. Remove other potential ad markers if identified
    // (Add more regex replacements here as needed)

    return cleaned;
  }, [content]);

  const highlightSearchTerms = useMemo(() => {
    if (!searchHighlights?.terms || searchHighlights.terms.length === 0) {
      return { text: (t: string) => t };
    }

    const terms = searchHighlights.terms.map(term => term.toLowerCase());
    const highlightStyle = {
      backgroundColor: '#ffeb3b',
      color: '#000',
    };

    return {
      text: (input: string | (string | React.ReactElement)[]) => {
        // Keep a global counter for this text invocation to ensure unique keys
        let globalCounter = 0;
        const highlightText = (text: string): (string | React.ReactElement)[] => {
          if (!text) return [text];
          let highlightedText: (string | React.ReactElement)[] = [text];
          terms.forEach(term => {
            highlightedText = highlightedText.flatMap(segment => {
              if (typeof segment === 'string') {
                const parts = segment.split(new RegExp(`(${term})`, 'gi'));
                return parts.map((part) =>
                  part.toLowerCase() === term ? (
                    <Text key={`highlight-${term}-${globalCounter++}`} style={highlightStyle}>
                      {part}
                    </Text>
                  ) : (
                    part
                  )
                );
              }
              return [segment];
            });
          });
          return highlightedText;
        };

        if (Array.isArray(input)) {
          return input.flatMap((segment) => typeof segment === 'string' ? highlightText(segment) : segment);
        }
        return highlightText(input as string);
      },
    };
  }, [searchHighlights?.terms]);

  const syntaxHighlighterStyle = useMemo(() => ({
    ...atomOneDark,
    hljs: {
      ...atomOneDark.hljs,
      background: theme.colors.surface,
      color: theme.colors.text,
      fontSize: fontSize,
      fontFamily: theme.fonts.family,
    },
  }), [theme, fontSize]);

  const markdownStyles = useMemo(() => ({
    body: {
      color: theme.colors.text,
      fontSize: fontSize,
      fontFamily: theme.fonts.family,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    heading1: {
      color: theme.colors.primary,
      fontSize: fontSize * 1.5,
      fontFamily: theme.fonts.family,
      fontWeight: 'bold' as const,
      marginTop: 24,
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surface,
      paddingBottom: 8,
    },
    heading2: {
      color: theme.colors.primary,
      fontSize: fontSize * 1.3,
      fontFamily: theme.fonts.family,
      fontWeight: 'bold' as const,
      marginTop: 20,
      marginBottom: 12,
    },
    heading3: {
      color: theme.colors.primary,
      fontSize: fontSize * 1.2,
      fontFamily: theme.fonts.family,
      fontWeight: 'bold' as const,
      marginTop: 16,
      marginBottom: 8,
    },
    heading4: {
      color: theme.colors.primary,
      fontSize: fontSize * 1.1,
      fontFamily: theme.fonts.family,
      fontWeight: 'bold' as const,
      marginTop: 12,
      marginBottom: 6,
    },
    heading5: {
      color: theme.colors.primary,
      fontSize: fontSize,
      fontFamily: theme.fonts.family,
      fontWeight: 'bold' as const,
      marginTop: 8,
      marginBottom: 4,
    },
    heading6: {
      color: theme.colors.primary,
      fontSize: fontSize,
      fontFamily: theme.fonts.family,
      fontWeight: 'bold' as const,
      marginTop: 8,
      marginBottom: 4,
    },
    paragraph: {
      color: theme.colors.text,
      fontSize: fontSize,
      fontFamily: theme.fonts.family,
      lineHeight: fontSize * 1.6,
      marginBottom: 12,
    },
    list: {
      color: theme.colors.text,
      fontSize: fontSize,
      fontFamily: theme.fonts.family,
    },
    listItem: {
      color: theme.colors.text,
      fontSize: fontSize,
      fontFamily: theme.fonts.family,
      marginBottom: 4,
    },
    listItemBullet: {
      color: theme.colors.primary,
      fontSize: fontSize,
    },
    listItemNumber: {
      color: theme.colors.primary,
      fontSize: fontSize,
    },
    code_inline: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.primary,
      fontSize: fontSize * 0.9,
      fontFamily: 'Courier New',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      fontSize: fontSize,
      fontFamily: 'Courier New',
      padding: 12,
      borderRadius: 6,
      marginVertical: 8,
    },
    blockquote: {
      backgroundColor: theme.colors.surface,
      borderLeftColor: theme.colors.primary,
      borderLeftWidth: 4,
      paddingLeft: 12,
      paddingVertical: 8,
      marginVertical: 12,
    },
    link: {
      color: theme.colors.primary,
      textDecorationLine: 'underline' as const,
    },
    image: {
      marginVertical: 12,
    },
    table: {
      borderColor: theme.colors.surface,
      borderWidth: 1,
      marginVertical: 12,
    },
    thead: {
      backgroundColor: theme.colors.surface,
    },
    th: {
      padding: 8,
      borderColor: theme.colors.surface,
      borderWidth: 1,
      color: theme.colors.text,
      fontWeight: 'bold' as const,
      fontSize: fontSize,
      fontFamily: theme.fonts.family,
    },
    td: {
      padding: 8,
      borderColor: theme.colors.surface,
      borderWidth: 1,
      color: theme.colors.text,
      fontSize: fontSize,
      fontFamily: theme.fonts.family,
    },
    hr: {
      borderBottomColor: theme.colors.surface,
      borderBottomWidth: 1,
      marginVertical: 20,
    },
  }), [theme, fontSize]);

  const handleLinkPress = async (url: string) => {
    try {
      // Check if it's an external link (starts with http/https)
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open this link');
        }
      } else {
        // Handle internal navigation here if needed
        // This could be passed as a prop for internal link handling
        console.log('Internal link:', url);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const renderCodeBlock = useMemo(() => (props: any) => {
    const { children, ...rest } = props;
    const code = String(children).replace(/\n$/, '');

    // Extract language from the code block
    const languageMatch = rest.node?.properties?.className?.match(/language-(\w+)/);
    const language = languageMatch ? languageMatch[1] : '';

    return (
      <SyntaxHighlighter
        language={language}
        style={syntaxHighlighterStyle}
        customStyle={{
          marginVertical: 8,
          borderRadius: 6,
          padding: 12,
        }}
      >
        {code}
      </SyntaxHighlighter>
    );
  }, [syntaxHighlighterStyle]);

  // Normalize children coming from markdown parser so we never pass
  // raw token objects directly into React elements.
  const normalizeChildrenForRender = (children: any): string | (string | React.ReactElement)[] => {
    // Simple primitives
    if (children === null || children === undefined) return '';
    if (typeof children === 'string' || typeof children === 'number') return String(children);

    // React elements - keep as-is or clone with key when returning arrays
    if (React.isValidElement(children)) return children;

    // Arrays - flatten recursively
    if (Array.isArray(children)) {
      let counter = 0;
      return children.flatMap((child) => {
        if (typeof child === 'string' || typeof child === 'number') return String(child);
        if (React.isValidElement(child)) {
          // Clone to ensure a key exists when placed into an array of siblings
          return React.cloneElement(child, { key: `md-el-${counter++}` });
        }
        if (child && typeof child === 'object') {
          // Token-like object from a Markdown parser: prefer its content or flatten children
          if (typeof child.content === 'string') return child.content;
          if (child.children) return normalizeChildrenForRender(child.children);
        }
        return '';
      });
    }

    // Objects - token shapes used by markdown parsers
    if (typeof children === 'object') {
      if (typeof children.content === 'string') return children.content;
      if (children.children) return normalizeChildrenForRender(children.children);
      return '';
    }

    return String(children);
  };

  const renderParagraph = useMemo(() => (props: any) => {
    const { children } = props;
    const normalized = normalizeChildrenForRender(children);
    const processedChildren = searchHighlights?.terms
      ? highlightSearchTerms.text(normalized)
      : normalized;

    return (
      <Text style={markdownStyles.paragraph}>
        {processedChildren}
      </Text>
    );
  }, [markdownStyles.paragraph, highlightSearchTerms, searchHighlights?.terms]);

  const renderHeading = useMemo(() => (level: number) => (props: any) => {
    const { children } = props;
    const normalized = normalizeChildrenForRender(children);
    const processedChildren = searchHighlights?.terms
      ? highlightSearchTerms.text(normalized)
      : normalized;

    const headingStyle = markdownStyles[`heading${level}` as keyof typeof markdownStyles] as any;

    return (
      <Text style={headingStyle}>
        {processedChildren}
      </Text>
    );
  }, [markdownStyles, highlightSearchTerms, searchHighlights?.terms]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={true}
      bounces={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={20}
      windowSize={10}
    >
      <Markdown
        style={markdownStyles}
        rules={{
          code_block: renderCodeBlock,
          paragraph: renderParagraph,
          heading1: renderHeading(1),
          heading2: renderHeading(2),
          heading3: renderHeading(3),
          heading4: renderHeading(4),
          heading5: renderHeading(5),
          heading6: renderHeading(6),
        }}
        onLinkPress={handleLinkPress}
      >
        {cleanedContent}
      </Markdown>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default memo(MarkdownRenderer);
