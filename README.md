# HacktricksViewerRN

This is a **React Native Windows** application for viewing Hacktricks documentation offline, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

## 🚀 Quick Start

### For Builders and Deployers

If you're looking to build and deploy this application, start here:

1. **[SETUP.md](./SETUP.md)** - Complete builder setup and launch guide
2. **[BUILD.md](./BUILD.md)** - Detailed build instructions
3. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment options and guides

### Quick Commands

```bash
# Install dependencies
npm install

# Prepare for build
npm run prebuild

# Run validation
npm run validate-build

# Start development
npm start
npm run windows
```

## 📋 Prerequisites

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

**Required:**
- Node.js v18 or higher
- npm
- Visual Studio 2022 (for Windows builds)
- Windows SDK
- Git

See [SETUP.md](./SETUP.md) for detailed prerequisites.

## 🛠️ Development

### Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

### Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

#### For Windows

```bash
# using npm
npm run windows

# OR using Yarn
yarn windows
```

#### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

#### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

### Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## 🧪 Testing

```bash
# Run tests
npm test

# Run linter
npm run lint
```

## 📦 Building for Production

For production builds, see the comprehensive guides:

- **[BUILD.md](./BUILD.md)** - Complete build instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment strategies

Quick build command:
```bash
npm run prebuild
npm run bundle
```

For Windows executable:
```powershell
.\scripts\build-windows.ps1 -Configuration Release -Platform x64
```

## 📚 Project Structure

```
HacktricksViewerRN/
├── assets/           # App assets and data files
├── src/              # Source code
│   ├── components/   # React components
│   ├── contexts/     # React contexts
│   ├── hooks/        # Custom hooks
│   ├── utils/        # Utility functions
│   └── themes/       # Theme configurations
├── scripts/          # Build and utility scripts
├── windows/          # Windows platform specific code
├── BUILD.md          # Build documentation
├── SETUP.md          # Setup guide
└── DEPLOYMENT.md     # Deployment guide
```

## 🎯 Features

- **Offline Access**: All documentation available locally
- **Search**: Fast document search functionality
- **Zoom Controls**: Adjustable text size
- **Theme Support**: Multiple color themes
- **Windows Native**: Native Windows application

## 🔧 Available Scripts

- `npm start` - Start Metro bundler
- `npm run windows` - Run Windows app
- `npm run android` - Run Android app
- `npm run ios` - Run iOS app
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run prebuild` - Prepare for build (version + data)
- `npm run update-version` - Update version information
- `npm run bundle-data` - Bundle documentation data
- `npm run validate-build` - Validate build artifacts
- `npm run bundle` - Create Metro bundle
- `npm run prepare-bundle` - Create bundle directory

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Builder setup and website launch guide
- **[BUILD.md](./BUILD.md)** - Comprehensive build instructions
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment options and strategies
- **[README_Navigation.md](./README_Navigation.md)** - Navigation system documentation

## 🐛 Troubleshooting

If you can't get this to work:
1. Check [SETUP.md](./SETUP.md) troubleshooting section
2. Review [BUILD.md](./BUILD.md) for build-specific issues
3. See the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page
4. Check [GitHub Issues](https://github.com/101128013/HacktricksViewerRN/issues)

## 📚 Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
- [React Native Windows](https://microsoft.github.io/react-native-windows/) - Windows-specific documentation.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the terms specified in the package.json file.

## 🎉 Congratulations!

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to build for production, check out [BUILD.md](./BUILD.md)
- If you want to deploy, see [DEPLOYMENT.md](./DEPLOYMENT.md)
- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

---

**Version**: 1.0.3  
**Platform**: Windows, Android, iOS  
**Built with**: React Native 0.75.4

