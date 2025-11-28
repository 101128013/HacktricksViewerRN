const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
const defaultAssetExts = defaultConfig.resolver.assetExts || [];

const config = {
  resolver: {
    // Add support for additional asset types while preserving defaults
    assetExts: [...defaultAssetExts, 'md'],

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
    // Only include optional asset plugins if they are installed. The
    // 'react-native-asset-plugin' reference is optional for some
    // environments — avoid throwing when it's not present.
    assetPlugins: (() => {
      try {
        // If the module resolves, include it; otherwise fallback to empty
        require.resolve('react-native-asset-plugin');
        return ['react-native-asset-plugin'];
      } catch (e) {
        return [];
      }
    })(),
  },

  watchFolders: [
    // Watch the data directory for changes
    path.resolve(__dirname, 'data'),
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);