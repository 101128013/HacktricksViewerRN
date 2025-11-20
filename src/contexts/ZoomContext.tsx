import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ZoomState {
  zoomLevel: number;
  isTransitioning: boolean;
}

type ZoomAction =
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_TRANSITIONING'; payload: boolean }
  | { type: 'LOAD_PERSISTED_ZOOM'; payload: number };

interface ZoomContextType extends ZoomState {
  setZoomLevel: (level: number) => Promise<void>;
  zoomIn: () => Promise<void>;
  zoomOut: () => Promise<void>;
  resetZoom: () => Promise<void>;
  getZoomPercentage: () => number;
}

const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
const ZOOM_STEP = 10;
const ZOOM_DEFAULT = 100;

const initialState: ZoomState = {
  zoomLevel: ZOOM_DEFAULT,
  isTransitioning: false,
};

const STORAGE_KEYS = {
  ZOOM_LEVEL: '@hacktricks_zoom_level',
} as const;

function zoomReducer(state: ZoomState, action: ZoomAction): ZoomState {
  switch (action.type) {
    case 'SET_ZOOM':
      const clampedLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, action.payload));
      return {
        ...state,
        zoomLevel: clampedLevel,
        isTransitioning: false,
      };

    case 'SET_TRANSITIONING':
      return {
        ...state,
        isTransitioning: action.payload,
      };

    case 'LOAD_PERSISTED_ZOOM':
      return {
        ...state,
        zoomLevel: action.payload,
      };

    default:
      return state;
  }
}

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

export const useZoom = (): ZoomContextType => {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
};

interface ZoomProviderProps {
  children: ReactNode;
}

export const ZoomProvider: React.FC<ZoomProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(zoomReducer, initialState);

  // Load persisted zoom level on mount
  useEffect(() => {
    const loadPersistedZoom = async () => {
      try {
        const storedZoomLevel = await AsyncStorage.getItem(STORAGE_KEYS.ZOOM_LEVEL);
        const zoomLevel = storedZoomLevel ? parseInt(storedZoomLevel, 10) : ZOOM_DEFAULT;

        dispatch({
          type: 'LOAD_PERSISTED_ZOOM',
          payload: zoomLevel,
        });
      } catch (error) {
        console.warn('Failed to load persisted zoom level:', error);
        // Fall back to default zoom
      }
    };

    loadPersistedZoom();
  }, []);

  // Persist zoom level changes
  const persistZoomLevel = async (zoomLevel: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ZOOM_LEVEL, zoomLevel.toString());
    } catch (error) {
      console.warn('Failed to persist zoom level:', error);
    }
  };

  const setZoomLevel = async (level: number) => {
    dispatch({ type: 'SET_TRANSITIONING', payload: true });

    // Small delay for smooth transition
    setTimeout(() => {
      dispatch({ type: 'SET_ZOOM', payload: level });
      persistZoomLevel(level);
      // Clear transition state after animation
      setTimeout(() => dispatch({ type: 'SET_TRANSITIONING', payload: false }), 200);
    }, 50);
  };

  const zoomIn = async () => {
    const newLevel = Math.min(ZOOM_MAX, state.zoomLevel + ZOOM_STEP);
    await setZoomLevel(newLevel);
  };

  const zoomOut = async () => {
    const newLevel = Math.max(ZOOM_MIN, state.zoomLevel - ZOOM_STEP);
    await setZoomLevel(newLevel);
  };

  const resetZoom = async () => {
    await setZoomLevel(ZOOM_DEFAULT);
  };

  const getZoomPercentage = () => {
    return state.zoomLevel;
  };

  const contextValue: ZoomContextType = {
    ...state,
    setZoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    getZoomPercentage,
  };

  return (
    <ZoomContext.Provider value={contextValue}>
      {children}
    </ZoomContext.Provider>
  );
};

export default ZoomProvider;