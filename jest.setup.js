// Jest setup file

// Mock useColorScheme (file mock is safer for direct imports)
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: jest.fn(() => 'light'),
}));

// Mock react-native module
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Mock Linking
  const mockLinking = {
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    openURL: jest.fn(() => Promise.resolve(true)),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
    sendIntent: jest.fn(),
    getSettings: jest.fn(),
  };

  // Mock NativeModules
  const NativeModules = RN.NativeModules || {};
  if (!NativeModules.SettingsManager) {
    NativeModules.SettingsManager = {
      settings: {AppleLocale: 'en_US', AppleLanguages: ['en']},
      getConstants: () => ({
        settings: {AppleLocale: 'en_US', AppleLanguages: ['en']},
      }),
    };
  }

  // Return a proxy or object that overrides Linking and NativeModules
  // We use Object.create(RN) to inherit all other exports
  // But RN exports are getters on module.exports.
  // So we need to be careful.
  
  // Since RN is an object with getters, we can't just use Object.create(RN) if RN is the module.exports object.
  // But we can return a new object that has the overrides and falls back to RN.
  
  return new Proxy(RN, {
    get: (target, prop) => {
      if (prop === 'Linking') {
        return mockLinking;
      }
      if (prop === 'NativeModules') {
        return NativeModules;
      }
      return target[prop];
    },
  });
});

