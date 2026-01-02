# Deployment Guide

This guide covers deployment options for the HacktricksViewerRN application.

## Overview

HacktricksViewerRN is a React Native Windows application that can be deployed through multiple channels:

1. **Microsoft Store** - Recommended for public distribution
2. **Sideloading** - For enterprise or direct distribution
3. **Enterprise Deployment** - Using Microsoft Intune or Group Policy
4. **Web Distribution** - Hosting installer for download

## Prerequisites

Before deploying, ensure:
- [ ] Application is built successfully (see [BUILD.md](./BUILD.md))
- [ ] All tests pass (`npm test`)
- [ ] Build validation passes (`npm run validate-build`)
- [ ] Application has been tested locally
- [ ] Version number is correct
- [ ] Release notes are prepared

## Deployment Options

### Option 1: Microsoft Store (Recommended)

#### Advantages
- Automatic updates for users
- Built-in distribution and discovery
- Trusted installation source
- User reviews and ratings
- Microsoft certification

#### Requirements
- Microsoft Partner Center account
- Valid code signing certificate
- Age rating assessment
- Privacy policy URL
- Store listing assets (screenshots, descriptions, icons)

#### Steps

1. **Prepare Store Assets**
   - App icon (various sizes)
   - Screenshots (minimum 1, recommended 4-5)
   - App description
   - Privacy policy URL
   - Age rating information

2. **Create App Package for Store**

   ```powershell
   # Build release package
   .\scripts\build-windows.ps1 -Configuration Release -Platform x64

   # Package will be in:
   # windows/HacktricksViewerRN/AppPackages/
   ```

