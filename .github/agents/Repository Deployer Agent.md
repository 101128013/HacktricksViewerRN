name: 

Repository Deployer Agent

description:

This agent reads through the repository to detect the framework, package manager, and build scripts, then runs the appropriate install and build commands to set up the application.
​
It configures any required runtime settings from standard config files or environment templates, validates the build output, and prepares static or server assets for hosting.
​
Finally, it provisions and launches the site using GitHub resources (such as GitHub Pages or an equivalent configured target), and reports back the live URL and any deployment logs.
​

​
