#!/usr/bin/env node
/* eslint-env node */

/**
 * Validate Build Script
 * Validates that the build artifacts are correct and complete
 */

const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');

const VALIDATION_CHECKS = [
  {
    name: 'Metro Bundle',
    path: 'windows/HacktricksViewerRN/Bundle/index.windows.bundle',
    type: 'file',
    required: true,
    validate: (content) => content.length > 1000 // Basic size check
  },
  {
    name: 'Metro Source Map',
    path: 'windows/HacktricksViewerRN/Bundle/index.windows.bundle.map',
    type: 'file',
    required: true,
    validate: (content) => content.includes('"version":3')
  },
  {
    name: 'Assets Directory',
    path: 'windows/HacktricksViewerRN/Bundle/assets',
    type: 'directory',
    required: true
  },
  {
    name: 'TOC Data',
    path: 'assets/data/toc.json',
    type: 'file',
    required: true,
    validate: (content) => {
      const data = JSON.parse(content);
      return data.sections && Array.isArray(data.sections);
    }
  },
  {
    name: 'Processed Docs Data',
    path: 'assets/data/processed_docs.json',
    type: 'file',
    required: true,
    validate: (content) => {
      const data = JSON.parse(content);
      return data.documents && typeof data.documents === 'object';
    }
  },
  {
    name: 'Search Index Data',
    path: 'assets/data/search_index.json',
    type: 'file',
    required: true,
    validate: (content) => {
      const data = JSON.parse(content);
      return data.index && typeof data.index === 'object';
    }
  },
  {
    name: 'Version Info',
    path: 'assets/data/version.json',
    type: 'file',
    required: true,
    validate: (content) => {
      const data = JSON.parse(content);
      return data.string && data.gitHash;
    }
  },
  {
    name: 'Package JSON',
    path: 'package.json',
    type: 'file',
    required: true,
    validate: (content) => {
      const data = JSON.parse(content);
      return data.name === 'HacktricksViewerRN' && data.version;
    }
  },
  {
    name: 'Windows Manifest',
    path: 'windows/HacktricksViewerRN/Package.appxmanifest',
    type: 'file',
    required: true,
    validate: (content) => content.includes('HacktricksViewerRN') && content.includes('Version=')
  }
];

function checkPath(item) {
  const fullPath = path.join(PROJECT_ROOT, item.path);

  if (item.type === 'file') {
    if (!fs.existsSync(fullPath)) {
      return { exists: false, error: 'File not found' };
    }

    try {
      const stats = fs.statSync(fullPath);
      if (!stats.isFile()) {
        return { exists: false, error: 'Path exists but is not a file' };
      }

      if (item.validate) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const isValid = item.validate(content);
        if (!isValid) {
          return { exists: true, error: 'File validation failed' };
        }
      }

      return { exists: true, size: stats.size };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  } else if (item.type === 'directory') {
    if (!fs.existsSync(fullPath)) {
      return { exists: false, error: 'Directory not found' };
    }

    try {
      const stats = fs.statSync(fullPath);
      if (!stats.isDirectory()) {
        return { exists: false, error: 'Path exists but is not a directory' };
      }

      return { exists: true };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  return { exists: false, error: 'Unknown item type' };
}

function printResults(results) {
  console.log('\n=== Build Validation Results ===\n');

  let passed = 0;
  let failed = 0;

  results.forEach(result => {
    const status = result.check.exists ? '✓ PASS' : '✗ FAIL';
    const color = result.check.exists ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`${color}${status}${reset} ${result.name}`);

    if (!result.check.exists) {
      console.log(`     Error: ${result.check.error}`);
    } else if (result.check.size) {
      console.log(`     Size: ${(result.check.size / 1024).toFixed(1)} KB`);
    }

    if (result.item.required && !result.check.exists) {
      failed++;
    } else {
      passed++;
    }
  });

  console.log(`\n=== Summary ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${results.length}`);

  if (failed > 0) {
    console.log('\n❌ Build validation failed!');
    return false;
  } else {
    console.log('\n✅ Build validation passed!');
    return true;
  }
}

function generateReport(results) {
  const reportPath = path.join(PROJECT_ROOT, 'build-validation-report.json');

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      passed: results.filter(r => r.check.exists).length,
      failed: results.filter(r => !r.check.exists).length
    },
    details: results.map(r => ({
      name: r.name,
      path: r.item.path,
      status: r.check.exists ? 'pass' : 'fail',
      error: r.check.error || null,
      size: r.check.size || null
    }))
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nValidation report saved to: ${reportPath}`);
}

// Main execution
function main() {
  console.log('Starting build validation...');

  const results = VALIDATION_CHECKS.map(item => ({
    name: item.name,
    item: item,
    check: checkPath(item)
  }));

  const success = printResults(results);
  generateReport(results);

  if (!success) {
    console.log('\nBuild validation failed. Please check the errors above.');
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  VALIDATION_CHECKS,
  checkPath
};

// Run if called directly
if (require.main === module) {
  main();
}