const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/HacktricksViewerRN/',
  },
  resolve: {
    extensions: ['.web.js', '.web.tsx', '.web.ts', '.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-markdown-display': path.resolve(__dirname, 'src/components/web-markdown-fallback.js'),
      'react-native-syntax-highlighter': path.resolve(__dirname, 'src/components/web-syntax-fallback.js'),
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/components/web-async-storage-fallback.js'),
    },
    mainFields: ['browser', 'module', 'main'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(react-native-.*|@react-native.*)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['last 2 versions', 'not dead', '> 0.2%']
                }
              }],
              ['@babel/preset-react', {
                runtime: 'automatic'
              }],
              '@babel/preset-typescript',
            ],
            plugins: [
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              ['@babel/plugin-transform-private-methods', { loose: true }],
              ['@babel/plugin-transform-private-property-in-object', { loose: true }]
            ],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource',
      },
      {
        test: /\.json$/,
        type: 'json',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './web/index.html',
      inject: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'data', to: 'data' },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'web-build'),
    },
    compress: true,
    port: 3000,
    historyApiFallback: true,
  },
  mode: 'production',
  performance: {
    maxAssetSize: 10000000,
    maxEntrypointSize: 10000000,
  },
};