3. **Submit to Microsoft Partner Center**
   - Log in to [Microsoft Partner Center](https://partner.microsoft.com/dashboard)
   - Create new app submission
   - Upload .msix package
   - Fill in store listing details
   - Submit for certification

4. **Wait for Certification**
   - Typically takes 1-3 business days
   - Address any feedback from Microsoft
   - Once approved, app goes live

#### Pricing Options
- Free (recommended for documentation viewer)
- Paid (one-time purchase)
- Free with in-app purchases

### Option 2: Sideloading

For direct distribution to users outside the Microsoft Store.

#### Requirements
- Users must enable Developer Mode or have sideloading enabled
- Application must be signed with a trusted certificate
- Certificate must be installed on user machines

#### Steps

1. **Build Release Package**

   ```powershell
   .\scripts\build-windows.ps1 -Configuration Release -Platform x64
   ```

2. **Sign the Package**

   If not already signed, sign with your certificate:

   ```powershell
   # Using Windows SDK signtool
   $signtool = "${env:ProgramFiles(x86)}\Windows Kits\10\bin\x64\signtool.exe"
   
   & $signtool sign /fd SHA256 /a /f "YourCertificate.pfx" /p "password" `
     "windows\HacktricksViewerRN\AppPackages\HacktricksViewerRN_1.0.3.0_x64.msix"
   ```

3. **Create Installation Package**

   Package contents should include:
   - `.msix` or `.appx` file
   - Certificate file (`.cer`)
   - Installation instructions
   - `Install.ps1` script (auto-generated)

4. **Distribute Package**

   Options:
   - Email or file sharing
   - Web download
   - USB drive
   - Network share

5. **User Installation**

   Users must:
   
   a. Install the certificate:
   ```powershell
   # Right-click certificate -> Install Certificate
   # Or use certutil
   certutil -addstore TrustedPeople YourCertificate.cer
   ```
   
   b. Enable Developer Mode or Sideloading:
   - Settings → Update & Security → For Developers
   - Select "Sideload apps" or "Developer mode"
   
   c. Install the app:
   ```powershell
   # Double-click .msix file
   # Or run Install.ps1 script
   .\Install.ps1
   ```

### Option 3: Enterprise Deployment

For organizations deploying to multiple machines.

#### Using Microsoft Intune

1. **Package the App**
   - Build and sign as described above
   - Ensure certificate is trusted by your organization

2. **Upload to Intune**
   - Log in to Microsoft Endpoint Manager
   - Navigate to Apps → Windows apps
   - Add app → Windows app (Win32)
   - Upload the .msix file

3. **Configure Deployment**
   - Set required/available
   - Assign to groups
   - Configure installation requirements

4. **Deploy**
   - Intune automatically deploys to assigned devices
   - Monitor deployment status in the portal

#### Using Group Policy

1. **Create Distribution Point**
   - Set up network share: `\\server\share\HacktricksViewer`
   - Copy installation package to share

2. **Create GPO**
   - Open Group Policy Management
   - Create new GPO or edit existing
   - Navigate to: Computer Configuration → Software Settings → Software Installation

3. **Add Package**
   - Right-click → New → Package
   - Browse to .msi file (convert .msix to .msi if needed)
   - Select deployment method (Assigned/Published)

4. **Apply GPO**
   - Link GPO to appropriate OU
   - Force update: `gpupdate /force`

#### Using SCCM/Configuration Manager

1. **Create Application**
   - In Configuration Manager console
   - Software Library → Application Management → Applications
   - Create Application wizard

2. **Configure Deployment**
   - Specify deployment type (Windows App Package)
   - Add .msix file
   - Configure detection method

3. **Distribute Content**
   - Distribute to distribution points
   - Create deployment
   - Assign to collections

### Option 4: Web Distribution

Host the installer on a website for users to download.

#### Setup Web Server

1. **Build Package**
   ```powershell
   .\scripts\build-windows.ps1 -Configuration Release -Platform x64
   ```

2. **Organize Files**
   ```
   downloads/
   ├── HacktricksViewerRN-Setup.msix
   ├── HacktricksViewerRN-Certificate.cer
   ├── README.txt (installation instructions)
   └── checksums.txt (SHA256 hashes)
   ```

3. **Generate Checksums**
   ```powershell
   Get-FileHash HacktricksViewerRN-Setup.msix -Algorithm SHA256 | 
     Format-List | Out-File checksums.txt
   ```

4. **Create Download Page**

   Example HTML:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <title>Download HacktricksViewerRN</title>
   </head>
   <body>
     <h1>Download HacktricksViewerRN</h1>
     <p>Latest Version: 1.0.3</p>
     
     <h2>Installation Steps</h2>
     <ol>
       <li>Download the installer and certificate</li>
       <li>Install the certificate (see instructions below)</li>
       <li>Enable Developer Mode or Sideloading</li>
       <li>Run the installer</li>
     </ol>
     
     <h2>Downloads</h2>
     <ul>
       <li><a href="HacktricksViewerRN-Setup.msix">Installer (MSIX)</a></li>
       <li><a href="HacktricksViewerRN-Certificate.cer">Certificate</a></li>
       <li><a href="README.txt">Installation Instructions</a></li>
     </ul>
     
     <h2>System Requirements</h2>
     <ul>
       <li>Windows 10 version 1809 or later</li>
       <li>Windows 11 (any version)</li>
       <li>x64 processor</li>
     </ul>
   </body>
   </html>
   ```

5. **Upload to Web Server**
   - FTP, SFTP, or web dashboard
   - Ensure HTTPS for secure downloads
   - Set appropriate MIME types

6. **Promote Download Link**
   - Share URL: `https://yourwebsite.com/downloads/hacktricksviewer`
   - Social media
   - Documentation sites
   - GitHub releases

## Post-Deployment

### Monitoring

- **Microsoft Store**: Use Partner Center analytics
- **Sideloading**: Manual feedback collection
- **Enterprise**: Use deployment management tools (Intune/SCCM)
- **Web**: Web server analytics

### Updates

#### Microsoft Store
- Build new version
- Update version numbers
- Submit new package to Partner Center
- Users get automatic updates

#### Sideloading
- Build new version
- Notify users of update
- Users must manually download and install

#### Enterprise
- Deploy new version through management tools
- Can be automatic or user-triggered

### User Support

Create support resources:
- Installation guide
- Troubleshooting FAQ
- Contact information
- Known issues list

## Security Considerations

### Code Signing

Always sign your packages with a trusted certificate:

```powershell
# Self-signed certificate (for testing only)
New-SelfSignedCertificate -Type CodeSigning -Subject "CN=YourCompany" `
  -KeyUsage DigitalSignature -FriendlyName "HacktricksViewerRN" `
  -CertStoreLocation "Cert:\CurrentUser\My"

# Commercial certificate (for production)
# Purchase from certificate authority (DigiCert, GlobalSign, etc.)
```

### Privacy

Ensure compliance with privacy regulations:
- Create privacy policy
- Disclose data collection (if any)
- Provide opt-out mechanisms
- Follow GDPR/CCPA guidelines

### Updates

Keep application updated:
- Security patches
- Bug fixes
- Feature updates
- Dependency updates

## Rollback Plan

If issues occur after deployment:

1. **Stop Distribution**
   - Remove from store temporarily
   - Disable download links
   - Pause enterprise deployment

2. **Identify Issue**
   - Review error reports
   - Check logs
   - Reproduce problem

3. **Rollback if Necessary**
   - Revert to previous version
   - Notify users
   - Provide downgrade instructions

4. **Fix and Redeploy**
   - Address root cause
   - Test thoroughly
   - Deploy fixed version

## Deployment Checklist

### Pre-Deployment
- [ ] Build completes successfully
- [ ] All tests pass
- [ ] Linting passes
- [ ] Version numbers updated
- [ ] Release notes prepared
- [ ] Package signed with valid certificate
- [ ] Installation tested on clean machine

### During Deployment
- [ ] Package uploaded to distribution channel
- [ ] Listing/documentation complete
- [ ] Download links verified
- [ ] Installation instructions provided
- [ ] Support channels ready

### Post-Deployment
- [ ] Monitor for issues
- [ ] Collect user feedback
- [ ] Track download/install metrics
- [ ] Plan next update
- [ ] Update documentation as needed

## Additional Resources

- [Microsoft Partner Center](https://partner.microsoft.com/dashboard)
- [Windows App Certification Requirements](https://docs.microsoft.com/en-us/windows/apps/get-started/)
- [Code Signing Best Practices](https://docs.microsoft.com/en-us/windows/security/threat-protection/windows-defender-application-control/use-code-signing-for-better-control-and-protection)
- [Intune App Deployment](https://docs.microsoft.com/en-us/mem/intune/apps/)

## Support

For deployment issues:
1. Check this guide
2. Review Microsoft documentation
3. Contact support channels
4. File GitHub issue if needed

## Version History

- **1.0.3** - Initial deployment documentation
  - Added Microsoft Store deployment guide
  - Added sideloading instructions
  - Added enterprise deployment options
  - Added web distribution guide
