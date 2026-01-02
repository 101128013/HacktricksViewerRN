/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: import explicitly to use the types shipped with jest.
import {it, beforeEach, afterEach, expect, jest} from '@jest/globals';

// Note: test renderer must be required after react-native.
import { Linking } from 'react-native';
import { renderWithProvidersAsync } from '../test-utils/renderWithProviders';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-markdown-display', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return {
    __esModule: true,
    default: ({children}: any) => <Text>{children}</Text>,
  };
});

jest.mock('react-native-syntax-highlighter', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return {
    __esModule: true,
    default: ({children}: any) => <Text>{children}</Text>,
  };
});

jest.mock('react-syntax-highlighter/dist/styles/hljs', () => ({
  atomOneDark: {},
}));

console.log('Test Linking keys:', Object.keys(Linking || {}));

beforeEach(() => {
  // Ensure linking doesn't throw by default
  if (Linking && typeof Linking.getInitialURL === 'function') {
    jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null as any);
  }
  if (Linking && typeof Linking.addEventListener === 'function') {
    jest.spyOn(Linking, 'addEventListener').mockImplementation(() => ({ remove: jest.fn() } as any));
  }
});

afterEach(() => {
  jest.restoreAllMocks();
});

it('renders correctly', async () => {
  const tree = await renderWithProvidersAsync(<App />);
  expect(tree).toBeDefined();
  tree.unmount();
});
