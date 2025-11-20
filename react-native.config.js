module.exports = {
  project: {
    windows: {
      sourceDir: 'windows',
      solutionFile: 'HacktricksViewerRN.sln',
      project: {
        projectFile: 'HacktricksViewerRN\\HacktricksViewerRN.vcxproj',
        directDependency: true,
      },
    },
  },

  dependencies: {
    // Add any native dependencies here
  },

  commands: [
    // Custom commands can be added here
  ],

  assets: [
    './assets/fonts',
    './assets/images',
    './assets/data', // Include data directory for bundling
  ],
};