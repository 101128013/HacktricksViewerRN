import React, { createContext, useReducer, ReactNode } from 'react';

// Types
export interface TocItem {
  id: string;
  title: string;
  path: string;
  level: number;
  subsections?: TocItem[];
}

export interface NavigationState {
  currentPath: string | null;
  expandedSections: Set<string>;
  searchQuery: string;
  searchResults: any[];
}

type NavigationAction =
  | { type: 'NAVIGATE_TO'; payload: string }
  | { type: 'TOGGLE_SECTION'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: any[] }
  | { type: 'RESET_NAVIGATION' };

const initialState: NavigationState = {
  currentPath: null,
  expandedSections: new Set(),
  searchQuery: '',
  searchResults: [],
};

function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'NAVIGATE_TO':
      return {
        ...state,
        currentPath: action.payload,
      };
    case 'TOGGLE_SECTION':
      const newExpanded = new Set(state.expandedSections);
      if (newExpanded.has(action.payload)) {
        newExpanded.delete(action.payload);
      } else {
        newExpanded.add(action.payload);
      }
      return {
        ...state,
        expandedSections: newExpanded,
      };
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };
    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload,
      };
    case 'RESET_NAVIGATION':
      return initialState;
    default:
      return state;
  }
}

export const NavigationContext = createContext<{
  navigationState: NavigationState;
  dispatch: React.Dispatch<NavigationAction>;
}>({
  navigationState: initialState,
  dispatch: () => {},
});

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [navigationState, dispatch] = useReducer(navigationReducer, initialState);

  return (
    <NavigationContext.Provider value={{ navigationState, dispatch }}>
      {children}
    </NavigationContext.Provider>
  );
};