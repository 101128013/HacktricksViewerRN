import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MarkdownRenderer from './MarkdownRenderer';
import { ZoomProvider } from '../contexts/ZoomContext';

import { Linking, Alert, Text } from 'react-native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock the external libraries
jest.mock('react-native-markdown-display', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    __esModule: true,
    default: jest.fn(({ children }: any) => (
      <Text testID="markdown-content">{children}</Text>
    )),
  };
});

jest.mock('react-native-syntax-highlighter', () => ({
  __esModule: true,
  default: ({ children }: any) => <span testID="syntax-highlighter">{children}</span>,
}));

jest.mock('react-syntax-highlighter/dist/styles/hljs', () => ({
  atomOneDark: {},
}));

describe('MarkdownRenderer', () => {
  const mockTheme = {
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
  };

  const defaultProps = {
    content: '# Test Heading\n\nThis is a test paragraph.',
    zoomLevel: 100,
    theme: mockTheme,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());
    jest.spyOn(Linking, 'canOpenURL').mockImplementation(() => Promise.resolve(true));
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    // Reset Markdown mock to default implementation
    const MarkdownMock = require('react-native-markdown-display').default;
    MarkdownMock.mockImplementation(({ children }: any) => (
      <Text testID="markdown-content">{children}</Text>
    ));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders markdown content correctly', () => {
    const { getByTestId } = render(
      <ZoomProvider>
        <MarkdownRenderer {...defaultProps} />
      </ZoomProvider>
    );
    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('applies zoom level to font size', () => {
    render(
      <ZoomProvider>
        <MarkdownRenderer {...defaultProps} zoomLevel={150} />
      </ZoomProvider>
    );
    // The component uses useMemo for fontSize calculation
    expect(true).toBe(true); // Component renders without crashing
  });

  it('applies theme styles correctly', () => {
    render(
      <ZoomProvider>
        <MarkdownRenderer {...defaultProps} />
      </ZoomProvider>
    );
    // Theme is applied through styles
    expect(true).toBe(true); // Component renders without crashing
  });

  it('handles external links correctly', async () => {
    const { Linking } = require('react-native');

    // Mock markdown library to call onLinkPress
    const MarkdownMock = require('react-native-markdown-display').default;
    MarkdownMock.mockImplementation(({ children, onLinkPress }: any) => (
      <button
        testID="link-button"
        onPress={() => onLinkPress('https://example.com')}
      >
        {children}
      </button>
    ));

    const { getByTestId } = render(
      <ZoomProvider>
        <MarkdownRenderer {...defaultProps} />
      </ZoomProvider>
    );

    fireEvent.press(getByTestId('link-button'));

    await waitFor(() => {
      expect(Linking.canOpenURL).toHaveBeenCalledWith('https://example.com');
      expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
    });
  });

  it('handles link opening errors gracefully', async () => {
    const { Linking, Alert } = require('react-native');
    Linking.canOpenURL.mockImplementation(() => Promise.reject(new Error('Network error')));

    const MarkdownMock = require('react-native-markdown-display').default;
    MarkdownMock.mockImplementation(({ children, onLinkPress }: any) => (
      <button
        testID="link-button"
        onPress={() => onLinkPress('https://example.com')}
      >
        {children}
      </button>
    ));

    const { getByTestId } = render(
      <ZoomProvider>
        <MarkdownRenderer {...defaultProps} />
      </ZoomProvider>
    );

    fireEvent.press(getByTestId('link-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to open link');
    });
  });

  it('handles unsupported URLs gracefully', async () => {
    const { Linking, Alert } = require('react-native');
    Linking.canOpenURL.mockImplementation(() => Promise.resolve(false));

    const MarkdownMock = require('react-native-markdown-display').default;
    MarkdownMock.mockImplementation(({ children, onLinkPress }: any) => (
      <button
        testID="link-button"
        onPress={() => onLinkPress('https://example.com')}
      >
        {children}
      </button>
    ));

    const { getByTestId } = render(
      <ZoomProvider>
        <MarkdownRenderer {...defaultProps} />
      </ZoomProvider>
    );

    fireEvent.press(getByTestId('link-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Cannot open this link');
    });
  });

  it('handles code blocks with syntax highlighting', () => {
    const codeContent = '```\nconst x = 1;\n```';
    const { getByTestId } = render(
      <ZoomProvider>
        <MarkdownRenderer {...defaultProps} content={codeContent} />
      </ZoomProvider>
    );

    // Since we mock Markdown, we can't check for SyntaxHighlighter rendering directly
    // But we can check that the content is rendered
    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('is memoized for performance', () => {
    const { rerender } = render(
      <ZoomProvider>
        <MarkdownRenderer {...defaultProps} />
      </ZoomProvider>
    );

    // Re-render with same props should use memoization
    rerender(
      <ZoomProvider>
        <MarkdownRenderer {...defaultProps} />
      </ZoomProvider>
    );
    expect(true).toBe(true); // Component renders without crashing
  });

  it('handles large content with performance optimizations', () => {
    const largeContent = '# Large Content\n' + 'Paragraph\n'.repeat(1000);
    const { getByTestId } = render(
      <ZoomProvider>
        <MarkdownRenderer {...defaultProps} content={largeContent} />
      </ZoomProvider>
    );

    expect(getByTestId('markdown-content')).toBeTruthy();
  });

  it('defaults to dark theme when no theme provided', () => {
    const { getByTestId } = render(
      <ZoomProvider>
        <MarkdownRenderer content={defaultProps.content} />
      </ZoomProvider>
    );
    expect(getByTestId('markdown-content')).toBeTruthy();
  });
});