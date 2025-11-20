# Hacktricks Viewer RN Windows Build Script
# Builds a standalone Windows executable with bundled documentation

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Release",

    [Parameter(Mandatory=$false)]
    [ValidateSet("x64", "x86", "ARM64")]
    [string]$Platform = "x64",

    [Parameter(Mandatory=$false)]
    [switch]$Clean,

    [Parameter(Mandatory=$false)]
    [switch]$BundleOnly,

    [Parameter(Mandatory=$false)]
    [string]$OutputPath = "$PSScriptRoot\..\build\windows"
)

# Script configuration
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$buildLog = "$OutputPath\build.log"
$hacktricksSrc = "$projectRoot\..\src"
$hacktricksData = "$projectRoot\data"

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"

    # Write to console with color
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor $Red }
        "WARN"  { Write-Host $logMessage -ForegroundColor $Yellow }
        "INFO"  { Write-Host $logMessage -ForegroundColor $Green }
        "DEBUG" { Write-Host $logMessage -ForegroundColor $Cyan }
    }

    # Write to log file
    $logMessage | Out-File -FilePath $buildLog -Append -Encoding UTF8
}

function Exit-WithError {
    param([string]$Message)
    Write-Log $Message "ERROR"
    exit 1
}

function Test-Prerequisites {
    Write-Log "Checking prerequisites..."

    # Check Node.js
    try {
        $nodeVersion = & node --version
        Write-Log "Node.js version: $nodeVersion"
    } catch {
        Exit-WithError "Node.js is not installed or not in PATH"
    }

    # Check npm
    try {
        $npmVersion = & npm --version
        Write-Log "npm version: $npmVersion"
    } catch {
        Exit-WithError "npm is not installed or not in PATH"
    }

    # Check Visual Studio Build Tools
    $vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
    if (Test-Path $vsWhere) {
        $vsInstallation = & $vsWhere -latest -products * -requires Microsoft.VisualStudio.Workload.VCTools -property installationPath
        if ($vsInstallation) {
            Write-Log "Visual Studio Build Tools found at: $vsInstallation"
        } else {
            Exit-WithError "Visual Studio Build Tools workload is not installed"
        }
    } else {
        Exit-WithError "Visual Studio Installer (vswhere.exe) not found"
    }

    # Check Windows SDK
    $sdkPath = "${env:ProgramFiles(x86)}\Windows Kits\10\bin\*\x64\signtool.exe" | Get-ChildItem -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($sdkPath) {
        Write-Log "Windows SDK found"
    } else {
        Write-Log "Windows SDK not found - some features may not work" "WARN"
    }

    Write-Log "Prerequisites check completed"
}

function Initialize-Build {
    Write-Log "Initializing build environment..."

    # Create output directory
    if (!(Test-Path $OutputPath)) {
        New-Item -ItemType Directory -Path $OutputPath | Out-Null
    }

    # Clean build directory if requested
    if ($Clean) {
        Write-Log "Cleaning build directory..."
        Remove-Item "$OutputPath\*" -Recurse -Force -ErrorAction SilentlyContinue
    }

    # Initialize log file
    if (Test-Path $buildLog) {
        Remove-Item $buildLog -Force
    }
    Write-Log "Build started - Configuration: $Configuration, Platform: $Platform"
}

function Install-Dependencies {
    Write-Log "Installing npm dependencies..."
    Push-Location $projectRoot

    try {
        & npm ci
        if ($LASTEXITCODE -ne 0) {
            Exit-WithError "npm install failed"
        }
        Write-Log "Dependencies installed successfully"
    } finally {
        Pop-Location
    }
}

function Prepare-DataFiles {
    Write-Log "Preparing data files for bundling..."

    # Create data directory in project
    $dataDir = "$projectRoot\assets\data"
    if (!(Test-Path $dataDir)) {
        New-Item -ItemType Directory -Path $dataDir | Out-Null
    }

    # Check for source data files
    $tocJson = "$hacktricksData\toc.json"
    $processedDocsJson = "$hacktricksData\processed_docs.json"
    $searchIndexJson = "$hacktricksData\search_index.json"

    $missingFiles = @()
    if (!(Test-Path $tocJson)) { $missingFiles += "toc.json" }
    if (!(Test-Path $processedDocsJson)) { $missingFiles += "processed_docs.json" }
    if (!(Test-Path $searchIndexJson)) { $missingFiles += "search_index.json" }

    if ($missingFiles.Count -gt 0) {
        Write-Log "Missing data files: $($missingFiles -join ', ')" "WARN"
        Write-Log "Generating placeholder data files..."

        # Create placeholder files with basic structure
        @"
{
  "sections": [],
  "version": "1.0.0",
  "generated": "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')"
}
"@ | Out-File -FilePath $tocJson -Encoding UTF8

        @"
{
  "documents": {},
  "version": "1.0.0",
  "generated": "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')"
}
"@ | Out-File -FilePath $processedDocsJson -Encoding UTF8

        @"
{
  "index": {},
  "version": "1.0.0",
  "generated": "$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')"
}
"@ | Out-File -FilePath $searchIndexJson -Encoding UTF8
    }

    # Copy data files to assets
    Copy-Item $tocJson "$dataDir\toc.json" -Force
    Copy-Item $processedDocsJson "$dataDir\processed_docs.json" -Force
    Copy-Item $searchIndexJson "$dataDir\search_index.json" -Force

    Write-Log "Data files prepared successfully"
}

