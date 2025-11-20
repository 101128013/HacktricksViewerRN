# Hacktricks Data Files

This directory contains preprocessed Hacktricks documentation data for the React Native app.

## Files

### `toc.json`
- Table of Contents structure
- Hierarchical navigation tree
- Section and subsection organization
- File paths and titles

### `processed_docs.json`
- Individual markdown files converted to JSON
- Metadata: title, path, content hash, word count, size
- Section breakdown within each document
- Code blocks extraction

### `search_index.json`
- Full-text search index
- 47,514 searchable terms
- Term frequency and scoring
- Document metadata and sections

## Usage

These files are bundled with the React Native app and used for:
- Navigation through documentation sections
- Displaying content
- Full-text search functionality
- Offline browsing capabilities

## Statistics

- **Total Documents**: 258
- **Total Terms Indexed**: 47,514
- **Data Size**: ~50MB (compressed for app bundle)

## Generation

Generated from Hacktricks mdBook source using Python scripts:
- `parse_summary.py` - Extracts TOC structure
- `convert_md.py` - Processes markdown files
- `create_search_index.py` - Creates search index