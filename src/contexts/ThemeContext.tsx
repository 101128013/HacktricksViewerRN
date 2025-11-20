import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, themes, getTheme, getAccessibleTheme, ThemeId } from '../themes';

interface ThemeState {
  currentTheme: Theme;
  themeId: ThemeId;
  isHighContrast: boolean;
  isTransitioning: boolean;
}

type ThemeAction =
  | { type: 'SET_THEME'; payload: { themeId: ThemeId; isAccessible?: boolean } }
  | { type: 'TOGGLE_HIGH_CONTRAST' }
  | { type: 'SET_TRANSITIONING'; payload: boolean }
  | { type: 'LOAD_PERSISTED_THEME'; payload: { themeId: ThemeId; isHighContrast: boolean } };

interface ThemeContextType extends ThemeState {
  setTheme: (themeId: ThemeId, isAccessible?: boolean) => Promise<void>;
  toggleHighContrast: () => Promise<void>;
  getThemePreview: (themeId: ThemeId, isAccessible?: boolean) => Theme;
}

const initialState: ThemeState = {
  currentTheme: themes.dark,
  themeId: 'dark',
  isHighContrast: false,
  isTransitioning: false,
};

const STORAGE_KEYS = {
  THEME_ID: '@hacktricks_theme_id',
  HIGH_CONTRAST: '@hacktricks_high_contrast',
} as const;

function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_THEME':
      const { themeId, isAccessible = false } = action.payload;
      const baseTheme = getTheme(themeId);
      const finalTheme = isAccessible ? getAccessibleTheme(baseTheme) : baseTheme;

      return {
        ...state,
        currentTheme: finalTheme,
        themeId,
        isHighContrast: isAccessible,
        isTransitioning: false,
      };

    case 'TOGGLE_HIGH_CONTRAST':
      const toggledTheme = state.isHighContrast
        ? getTheme(state.themeId)
        : getAccessibleTheme(getTheme(state.themeId));

      return {
        ...state,
        currentTheme: toggledTheme,
        isHighContrast: !state.isHighContrast,
        isTransitioning: false,
      };

    case 'SET_TRANSITIONING':
      return {
        ...state,
        isTransitioning: action.payload,
      };

    case 'LOAD_PERSISTED_THEME':
      const { themeId: loadedThemeId, isHighContrast: loadedHighContrast } = action.payload;
      const loadedBaseTheme = getTheme(loadedThemeId);
      const loadedFinalTheme = loadedHighContrast ? getAccessibleTheme(loadedBaseTheme) : loadedBaseTheme;

      return {
        ...state,
        currentTheme: loadedFinalTheme,
        themeId: loadedThemeId,
        isHighContrast: loadedHighContrast,
      };

    default:
      return state;
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Load persisted theme on mount
  useEffect(() => {
    const loadPersistedTheme = async () => {
      try {
        const [storedThemeId, storedHighContrast] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.THEME_ID),
          AsyncStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST),
        ]);

        const themeId = (storedThemeId as ThemeId) || 'dark';
        const isHighContrast = storedHighContrast === 'true';

        dispatch({
          type: 'LOAD_PERSISTED_THEME',
          payload: { themeId, isHighContrast },
        });
      } catch (error) {
        console.warn('Failed to load persisted theme:', error);
        // Fall back to default theme
      }
    };

    loadPersistedTheme();
  }, []);

  // Persist theme changes
  const persistTheme = async (themeId: ThemeId, isHighContrast: boolean) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.THEME_ID, themeId),
        AsyncStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, isHighContrast.toString()),
      ]);
    } catch (error) {
      console.warn('Failed to persist theme:', error);
    }
  };

  const setTheme = async (themeId: ThemeId, isAccessible = false) => {
    dispatch({ type: 'SET_TRANSITIONING', payload: true });

    // Small delay for smooth transition
    setTimeout(() => {
      dispatch({ type: 'SET_THEME', payload: { themeId, isAccessible } });
      persistTheme(themeId, isAccessible);
      // Clear transition state after animation
      setTimeout(() => dispatch({ type: 'SET_TRANSITIONING', payload: false }), 200);
    }, 100);
  };

  const toggleHighContrast = async () => {
    dispatch({ type: 'SET_TRANSITIONING', payload: true });

    setTimeout(() => {
      dispatch({ type: 'TOGGLE_HIGH_CONTRAST' });
      persistTheme(state.themeId, !state.isHighContrast);
      // Clear transition state after animation
      setTimeout(() => dispatch({ type: 'SET_TRANSITIONING', payload: false }), 200);
    }, 100);
  };

  const getThemePreview = (themeId: ThemeId, isAccessible = false): Theme => {
    const baseTheme = getTheme(themeId);
    return isAccessible ? getAccessibleTheme(baseTheme) : baseTheme;
  };

  const contextValue: ThemeContextType = {
    ...state,
    setTheme,
    toggleHighContrast,
    getThemePreview,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;