function Build-Bundle {
    Write-Log "Building Metro bundle..."

    Push-Location $projectRoot

    try {
        # Build the bundle
        $bundleArgs = @(
            "bundle",
            "--platform", "windows",
            "--dev", "false",
            "--minify", "true",
            "--entry-file", "index.js",
            "--bundle-output", "windows\HacktricksViewerRN\Bundle\index.windows.bundle",
            "--assets-dest", "windows\HacktricksViewerRN\Bundle",
            "--sourcemap-output", "windows\HacktricksViewerRN\Bundle\index.windows.bundle.map"
        )

        & npx react-native $bundleArgs
        if ($LASTEXITCODE -ne 0) {
            Exit-WithError "Metro bundling failed"
        }

        Write-Log "Bundle created successfully"
    } finally {
        Pop-Location
    }
}

function Build-VisualStudio {
    Write-Log "Building Visual Studio project..."

    Push-Location "$projectRoot\windows"

    try {
        # Find MSBuild
        $msbuild = & $vsWhere -latest -requires Microsoft.Component.MSBuild -find "MSBuild\**\Bin\MSBuild.exe" | Select-Object -First 1

        if (!$msbuild) {
            Exit-WithError "MSBuild not found"
        }

        Write-Log "Using MSBuild: $msbuild"

        # Build arguments
        $buildArgs = @(
            "HacktricksViewerRN.sln",
            "/p:Configuration=$Configuration",
            "/p:Platform=$Platform",
            "/p:AppxPackageSigningEnabled=false",
            "/p:PackageCertificateThumbprint=",
            "/verbosity:minimal",
            "/maxcpucount"
        )

        # Execute build
        & $msbuild $buildArgs
        if ($LASTEXITCODE -ne 0) {
            Exit-WithError "Visual Studio build failed"
        }

        Write-Log "Visual Studio build completed successfully"
    } finally {
        Pop-Location
    }
}

function Create-SelfContainedPackage {
    Write-Log "Creating self-contained deployment package..."

    $appxDir = "$projectRoot\windows\HacktricksViewerRN\AppPackages\HacktricksViewerRN_$($Configuration)_$($Platform)_Test"
    $outputDir = "$OutputPath\HacktricksViewerRN_$((Get-Date -Format 'yyyyMMdd_HHmmss'))"

    if (Test-Path $appxDir) {
        # Create output directory
        New-Item -ItemType Directory -Path $outputDir | Out-Null

        # Copy the built app
        Copy-Item "$appxDir\*" $outputDir -Recurse -Force

        # Create a simple installer script
        $installerScript = @"
# Hacktricks Viewer RN Installer
# This script installs the Hacktricks Documentation Viewer

param(
    [switch]`$Uninstall
)

if (`$Uninstall) {
    Write-Host "Uninstalling Hacktricks Viewer RN..."
    # Add uninstall logic here
} else {
    Write-Host "Installing Hacktricks Viewer RN..."

    # Check if app is already installed
    `$installed = Get-AppxPackage -Name "*HacktricksViewerRN*" -ErrorAction SilentlyContinue
    if (`$installed) {
        Write-Host "Removing existing installation..."
        `$installed | Remove-AppxPackage -ErrorAction SilentlyContinue
    }

    # Install the app
    Add-AppxPackage -Path "$((Get-Item 'HacktricksViewerRN_*.appx').Name)" -ErrorAction Stop
    Write-Host "Installation completed successfully!"
}
"@

        $installerScript | Out-File -FilePath "$outputDir\Install.ps1" -Encoding UTF8

        Write-Log "Self-contained package created at: $outputDir"
        Write-Log "Run Install.ps1 to install the application"
    } else {
        Write-Log "Appx package not found - skipping package creation" "WARN"
    }
}

function Update-Version {
    Write-Log "Updating version information..."

    # Generate build number
    $buildNumber = [int](Get-Date -UFormat "%Y%m%d%H%M%S")
    $version = "1.0.$buildNumber.0"

    # Update package.json
    $packageJson = Get-Content "$projectRoot\package.json" -Raw | ConvertFrom-Json
    $packageJson.version = "1.0.$buildNumber"
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "$projectRoot\package.json" -Encoding UTF8

    # Update manifest
    $manifestPath = "$projectRoot\windows\HacktricksViewerRN\Package.appxmanifest"
    $manifest = [xml](Get-Content $manifestPath -Encoding UTF8)
    $manifest.Package.Identity.Version = $version
    $manifest.Save($manifestPath)

    Write-Log "Version updated to: $version"
}

# Main build process
try {
    Write-Log "=== Hacktricks Viewer RN Windows Build Started ==="

    Test-Prerequisites
    Initialize-Build

    if (!$BundleOnly) {
        Install-Dependencies
    }

    Prepare-DataFiles

    if (!$BundleOnly) {
        Update-Version
        Build-VisualStudio
    }

    Build-Bundle

    if (!$BundleOnly) {
        Create-SelfContainedPackage
    }

    Write-Log "=== Build completed successfully ==="
    Write-Log "Output location: $OutputPath"

} catch {
    Write-Log "Build failed with error: $($_.Exception.Message)" "ERROR"
    Write-Log "Stack trace: $($_.ScriptStackTrace)" "ERROR"
    exit 1
}