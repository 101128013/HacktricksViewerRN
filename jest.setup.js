// Jest setup file - keep it minimal to avoid breaking the re-exported react-native module
// 1) Mock internal utilities (useColorScheme)
// 2) Mock Linking internal path (so callers importing from react-native use mocked values)
// 3) Provide a SettingsManager stub on NativeModules

try {
  // We try to import NativeModules; if react-native initializers throw in this environment,
  // we silently catch and provide a global stub later.
  const { NativeModules } = require('react-native');
  if (!NativeModules.SettingsManager) {
    NativeModules.SettingsManager = {
      settings: { AppleLocale: 'en_US', AppleLanguages: ['en'] },
      getConstants: () => ({ settings: { AppleLocale: 'en_US', AppleLanguages: ['en'] } }),
    };
  }
} catch (e) {
  // Ignore; in some jest environments the react-native module may attempt to access native APIs
}

// Mock useColorScheme directly to return 'light'. Return it as a function (not an object with default)
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => jest.fn(() => 'light'));

// Mock Linking implementation at its internal path for consistent behavior
jest.mock('react-native/Libraries/Linking/Linking', () => {
  const mockLinking = {
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    openURL: jest.fn(() => Promise.resolve(true)),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    sendIntent: jest.fn(),
    getSettings: jest.fn(),
  };
  return mockLinking;
});

// Ensure the Settings native manager is available for modules that require it during initialization
jest.mock('react-native/Libraries/Settings/NativeSettingsManager', () => ({
  getConstants: () => ({ settings: { AppleLocale: 'en_US', AppleLanguages: ['en'] } }),
  setValues: jest.fn(),
}));

// Also provide a light default theme for useColorScheme that may be pulled via direct react-native import
// When consumers import useColorScheme from 'react-native', the value will come from RN's module re-exports
// which in runtime will pick up the above internal module mock.

// Optional: Mock AsyncStorage if desired elsewhere; we keep it minimal here.
// Jest setup file

// Provide a default AsyncStorage mock implementation for tests
jest.mock('@react-native-async-storage/async-storage', () => {
  let storage = {};
  return {
    __esModule: true,
    default: {
      setItem: jest.fn(async (key, value) => {
        storage[key] = value;
        return null;
      }),
      getItem: jest.fn(async (key) => (Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null)),
      removeItem: jest.fn(async (key) => { delete storage[key]; return null; }),
      clear: jest.fn(async () => { storage = {}; return null; }),
      getAllKeys: jest.fn(async () => Object.keys(storage)),
      multiGet: jest.fn(async (keys) => keys.map(k => [k, storage[k] ?? null])),
      multiSet: jest.fn(async (pairs) => { pairs.forEach(([k, v]) => { storage[k] = v; }); return null; }),
      multiRemove: jest.fn(async (keys) => { keys.forEach(k => delete storage[k]); return null; }),
    },
  };
});

// Mock useColorScheme (file mock is safer for direct imports)
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => jest.fn(() => 'light'));

// Mock react-native module
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Ensure we have a real Linking object to copy from
  const Linking = RN.Linking || {};
  const newLinking = {
    ...Linking,
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    openURL: jest.fn(() => Promise.resolve(true)),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    sendIntent: jest.fn(),
    getSettings: jest.fn(),
  };

  // NativeModules fallback
  // Ensure SettingsManager exists directly on RN.NativeModules before any spread requires other modules
  if (!RN.NativeModules || !RN.NativeModules.SettingsManager) {
    RN.NativeModules = {
      ...(RN.NativeModules || {}),
      SettingsManager: {
        settings: { AppleLocale: 'en_US', AppleLanguages: ['en'] },
        getConstants: () => ({ settings: { AppleLocale: 'en_US', AppleLanguages: ['en'] } }),
      },
    };
  }

  const newNativeModules = {
    ...(RN.NativeModules || {}),
    NativeLinkingManager: {
      ...(RN.NativeModules?.NativeLinkingManager || {}),
      getInitialURL: jest.fn(() => Promise.resolve(null)),
      openURL: jest.fn(() => Promise.resolve(true)),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
    }
  };

  // Provide a mocked useColorScheme function (imported from react-native)
  const newUseColorScheme = jest.fn(() => 'light');

  // Ensure SettingsManager exists
  const moduleExports = {
    ...RN,
    Linking: newLinking,
    NativeModules: newNativeModules,
    useColorScheme: newUseColorScheme,
  };

  if (!moduleExports.NativeModules.SettingsManager) {
    moduleExports.NativeModules.SettingsManager = {
      settings: {AppleLocale: 'en_US', AppleLanguages: ['en']},
      getConstants: () => ({ settings: {AppleLocale: 'en_US', AppleLanguages: ['en']} }),
    };
  }

  return moduleExports;
});

