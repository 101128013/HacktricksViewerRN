#!/usr/bin/env node
/* eslint-env node */

/**
 * Bundle Data Script
 * Prepares and bundles Hacktricks documentation data files for the React Native app
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SCRIPT_DIR = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');
const HACKTRICKS_SRC = path.resolve(PROJECT_ROOT, '..', 'src');
const HACKTRICKS_DATA = path.resolve(PROJECT_ROOT, 'data');
const ASSETS_DATA_DIR = path.resolve(PROJECT_ROOT, 'assets', 'data');

// Ensure output directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Generate hash for content verification
function generateHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

// Read JSON file safely
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: ${filePath} not found`);
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Write JSON file with formatting
function writeJsonFile(filePath, data) {
  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Written: ${filePath}`);
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    throw error;
  }
}

// Generate table of contents from SUMMARY.md
function generateTocFromSummary() {
  const summaryPath = path.join(HACKTRICKS_SRC, 'SUMMARY.md');

  if (!fs.existsSync(summaryPath)) {
    console.warn('SUMMARY.md not found, creating basic TOC structure');
    return {
      sections: [],
      version: '1.0.0',
      generated: new Date().toISOString()
    };
  }

  try {
    const content = fs.readFileSync(summaryPath, 'utf8');
    const lines = content.split('\n');
    const sections = [];
    let currentSection = null;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('# ')) {
        // Main section header
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          id: trimmed.substring(2).toLowerCase().replace(/[^a-z0-9]/g, '-'),
          title: trimmed.substring(2),
          path: null,
          subsections: []
        };
      } else if (trimmed.startsWith('## ') && currentSection) {
        // Subsection
        const subsectionTitle = trimmed.substring(3);
        const subsectionId = subsectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');

        // Try to extract path from markdown link format
        const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
        let subsectionPath = null;

        if (linkMatch) {
          subsectionPath = linkMatch[2];
        } else {
          // Fallback: generate path from title
          subsectionPath = subsectionId + '/README.md';
        }

        currentSection.subsections.push({
          id: subsectionId,
          title: subsectionTitle,
          path: subsectionPath
        });
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return {
      sections,
      version: '1.0.0',
      generated: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error parsing SUMMARY.md:', error.message);
    return {
      sections: [],
      version: '1.0.0',
      generated: new Date().toISOString()
    };
  }
}

// Generate processed docs index
function generateProcessedDocsIndex() {
  const docs = {};

  function scanDirectory(dirPath, relativePath = '') {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath, path.join(relativePath, item));
      } else if (item.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const hash = generateHash(content);
        const relativeFilePath = path.join(relativePath, item);

        docs[relativeFilePath] = {
          hash,
          size: stat.size,
          modified: stat.mtime.toISOString(),
          title: extractTitleFromMarkdown(content)
        };
      }
    }
  }

  function extractTitleFromMarkdown(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('# ')) {
        return line.substring(2).trim();
      }
    }
    return 'Untitled';
  }

  scanDirectory(HACKTRICKS_SRC);

  return {
    documents: docs,
    version: '1.0.0',
    generated: new Date().toISOString(),
    totalDocuments: Object.keys(docs).length
  };
}

// Generate search index
function generateSearchIndex() {
  const index = {};

  function scanAndIndex(dirPath, relativePath = '') {
    if (!fs.existsSync(dirPath)) {
      return;
    }

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanAndIndex(fullPath, path.join(relativePath, item));
      } else if (item.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const relativeFilePath = path.join(relativePath, item);
        const words = extractWords(content);

        for (const word of words) {
          if (!index[word]) {
            index[word] = [];
          }
          index[word].push({
            file: relativeFilePath,
            count: words.filter(w => w === word).length
          });
        }
      }
    }
  }

  function extractWords(content) {
    // Remove markdown formatting and extract words
    const cleanContent = content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]*`/g, '') // Remove inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Keep link text, remove URLs
      .replace(/[#*`~\[\]]/g, '') // Remove markdown symbols
      .replace(/\s+/g, ' ') // Normalize whitespace
      .toLowerCase();

    return cleanContent
      .split(/\s+/)
      .filter(word => word.length > 2) // Filter out short words
      .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
  }

  scanAndIndex(HACKTRICKS_SRC);

  return {
    index,
    version: '1.0.0',
    generated: new Date().toISOString(),
    totalTerms: Object.keys(index).length
  };
}

// Main execution
function main() {
  console.log('Starting data bundling process...');

  try {
    // Ensure output directory exists
    ensureDir(ASSETS_DATA_DIR);

    console.log('Generating table of contents...');
    const tocData = generateTocFromSummary();
    writeJsonFile(path.join(ASSETS_DATA_DIR, 'toc.json'), tocData);

    console.log('Generating processed docs index...');
    const docsData = generateProcessedDocsIndex();
    writeJsonFile(path.join(ASSETS_DATA_DIR, 'processed_docs.json'), docsData);

    console.log('Generating search index...');
    const searchData = generateSearchIndex();
    writeJsonFile(path.join(ASSETS_DATA_DIR, 'search_index.json'), searchData);

    console.log('Data bundling completed successfully!');
    console.log(`- TOC sections: ${tocData.sections.length}`);
    console.log(`- Documents indexed: ${docsData.totalDocuments}`);
    console.log(`- Search terms: ${searchData.totalTerms}`);

  } catch (error) {
    console.error('Data bundling failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateTocFromSummary,
  generateProcessedDocsIndex,
  generateSearchIndex
};