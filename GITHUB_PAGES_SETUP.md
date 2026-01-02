# GitHub Pages Setup Instructions

This guide will help you enable GitHub Pages for this repository to deploy the HacktricksViewerRN as a functioning website.

## 📋 Prerequisites

- Repository must be public (or you need a GitHub Pro/Team/Enterprise account for private repos)
- You must have admin access to the repository

## 🔧 Setup Steps

### 1. Enable GitHub Pages

1. **Navigate to Repository Settings**
   - Go to your repository: https://github.com/101128013/HacktricksViewerRN
   - Click on the "Settings" tab (⚙️ icon)

2. **Access Pages Settings**
   - In the left sidebar, scroll down and click on "Pages"
   - Or directly visit: https://github.com/101128013/HacktricksViewerRN/settings/pages

3. **Configure Build and Deployment**
   - Under "Build and deployment" section:
     - **Source**: Select "GitHub Actions" from the dropdown
     - This enables the workflow-based deployment
   - Click "Save" if prompted

4. **Verify Workflow Permissions**
   - Go to Settings → Actions → General
   - Scroll to "Workflow permissions"
   - Ensure "Read and write permissions" is selected
   - Check "Allow GitHub Actions to create and approve pull requests"
   - Click "Save"

### 2. Trigger Deployment

The site will automatically deploy when you:
- Push to the `main` or `master` branch
- Manually trigger the workflow

#### Manual Deployment (Optional)

1. Go to the "Actions" tab in your repository
2. Select "Deploy to GitHub Pages" workflow from the left sidebar
3. Click "Run workflow" button
4. Select the branch (usually `main`)
5. Click "Run workflow"

### 3. Access Your Website

After the deployment completes (usually 2-5 minutes):

- **Your website URL**: https://101128013.github.io/HacktricksViewerRN/
- You can find this URL in:
  - Repository Settings → Pages
  - The deployment workflow output
  - The "Environments" section of your repository

## 🔍 Monitoring Deployment

### Check Deployment Status

1. **Actions Tab**
   - Go to the "Actions" tab
   - You'll see the deployment workflow running
   - Green checkmark ✅ means successful deployment
   - Red X ❌ means deployment failed

2. **Environments**
   - Go to the main repository page
   - Look for "Environments" in the right sidebar
   - Click on "github-pages" to see deployment history

### Troubleshooting

If deployment fails:

1. **Check Workflow Logs**
   - Go to Actions tab
   - Click on the failed workflow run
   - Expand the job steps to see error messages

2. **Common Issues**
   - ❌ **Pages not enabled**: Follow step 1 above
   - ❌ **Permissions error**: Check workflow permissions in step 1.4
   - ❌ **Build failure**: Check the build logs for npm/webpack errors

3. **Verify Files**
   - Ensure `.github/workflows/deploy.yml` exists
   - Ensure `webpack.config.js` is configured correctly
   - Ensure `package.json` has the `build:web` script

## 📝 Configuration Details

### Workflow File Location
```
.github/workflows/deploy.yml
```

### Build Configuration
- **Node Version**: 18
- **Package Manager**: npm
- **Build Command**: `npm run build:web`
- **Output Directory**: `web-build/`

### Custom Domain (Optional)

To use a custom domain:

1. In Settings → Pages → Custom domain
2. Enter your domain (e.g., `hacktricks.example.com`)
3. Create a CNAME file in `web-build/` with your domain
4. Configure DNS records with your domain provider:
   - Add a CNAME record pointing to `101128013.github.io`

## 🎉 Success!

Once deployed, your application will be live at:

**https://101128013.github.io/HacktricksViewerRN/**

Share this URL with users to access the HacktricksViewer documentation online!

## 🔄 Continuous Deployment

Every time you push changes to the main branch:
1. GitHub Actions automatically triggers
2. Builds the web version
3. Deploys to GitHub Pages
4. Updates the live website

No manual intervention required! 🚀

## 📧 Need Help?

If you encounter issues:
1. Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
2. Review the [GitHub Actions logs](https://github.com/101128013/HacktricksViewerRN/actions)
3. Open an issue in the repository

---

**Last Updated**: 2026-01-02
