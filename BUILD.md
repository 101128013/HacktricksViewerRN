# Build Instructions

This document provides comprehensive instructions for building and deploying the HacktricksViewerRN application.

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Visual Studio 2022** (for Windows builds)
   - Required workloads:
     - Desktop development with C++
     - Universal Windows Platform development
   - Download from: https://visualstudio.microsoft.com/

4. **Windows SDK** (v10.0.19041.0 or later)
   - Included with Visual Studio installer
   - Can be installed separately if needed

5. **Git**
   - For version control and tracking
   - Download from: https://git-scm.com/

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/101128013/HacktricksViewerRN.git
cd HacktricksViewerRN
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required Node.js packages and dependencies.

### 3. Prepare Data Files

The application requires documentation data files to be present:

```bash
npm run bundle-data
```

This command:
- Generates table of contents (toc.json)
- Creates processed documents index (processed_docs.json)
- Builds search index (search_index.json)

### 4. Generate Version Information

```bash
npm run update-version
```

This command:
- Updates version numbers across all project files
- Generates version.json with build metadata
- Updates package.json, app.json, and Windows manifest files

## Build Process

### Development Build

For quick testing and development:

```bash
# Start Metro bundler
npm start

# In a separate terminal, run the Windows app
npm run windows
```

### Production Build

For a production-ready build:

#### Step 1: Prepare for Build

```bash
npm run prebuild
```

This runs both `update-version` and `bundle-data` scripts automatically.

#### Step 2: Create Bundle Directory

```bash
npm run prepare-bundle
```

Creates the required bundle directory structure.

#### Step 3: Build Metro Bundle

```bash
npm run bundle
```

This creates:
- `windows/HacktricksViewerRN/Bundle/index.windows.bundle` - Main JavaScript bundle
- `windows/HacktricksViewerRN/Bundle/index.windows.bundle.map` - Source map for debugging
- `windows/HacktricksViewerRN/Bundle/assets` - Asset files

#### Step 4: Build Windows Application (PowerShell)

For Windows builds, use the provided PowerShell script:

```powershell
# Release build (recommended)
.\scripts\build-windows.ps1 -Configuration Release -Platform x64

# Debug build (for development)
.\scripts\build-windows.ps1 -Configuration Debug -Platform x64

# Clean build
.\scripts\build-windows.ps1 -Configuration Release -Platform x64 -Clean

# Bundle only (skip Visual Studio build)
.\scripts\build-windows.ps1 -BundleOnly
```

**Build Options:**
- `-Configuration`: Debug or Release (default: Release)
- `-Platform`: x64, x86, or ARM64 (default: x64)
- `-Clean`: Remove previous build artifacts before building
- `-BundleOnly`: Only create the Metro bundle, skip MSBuild
- `-OutputPath`: Custom output directory for build artifacts

#### Step 5: Validate Build

After building, validate that all required artifacts are present:

```bash
npm run validate-build
```

This checks for:
- Metro bundle and source map
- Assets directory
- Data files (TOC, processed docs, search index)
- Version information
- Package manifest

## Build Artifacts

After a successful build, you'll find the following artifacts:

### Metro Bundle
- Location: `windows/HacktricksViewerRN/Bundle/`
- Contents:
  - `index.windows.bundle` - Main JavaScript bundle
  - `index.windows.bundle.map` - Source map
  - `assets/` - Application assets

### Windows Application Package
- Location: `windows/HacktricksViewerRN/AppPackages/`
- Contents:
  - `.appx` or `.msix` installer package
  - Dependencies
  - Installation scripts

### Build Reports
- `build-validation-report.json` - Validation results
- `build-info.json` - Build metadata

## Deployment

### Installing Locally

To install the built application on your local machine:

```powershell
# Navigate to the AppPackages directory
cd windows\HacktricksViewerRN\AppPackages\HacktricksViewerRN_Release_x64_Test

# Run the PowerShell installer
.\Install.ps1
```

### Distribution

For distribution to end users:

1. **Microsoft Store** (Recommended)
   - Package the .msix file
   - Submit through Microsoft Partner Center
   - Automatic updates for users

2. **Sideloading**
   - Users need Developer Mode enabled
   - Install certificate first
   - Run .appx or .msix installer
   - Or use provided Install.ps1 script

3. **Enterprise Distribution**
   - Use Microsoft Intune
   - Or deploy via Group Policy
   - Requires code signing certificate

## Troubleshooting

### Common Issues

#### Build Validation Fails

```bash
npm run validate-build
```

Check the error output and ensure:
- All data files are present in `assets/data/`
- Metro bundle was created successfully
- Version.json exists

#### Metro Bundle Fails

If bundling fails, check:
1. All dependencies are installed: `npm install`
2. No TypeScript errors: `npx tsc --noEmit`
3. Metro cache is clear: `npx react-native start --reset-cache`

#### Visual Studio Build Fails

Common causes:
1. Missing Visual Studio workloads
2. Missing Windows SDK
3. Corrupted obj/bin directories (solution: run with `-Clean` flag)
4. NuGet package restore issues

#### Missing Dependencies

```bash
# Reinstall all dependencies
rm -rf node_modules
rm package-lock.json
npm install
```

### Getting Help

If you encounter issues:
1. Check the build log in `build/windows/build.log`
2. Review validation report: `build-validation-report.json`
3. Check GitHub Issues: https://github.com/101128013/HacktricksViewerRN/issues
4. Run with verbose logging: `npm run windows -- --logging`

## Continuous Integration

For automated builds, use the following sequence:

```bash
# Install dependencies
npm ci

# Run tests
npm test

# Prepare build
npm run prebuild

# Create bundle directory
npm run prepare-bundle

# Build Metro bundle
npm run bundle

# Validate
npm run validate-build
```

For Windows-specific CI:
```powershell
.\scripts\build-windows.ps1 -Configuration Release -Platform x64 -Clean
```

## Environment Variables

Optional environment variables for build customization:

- `NODE_ENV` - Set to 'production' for production builds
- `BUILD_TYPE` - 'release' or 'debug'
- `BUILD_NUMBER` - Override automatic build number

Example:
```bash
export NODE_ENV=production
export BUILD_TYPE=release
npm run prebuild
```

## Additional Scripts

### Linting

```bash
npm run lint
```

### Testing

```bash
npm test
```

### Clean Build Artifacts

```bash
# Remove all build artifacts
rm -rf windows/HacktricksViewerRN/Bundle
rm -rf windows/HacktricksViewerRN/AppPackages
rm -rf windows/x64
rm build-validation-report.json
rm build-info.json
```

## Version Management

Version numbers are automatically managed:
- **Major.Minor.Build** format (e.g., 1.0.3)
- Build number increments with each git commit
- Git hash is embedded for traceability
- Timestamp recorded for each build

To manually update the major/minor version:
1. Edit `scripts/update-version.js`
2. Update the `VERSION_CONFIG` object
3. Run `npm run update-version`

## Next Steps

After successful build:
1. Test the application thoroughly
2. Run validation checks
3. Package for distribution
4. Deploy to target environment

For website deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md) (if available).
