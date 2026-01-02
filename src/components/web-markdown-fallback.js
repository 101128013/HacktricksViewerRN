// Web fallback for react-native-markdown-display
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Markdown = ({ children, style, rules, onLinkPress }) => {
  // Simple markdown-to-React conversion for web
  // This is a basic implementation - for production, consider using react-markdown
  
  const processMarkdown = (text) => {
    if (!text) return null;
    
    // Split by lines and process
    const lines = text.split('\n');
    const elements = [];
    let key = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <Text key={key++} style={style.heading1}>
            {line.substring(2)}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <Text key={key++} style={style.heading2}>
            {line.substring(3)}
          </Text>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <Text key={key++} style={style.heading3}>
            {line.substring(4)}
          </Text>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <Text key={key++} style={style.heading4}>
            {line.substring(5)}
          </Text>
        );
      } else if (line.startsWith('```')) {
        // Code block
        const codeLines = [];
        i++; // Skip the opening ```
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <View key={key++} style={style.code_block}>
            <Text style={style.code_block}>
              {codeLines.join('\n')}
            </Text>
          </View>
        );
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        // List item
        elements.push(
          <Text key={key++} style={style.listItem}>
            • {line.trim().substring(2)}
          </Text>
        );
      } else if (line.trim()) {
        // Regular paragraph
        elements.push(
          <Text key={key++} style={style.paragraph}>
            {line}
          </Text>
        );
      }
    }
    
    return elements;
  };
  
  return (
    <View style={styles.container}>
      {processMarkdown(children)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Markdown;
