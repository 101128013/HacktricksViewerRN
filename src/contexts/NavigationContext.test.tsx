import React from 'react';
import { render, act } from '@testing-library/react-native';
import { NavigationProvider, NavigationContext } from './NavigationContext';

describe('NavigationContext', () => {
  it('provides initial state', () => {
    let contextValue: any;
    render(
      <NavigationProvider>
        <NavigationContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </NavigationContext.Consumer>
      </NavigationProvider>
    );

    expect(contextValue.navigationState.currentPath).toBeNull();
    expect(contextValue.navigationState.expandedSections).toEqual(new Set());
    expect(contextValue.navigationState.searchQuery).toBe('');
    expect(contextValue.navigationState.searchResults).toEqual([]);
  });

  it('handles NAVIGATE_TO action', () => {
    let contextValue: any;
    render(
      <NavigationProvider>
        <NavigationContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </NavigationContext.Consumer>
      </NavigationProvider>
    );

    act(() => {
      contextValue.dispatch({ type: 'NAVIGATE_TO', payload: 'test/path.md' });
    });

    expect(contextValue.navigationState.currentPath).toBe('test/path.md');
  });

  it('handles TOGGLE_SECTION action', () => {
    let contextValue: any;
    render(
      <NavigationProvider>
        <NavigationContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </NavigationContext.Consumer>
      </NavigationProvider>
    );

    act(() => {
      contextValue.dispatch({ type: 'TOGGLE_SECTION', payload: 'section1' });
    });

    expect(contextValue.navigationState.expandedSections.has('section1')).toBe(true);

    act(() => {
      contextValue.dispatch({ type: 'TOGGLE_SECTION', payload: 'section1' });
    });

    expect(contextValue.navigationState.expandedSections.has('section1')).toBe(false);
  });

  it('handles SET_SEARCH_QUERY action', () => {
    let contextValue: any;
    render(
      <NavigationProvider>
        <NavigationContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </NavigationContext.Consumer>
      </NavigationProvider>
    );

    act(() => {
      contextValue.dispatch({ type: 'SET_SEARCH_QUERY', payload: 'test query' });
    });

    expect(contextValue.navigationState.searchQuery).toBe('test query');
  });

  it('handles SET_SEARCH_RESULTS action', () => {
    let contextValue: any;
    const mockResults = [
      { id: '1', title: 'Test', path: 'test.md', level: 1 },
    ];

    render(
      <NavigationProvider>
        <NavigationContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </NavigationContext.Consumer>
      </NavigationProvider>
    );

    act(() => {
      contextValue.dispatch({ type: 'SET_SEARCH_RESULTS', payload: mockResults });
    });

    expect(contextValue.navigationState.searchResults).toEqual(mockResults);
  });

  it('handles RESET_NAVIGATION action', () => {
    let contextValue: any;
    render(
      <NavigationProvider>
        <NavigationContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </NavigationContext.Consumer>
      </NavigationProvider>
    );

    // Set some state first
    act(() => {
      contextValue.dispatch({ type: 'NAVIGATE_TO', payload: 'test.md' });
      contextValue.dispatch({ type: 'SET_SEARCH_QUERY', payload: 'query' });
    });

    act(() => {
      contextValue.dispatch({ type: 'RESET_NAVIGATION' });
    });

    expect(contextValue.navigationState.currentPath).toBeNull();
    expect(contextValue.navigationState.searchQuery).toBe('');
  });
});