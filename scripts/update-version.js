#!/usr/bin/env node
/* eslint-env node */

/**
 * Update Version Script
 * Automatically updates version numbers across all project files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_DIR = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');

// Version configuration
const VERSION_CONFIG = {
  major: 1,
  minor: 0,
  patch: 0,
  build: 0
};

function getGitCommitCount() {
  try {
    const commitCount = execSync('git rev-list --count HEAD', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
    return parseInt(commitCount) || 0;
  } catch (error) {
    console.warn('Could not get git commit count, using timestamp-based build number');
    return Math.floor(Date.now() / 1000) - 1609459200; // Seconds since 2021-01-01
  }
}

function getGitShortHash() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
  } catch (error) {
    return 'dev';
  }
}

function generateVersion() {
  const commitCount = getGitCommitCount();
  const shortHash = getGitShortHash();

  // Generate version based on commit count or timestamp
  const buildNumber = commitCount || Math.floor(Date.now() / 1000) - 1609459200;

  const version = {
    major: VERSION_CONFIG.major,
    minor: VERSION_CONFIG.minor,
    patch: VERSION_CONFIG.patch,
    build: buildNumber,
    string: `${VERSION_CONFIG.major}.${VERSION_CONFIG.minor}.${VERSION_CONFIG.patch}.${buildNumber}`,
    display: `${VERSION_CONFIG.major}.${VERSION_CONFIG.minor}.${buildNumber}`,
    gitHash: shortHash,
    timestamp: new Date().toISOString()
  };

  return version;
}

function updatePackageJson(version) {
  const packagePath = path.join(PROJECT_ROOT, 'package.json');

  if (!fs.existsSync(packagePath)) {
    console.warn('package.json not found, skipping update');
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  packageJson.version = version.display;

  // Add version metadata
  packageJson.hacktricksVersion = version;

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log(`Updated package.json to version ${version.display}`);
}

function updateAppJson(version) {
  const appJsonPath = path.join(PROJECT_ROOT, 'app.json');

  if (!fs.existsSync(appJsonPath)) {
    console.warn('app.json not found, skipping update');
    return;
  }

  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  appJson.version = version.display;

  // Add version metadata
  appJson.hacktricksVersion = version;

  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  console.log(`Updated app.json to version ${version.display}`);
}

function updateWindowsManifest(version) {
  const manifestPath = path.join(PROJECT_ROOT, 'windows', 'HacktricksViewerRN', 'Package.appxmanifest');

  if (!fs.existsSync(manifestPath)) {
    console.warn('Package.appxmanifest not found, skipping update');
    return;
  }

  let manifestContent = fs.readFileSync(manifestPath, 'utf8');

  // Update version in manifest (format: major.minor.patch.build)
  manifestContent = manifestContent.replace(
    /Version="[^"]*"/,
    `Version="${version.string}"`
  );

  fs.writeFileSync(manifestPath, manifestContent);
  console.log(`Updated Package.appxmanifest to version ${version.string}`);
}

function updateVSProjectFile(version) {
  const projectPath = path.join(PROJECT_ROOT, 'windows', 'HacktricksViewerRN', 'HacktricksViewerRN.vcxproj');

  if (!fs.existsSync(projectPath)) {
    console.warn('VCXProj file not found, skipping update');
    return;
  }

  let projectContent = fs.readFileSync(projectPath, 'utf8');

  // Update version numbers in project file if they exist
  // Note: VCXProj files typically don't store version info directly,
  // but we can add custom properties if needed

  // For now, just log that we would update it
  console.log(`VCXProj file version info handled via manifest`);
}

function createVersionFile(version) {
  const versionPath = path.join(PROJECT_ROOT, 'assets', 'data', 'version.json');

  // Ensure directory exists
  const dir = path.dirname(versionPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const versionInfo = {
    ...version,
    environment: process.env.NODE_ENV || 'development',
    platform: 'windows',
    buildType: process.env.BUILD_TYPE || 'release'
  };

  fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));
  console.log(`Created version file at ${versionPath}`);
}

function updateBuildInfo(version) {
  const buildInfoPath = path.join(PROJECT_ROOT, 'build-info.json');

  const buildInfo = {
    version: version.string,
    displayVersion: version.display,
    gitHash: version.gitHash,
    buildTimestamp: version.timestamp,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };

  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  console.log(`Updated build info at ${buildInfoPath}`);
}

// Main execution
function main() {
  console.log('Generating version information...');

  try {
    const version = generateVersion();

    console.log(`Version: ${version.string}`);
    console.log(`Display: ${version.display}`);
    console.log(`Git Hash: ${version.gitHash}`);
    console.log(`Timestamp: ${version.timestamp}`);

    updatePackageJson(version);
    updateAppJson(version);
    updateWindowsManifest(version);
    updateVSProjectFile(version);
    createVersionFile(version);
    updateBuildInfo(version);

    console.log('Version update completed successfully!');

  } catch (error) {
    console.error('Version update failed:', error.message);
    process.exit(1);
  }
}

// Export functions for testing
module.exports = {
  generateVersion,
  getGitCommitCount,
  getGitShortHash
};

// Run if called directly
if (require.main === module) {
  main();
}