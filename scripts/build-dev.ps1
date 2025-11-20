# Hacktricks Viewer RN Development Build Script
# Builds the app in development mode with hot reloading enabled

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Debug",

    [Parameter(Mandatory=$false)]
    [ValidateSet("x64", "x86", "ARM64")]
    [string]$Platform = "x64",

    [Parameter(Mandatory=$false)]
    [switch]$StartMetro,

    [Parameter(Mandatory=$false)]
    [switch]$Deploy,

    [Parameter(Mandatory=$false)]
    [switch]$Clean
)

# Script configuration
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"

    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor $Red }
        "WARN"  { Write-Host $logMessage -ForegroundColor $Yellow }
        "INFO"  { Write-Host $logMessage -ForegroundColor $Green }
        "DEBUG" { Write-Host $logMessage -ForegroundColor $Cyan }
    }
}

function Initialize-DevBuild {
    Write-Log "Initializing development build environment..."

    # Clean if requested
    if ($Clean) {
        Write-Log "Cleaning development build artifacts..."
        $bundleDir = "$projectRoot\windows\HacktricksViewerRN\Bundle"
        if (Test-Path $bundleDir) {
            Remove-Item $bundleDir -Recurse -Force
        }
    }

    Write-Log "Development build initialized"
}

function Prepare-DevData {
    Write-Log "Preparing development data..."

    # For development, we can use the bundling script but with dev flag
    Push-Location $scriptDir
    try {
        & node bundle-data.js
        Write-Log "Development data prepared"
    } finally {
        Pop-Location
    }
}

function Start-MetroBundler {
    Write-Log "Starting Metro bundler in development mode..."

    $metroJob = Start-Job -ScriptBlock {
        param($projectRoot)
        Push-Location $projectRoot
        & npx react-native start --reset-cache
    } -ArgumentList $projectRoot

    Write-Log "Metro bundler started (Job ID: $($metroJob.Id))"
    Write-Log "Press Ctrl+C to stop the bundler when done"

    # Return job for potential cleanup
    return $metroJob
}

function Build-DevBundle {
    Write-Log "Building development bundle..."

    Push-Location $projectRoot

    try {
        # Build bundle with dev flags
        $bundleArgs = @(
            "bundle",
            "--platform", "windows",
            "--dev", "true",
            "--minify", "false",
            "--entry-file", "index.js",
            "--bundle-output", "windows\HacktricksViewerRN\Bundle\index.windows.bundle",
            "--assets-dest", "windows\HacktricksViewerRN\Bundle",
            "--sourcemap-output", "windows\HacktricksViewerRN\Bundle\index.windows.bundle.map"
        )

        & npx react-native $bundleArgs
        if ($LASTEXITCODE -ne 0) {
            throw "Metro bundling failed"
        }

        Write-Log "Development bundle created successfully"
    } finally {
        Pop-Location
    }
}

function Build-VisualStudioDev {
    Write-Log "Building Visual Studio project in development mode..."

    Push-Location "$projectRoot\windows"

    try {
        # Find MSBuild
        $vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
        $msbuild = & $vsWhere -latest -requires Microsoft.Component.MSBuild -find "MSBuild\**\Bin\MSBuild.exe" | Select-Object -First 1

        if (!$msbuild) {
            throw "MSBuild not found"
        }

        Write-Log "Using MSBuild: $msbuild"

        # Build arguments for development
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
            throw "Visual Studio build failed"
        }

        Write-Log "Visual Studio development build completed successfully"
    } finally {
        Pop-Location
    }
}

function Deploy-DevApp {
    Write-Log "Deploying development app to device/emulator..."

    Push-Location $projectRoot

    try {
        # Deploy using react-native-windows
        & npx react-native run-windows --no-packager --no-launch
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Deployment failed, but build may still be usable" "WARN"
        } else {
            Write-Log "Development app deployed successfully"
        }
    } finally {
        Pop-Location
    }
}

# Main development build process
try {
    Write-Log "=== Hacktricks Viewer RN Development Build Started ==="
    Write-Log "Configuration: $Configuration, Platform: $Platform"

    Initialize-DevBuild
    Prepare-DevData

    # Start Metro if requested
    $metroJob = $null
    if ($StartMetro) {
        $metroJob = Start-MetroBundler
        Start-Sleep -Seconds 3  # Give Metro time to start
    }

    # Build the bundle
    Build-DevBundle

    # Build Visual Studio project
    Build-VisualStudioDev

    # Deploy if requested
    if ($Deploy) {
        Deploy-DevApp
    }

    Write-Log "=== Development build completed successfully ==="
    Write-Log "To run the app: npx react-native run-windows"
    if ($metroJob) {
        Write-Log "Metro bundler is running in background (Job ID: $($metroJob.Id))"
        Write-Log "Stop it with: Stop-Job -Id $($metroJob.Id); Remove-Job -Id $($metroJob.Id)"
    }

} catch {
    Write-Log "Development build failed with error: $($_.Exception.Message)" "ERROR"
    Write-Log "Stack trace: $($_.ScriptStackTrace)" "ERROR"

    # Cleanup metro job if it exists
    if ($metroJob) {
        Write-Log "Stopping Metro bundler..." "WARN"
        Stop-Job -Id $metroJob.Id -ErrorAction SilentlyContinue
        Remove-Job -Id $metroJob.Id -ErrorAction SilentlyContinue
    }

    exit 1
}