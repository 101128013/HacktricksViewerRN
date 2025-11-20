const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Add support for additional asset types
    assetExts: ['json', 'md'],

    // Include data directory for bundled content
    extraNodeModules: {
      'hacktricks-data': path.resolve(__dirname, 'data'),
    },
  },

  transformer: {
    // Enable inline requires for assets
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),

    // Asset configuration for bundling
    assetPlugins: ['react-native-asset-plugin'],
  },

  watchFolders: [
    // Watch the data directory for changes
    path.resolve(__dirname, 'data'),
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);