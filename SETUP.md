# Builder Setup and Website Launch Guide

This guide provides step-by-step instructions for setting up the builder environment and preparing the HacktricksViewerRN application for deployment.

## Quick Start

For immediate setup, run these commands:

```bash
# Install dependencies
npm install

# Prepare the build environment
npm run prebuild

# Create bundle directory structure
npm run prepare-bundle

# Validate the setup
npm run validate-build
```

## Detailed Setup Instructions

### 1. Environment Setup

#### Prerequisites Check

Verify you have the required software installed:

```bash
# Check Node.js (should be v18+)
node --version

# Check npm
npm --version

# Check Git
git --version
```

#### Install Dependencies

```bash
npm install
```

This installs all required packages including:
- React Native framework
- Build tools and compilers
- Testing frameworks
- Development utilities

### 2. Data Preparation

The application requires documentation data files:

```bash
npm run bundle-data
```

This generates:
- `assets/data/toc.json` - Table of contents
- `assets/data/processed_docs.json` - Document index
- `assets/data/search_index.json` - Search index

**Note:** If you have a `src` directory with documentation (from Hacktricks repository), the script will automatically index it. Otherwise, it creates empty placeholder files.

### 3. Version Management

Generate version information:

```bash
npm run update-version
```

This creates/updates:
- `assets/data/version.json` - Version metadata for the app
- `build-info.json` - Build metadata
- `package.json` - Updated version number
- `app.json` - Updated version number
- `windows/HacktricksViewerRN/Package.appxmanifest` - Windows package manifest

### 4. Bundle Directory Setup

Create the required directory structure for Metro bundling:

```bash
npm run prepare-bundle
```

This ensures the `windows/HacktricksViewerRN/Bundle` directory exists.

### 5. Build Validation

Verify everything is set up correctly:

```bash
npm run validate-build
```

Expected output should show:
- ✓ TOC Data
- ✓ Processed Docs Data
- ✓ Search Index Data
- ✓ Version Info
- ✓ Package JSON
- ✓ Windows Manifest

**Note:** Metro Bundle, Source Map, and Assets Directory checks will fail until you run the actual build (these are generated during build time).

## Building for Production

### Metro Bundle Creation

To create the JavaScript bundle for the application:

```bash
npm run bundle
```

This generates:
- `windows/HacktricksViewerRN/Bundle/index.windows.bundle`
- `windows/HacktricksViewerRN/Bundle/index.windows.bundle.map`
- `windows/HacktricksViewerRN/Bundle/assets/`

### Windows Application Build

For building the Windows application, use PowerShell:

```powershell
# Navigate to scripts directory
cd scripts

# Run the build script
.\build-windows.ps1 -Configuration Release -Platform x64
```

See [BUILD.md](./BUILD.md) for detailed build instructions.

## Website Launch Preparation

### For GitHub Pages or Static Hosting

If you plan to deploy as a static website (React Native Web conversion required):

1. **Add React Native Web support** (future enhancement)
   ```bash
   npm install react-native-web react-dom
   ```

2. **Configure webpack/metro for web builds**

3. **Build for web**
   ```bash
   npm run build:web
   ```

### For Desktop Application Distribution

The current setup builds a Windows desktop application. To distribute:

#### Option 1: Microsoft Store (Recommended)

1. Package the `.msix` file
2. Create a Microsoft Partner Center account
3. Submit your app for certification
4. Publish to the Microsoft Store

Benefits:
- Automatic updates
- Built-in distribution
- Trusted installation
- Easy user discovery

#### Option 2: Direct Distribution

1. Build the application as shown above
2. Sign the package with a code signing certificate
3. Distribute the `.appx` or `.msix` installer
4. Users install via sideloading

#### Option 3: Web-based Distribution

1. Set up a web server
2. Host the installer package
3. Provide download link on your website
4. Include installation instructions

## Continuous Integration Setup

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linter
      run: npm run lint
      
    - name: Run tests
      run: npm test
      
    - name: Prepare build
      run: npm run prebuild
      
    - name: Validate setup
      run: npm run validate-build
      
    - name: Create bundle
      run: npm run bundle
      
    - name: Build Windows app
      run: |
        cd scripts
        .\build-windows.ps1 -Configuration Release -Platform x64
```

## Troubleshooting

### Common Setup Issues

#### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### Issue: Bundle-data script reports no documents

**Solution:** This is expected if you don't have the Hacktricks documentation source. The app will work with placeholder data. To add real documentation:

1. Clone the Hacktricks repository adjacent to this project
2. Ensure the path `../src` contains the documentation
3. Run `npm run bundle-data` again

#### Issue: Version update fails

**Solution:** Ensure you have:
- Git initialized in the repository
- Proper permissions to write files
- Valid `package.json` and `app.json` files

#### Issue: Validation fails

**Solution:** Run each preparation step individually:
```bash
npm run update-version
npm run bundle-data
npm run prepare-bundle
npm run validate-build
```

Check the `build-validation-report.json` file for detailed error information.

## Development Workflow

### Daily Development

```bash
# Start Metro bundler
npm start

# In another terminal, run the app
npm run windows
```

### Before Committing

```bash
# Run linter
npm run lint

# Run tests
npm test

# Validate build setup
npm run validate-build
```

### Before Release

```bash
# Update version
npm run update-version

# Full build preparation
npm run prebuild

# Validate everything
npm run validate-build

# Create production build
npm run bundle
```

## Deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Version updated (`npm run update-version`)
- [ ] Data files bundled (`npm run bundle-data`)
- [ ] Build validated (`npm run validate-build`)
- [ ] Metro bundle created (`npm run bundle`)
- [ ] Windows app built (PowerShell script)
- [ ] Application tested locally
- [ ] Installation package verified
- [ ] Release notes prepared
- [ ] Distribution channel ready

## Additional Resources

- [Build Instructions](./BUILD.md) - Detailed build documentation
- [React Native Documentation](https://reactnative.dev/)
- [Windows Development](https://microsoft.github.io/react-native-windows/)
- [Microsoft Store Publishing](https://docs.microsoft.com/en-us/windows/apps/publish/)

## Support

For issues or questions:
- Check existing GitHub Issues
- Review the troubleshooting section
- Consult the build logs in `build/windows/build.log`
- Review validation report in `build-validation-report.json`

## Next Steps

1. Complete the builder setup using this guide
2. Review [BUILD.md](./BUILD.md) for detailed build instructions
3. Test the application thoroughly
4. Prepare for deployment to your chosen distribution channel
5. Set up CI/CD pipelines for automated builds

## Version History

- **1.0.3** - Initial builder setup documentation
- Added automated build scripts
- Added validation tools
- Added comprehensive documentation
