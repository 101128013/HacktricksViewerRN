module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-markdown-display|react-native-syntax-highlighter|react-syntax-highlighter)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
