import { useEffect } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useZoom } from '../contexts/ZoomContext';

interface KeyboardShortcutsOptions {
  enabled?: boolean;
}

export const useKeyboardShortcuts = (options: KeyboardShortcutsOptions = {}) => {
  const { zoomIn, zoomOut, resetZoom } = useZoom();
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled || Platform.OS !== 'windows') {
      return;
    }

    const handleKeyPress = (event: any) => {
      const { key, ctrlKey } = event;

      if (!ctrlKey) return;

      switch (key) {
        case '+':
        case '=': // Some keyboards use = for +
          event.preventDefault();
          zoomIn();
          break;
        case '-':
          event.preventDefault();
          zoomOut();
          break;
        case '0':
          event.preventDefault();
          resetZoom();
          break;
        default:
          return;
      }
    };

    // For React Native Windows, we need to use a different approach
    // This is a placeholder - actual implementation would depend on Windows-specific APIs
    const subscription = Keyboard.addListener('keyboardDidShow', () => {
      // This is where we'd set up Windows-specific keyboard handling
      console.log('Keyboard shortcuts enabled for zoom controls');
    });

    return () => {
      subscription?.remove();
    };
  }, [enabled, zoomIn, zoomOut, resetZoom]);
};

export default useKeyboardShortcuts;