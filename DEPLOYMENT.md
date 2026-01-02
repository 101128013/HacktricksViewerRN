# HacktricksViewerRN - Website Deployment

This document describes the web deployment setup for the HacktricksViewerRN application.

## 🌐 Live Website

The application is deployed and accessible at: **https://101128013.github.io/HacktricksViewerRN/**

## 📋 Deployment Overview

This React Native application has been configured to run as a web application using React Native Web. The deployment is automated through GitHub Actions and hosted on GitHub Pages.

## 🏗️ Technical Setup

### Web Build Configuration

- **Framework**: React Native Web (converts React Native components to web-compatible code)
- **Bundler**: Webpack 5
- **Transpiler**: Babel with React, TypeScript, and ES6+ support
- **Hosting**: GitHub Pages

### Build Process

1. **Install dependencies**: `npm install`
2. **Build for web**: `npm run build:web`
3. **Output directory**: `web-build/`

### Local Development

To run the web version locally:

```bash
npm install
npm run web
```

This starts a development server at `http://localhost:3000`

## 🚀 Deployment Process

### Automatic Deployment

The site is automatically deployed when changes are pushed to the `main` or `master` branch:

1. GitHub Actions workflow triggers on push
2. Dependencies are installed
3. Web build is created
4. Build artifacts are deployed to GitHub Pages

### Manual Deployment

You can also trigger a manual deployment:

1. Go to the repository's "Actions" tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## 📁 Project Structure

```
HacktricksViewerRN/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── src/
│   ├── components/
│   │   ├── web-markdown-fallback.js   # Web-compatible markdown renderer
│   │   └── web-syntax-fallback.js     # Web-compatible syntax highlighter
│   ├── contexts/               # React contexts (Navigation, Zoom)
│   └── utils/                  # Utility functions
├── web/
│   └── index.html              # HTML template for web build
├── data/                       # Documentation data (JSON)
├── index.web.js                # Web entry point
├── webpack.config.js           # Webpack configuration
└── package.json                # Dependencies and scripts
```

## ⚙️ Configuration Files

### webpack.config.js
- Configures bundling for web
- Sets up aliases for React Native Web compatibility
- Handles TypeScript and JSX transpilation
- Copies static assets (data files)

### .github/workflows/deploy.yml
- Defines CI/CD pipeline
- Builds and deploys to GitHub Pages
- Runs on Node.js 18

## 🔧 GitHub Pages Setup

To enable GitHub Pages for your repository:

1. Go to repository Settings
2. Navigate to "Pages" section
3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"
4. Save the settings

The deployment workflow will automatically publish to GitHub Pages.

## 📦 Build Artifacts

The `web-build/` directory contains:
- `index.html` - Main HTML file
- `bundle.[hash].js` - Compiled JavaScript bundle
- `data/` - Documentation data files (processed_docs.json, toc.json, search_index.json)

## 🛠️ Troubleshooting

### Build Failures

If the build fails:
1. Check Node.js version (requires Node 18+)
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check GitHub Actions logs for specific errors

### Deployment Issues

If deployment fails:
1. Verify GitHub Pages is enabled in repository settings
2. Check that the workflow has necessary permissions
3. Ensure the `web-build` directory is being created correctly

## 🔄 Updates

To update the deployed site:
1. Make changes to the code
2. Commit and push to the main branch
3. GitHub Actions will automatically rebuild and deploy

## 📝 Notes

- The web version uses fallback components for React Native-specific packages
- Large data files (21.9 MB search index) may affect initial load time
- The app is optimized for production with code minification and bundling

## 📧 Support

For issues or questions about the web deployment, please open an issue in the GitHub repository.
