# Quick Reference Card

## 🚀 Getting Started in 5 Minutes

```bash
# 1. Install dependencies
npm install

# 2. Prepare build environment
npm run prebuild

# 3. Validate setup
npm run validate-build

# 4. Start development
npm start
```

## 📖 Documentation Quick Links

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [SETUP.md](SETUP.md) | **Builder setup & launch guide** | ⭐ Start here for setup |
| [BUILD.md](BUILD.md) | Detailed build instructions | When building for production |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment strategies | When ready to launch |
| [README.md](README.md) | Main project documentation | For general information |
| [REPOSITORY_ANALYSIS.md](REPOSITORY_ANALYSIS.md) | Complete status report | For overview & status |

## 🔧 Essential Commands

### Development
```bash
npm start                 # Start Metro bundler
npm run windows          # Run Windows app
npm test                 # Run tests
npm run lint             # Check code quality
```

### Build Preparation
```bash
npm run prebuild         # Update version & bundle data
npm run prepare-bundle   # Create bundle directory
npm run validate-build   # Validate everything
```

### Production Build
```bash
npm run bundle           # Create Metro bundle

# For Windows executable (PowerShell):
.\scripts\build-windows.ps1 -Configuration Release -Platform x64
```

## 📊 Current Status

✅ **Tests**: 23/23 passing (100%)  
✅ **Build Validation**: 6/9 checks passing*  
✅ **Documentation**: Complete  
✅ **Version**: 1.0.3  
✅ **Status**: Ready for builder setup

\* 3 checks require full build (Metro bundle, source map, assets)

## 🎯 Next Steps

1. **Review Documentation** (10 min)
   - Read [SETUP.md](SETUP.md)
   - Understand prerequisites

2. **Setup Environment** (30 min)
   - Install Node.js v18+
   - Install Visual Studio 2022
   - Install Windows SDK

3. **First Build** (30 min)
   - Run `npm install`
   - Run `npm run prebuild`
   - Run `npm run bundle`
   - Build Windows app

4. **Choose Deployment** (Planning)
   - Review [DEPLOYMENT.md](DEPLOYMENT.md)
   - Select distribution method
   - Prepare for launch

## 📁 Key Files & Directories

```
📦 Root
├── 📄 SETUP.md              ← Start here
├── 📄 BUILD.md              ← For building
├── 📄 DEPLOYMENT.md         ← For deployment
├── 📄 REPOSITORY_ANALYSIS.md ← Status overview
├── 📂 scripts/              ← Build automation
│   ├── update-version.js    ← Version management
│   ├── bundle-data.js       ← Data preparation
│   └── build-windows.ps1    ← Windows build
├── 📂 assets/data/          ← Generated data
│   ├── version.json         ← Version info
│   ├── toc.json            ← Table of contents
│   └── search_index.json   ← Search index
└── 📂 windows/              ← Windows platform
    └── HacktricksViewerRN/
        └── Bundle/          ← Metro output
```

## 🆘 Troubleshooting Quick Fixes

### Build Validation Fails
```bash
npm run prebuild
npm run prepare-bundle
npm run validate-build
```

### Tests Fail
```bash
rm -rf node_modules package-lock.json
npm install
npm test
```

### Bundle Creation Fails
```bash
npm start -- --reset-cache
# In new terminal:
npm run bundle
```

## 💡 Pro Tips

1. **Always run `npm run prebuild` before building**
   - Updates version numbers
   - Bundles data files
   - Ensures consistency

2. **Use validation to check readiness**
   ```bash
   npm run validate-build
   ```

3. **Check build logs for errors**
   - Location: `build/windows/build.log`
   - Validation: `build-validation-report.json`

4. **Keep documentation handy**
   - All guides are markdown files in root
   - Easy to read and search

## 📞 Getting Help

1. **Documentation**: Check relevant .md file
2. **Build Issues**: Review [BUILD.md](BUILD.md) troubleshooting
3. **Setup Issues**: See [SETUP.md](SETUP.md) troubleshooting
4. **GitHub Issues**: Open issue if needed

## ✅ Success Checklist

Before proceeding to build:
- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Tests passing (`npm test`)
- [ ] Version updated (`npm run update-version`)
- [ ] Data bundled (`npm run bundle-data`)
- [ ] Validation passing 6/9 (`npm run validate-build`)

Before deploying:
- [ ] Production build created
- [ ] Application tested locally
- [ ] Release notes prepared
- [ ] Deployment method chosen
- [ ] Distribution channel ready

## 🎉 You're Ready!

Follow [SETUP.md](SETUP.md) to begin builder setup and launch preparation.

---

**Version**: 1.0.3  
**Last Updated**: 2026-01-02  
**Status**: ✅ Ready for Builder Setup
