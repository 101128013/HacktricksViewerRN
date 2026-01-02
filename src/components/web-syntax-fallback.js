// Web fallback for react-native-syntax-highlighter
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SyntaxHighlighter = ({ children, language, style, customStyle }) => {
  return (
    <View style={[styles.container, customStyle]}>
      <Text style={[styles.code, style?.hljs]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#282c34',
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
  code: {
    fontFamily: 'monospace, Courier New',
    fontSize: 14,
    color: '#abb2bf',
  },
});

export default SyntaxHighlighter;
