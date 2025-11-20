/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: import explicitly to use the types shipped with jest.
import {it} from '@jest/globals';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import { Linking } from 'react-native';

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

it('renders correctly', () => {
  renderer.create(<App />);
});
