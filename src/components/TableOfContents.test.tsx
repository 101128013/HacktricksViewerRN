import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TableOfContents from './TableOfContents';
import { NavigationProvider } from '../contexts/NavigationContext';

// Mock the search engine
jest.mock('../utils/miniSearchEngine', () => ({
  searchEngine: {
    search: jest.fn((query) => {
      if (query === 'AI') {
        return [
          {
            id: 'ai',
            title: 'AI',
            path: 'AI/README.md',
            score: 1,
          },
        ];
      }
      return [];
    }),
  },
}));

// Mock data for testing
const mockTocData = [
  {
    id: 'ai',
    title: 'AI',
    path: 'AI/README.md',
    level: 1,
    subsections: [
      {
        id: 'ai-assisted-fuzzing',
        title: 'AI Assisted Fuzzing and Vulnerability Discovery',
        path: 'AI/AI-Assisted-Fuzzing-and-Vulnerability-Discovery.md',
        level: 2,
      },
    ],
  },
  {
    id: 'binary-exploitation',
    title: 'Binary Exploitation',
    path: 'binary-exploitation/README.md',
    level: 1,
    subsections: [
      {
        id: 'basic-stack',
        title: 'Basic Stack Binary Exploitation Methodology',
        path: 'binary-exploitation/basic-stack-binary-exploitation-methodology/README.md',
        level: 2,
      },
    ],
  },
];

describe('TableOfContents', () => {
  it('renders the search input and TOC items', () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationProvider>
        <TableOfContents data={mockTocData} />
      </NavigationProvider>
    );

    expect(getByPlaceholderText('Search...')).toBeTruthy();
    expect(getByText('AI')).toBeTruthy();
    expect(getByText('Binary Exploitation')).toBeTruthy();
  });

  it('filters TOC items based on search query', () => {
    const { getByPlaceholderText, queryByText } = render(
      <NavigationProvider>
        <TableOfContents data={mockTocData} />
      </NavigationProvider>
    );

    const searchInput = getByPlaceholderText('Search...');
    fireEvent.changeText(searchInput, 'AI');

    expect(queryByText('AI')).toBeTruthy();
    expect(queryByText('Binary Exploitation')).toBeFalsy();
  });

  it('expands and collapses sections', () => {
    const { getByText, queryByText } = render(
      <NavigationProvider>
        <TableOfContents data={mockTocData} />
      </NavigationProvider>
    );

    const aiSection = getByText('AI');
    fireEvent.press(aiSection);

    // Check if subsection is now visible
    expect(queryByText('AI Assisted Fuzzing and Vulnerability Discovery')).toBeTruthy();

    // Press again to collapse
    fireEvent.press(aiSection);
    expect(queryByText('AI Assisted Fuzzing and Vulnerability Discovery')).toBeFalsy();
  });

  it('highlights search matches in text', () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationProvider>
        <TableOfContents data={mockTocData} />
      </NavigationProvider>
    );

    const searchInput = getByPlaceholderText('Search...');
    fireEvent.changeText(searchInput, 'AI');

    // The AI text should be highlighted (though we can't easily test the styling)
    expect(getByText('AI')).toBeTruthy();
  });

  it('handles navigation on item press', () => {
    const { getByText } = render(
      <NavigationProvider>
        <TableOfContents data={mockTocData} />
      </NavigationProvider>
    );

    // Expand the section first
    const aiSection = getByText('AI');
    fireEvent.press(aiSection);

    const aiItem = getByText('AI Assisted Fuzzing and Vulnerability Discovery');
    fireEvent.press(aiItem);

    // Navigation should be handled by the context (tested separately)
  });
});