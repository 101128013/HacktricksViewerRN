@echo off
REM Hacktricks Viewer RN Windows Build Script (Batch Version)
REM Builds a standalone Windows executable with bundled documentation

setlocal enabledelayedexpansion

REM Configuration variables
set "CONFIGURATION=Release"
set "PLATFORM=x64"
set "CLEAN=false"
set "BUNDLE_ONLY=false"
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
set "OUTPUT_PATH=%PROJECT_ROOT%\build\windows"
set "BUILD_LOG=%OUTPUT_PATH%\build.log"
set "HACKTRICKS_SRC=%PROJECT_ROOT%\..\src"
set "HACKTRICKS_DATA=%PROJECT_ROOT%\data"

REM Colors (using color codes)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "CYAN=[96m"
set "RESET=[0m"

REM Process command line arguments
:parse_args
if "%1"=="" goto end_parse
if "%1"=="-configuration" (
    set "CONFIGURATION=%2"
    shift & shift
    goto parse_args
)
if "%1"=="-platform" (
    set "PLATFORM=%2"
    shift & shift
    goto parse_args
)
if "%1"=="-clean" (
    set "CLEAN=true"
    shift
    goto parse_args
)
if "%1"=="-bundle-only" (
    set "BUNDLE_ONLY=true"
    shift
    goto parse_args
)
if "%1"=="-output" (
    set "OUTPUT_PATH=%2"
    shift & shift
    goto parse_args
)
shift
goto parse_args
:end_parse

call :log "=== Hacktricks Viewer RN Windows Build Started ==="

REM Main build process
call :test_prerequisites || goto error
call :initialize_build || goto error

if "%BUNDLE_ONLY%"=="false" (
    call :install_dependencies || goto error
)

call :prepare_data_files || goto error

if "%BUNDLE_ONLY%"=="false" (
    call :update_version || goto error
    call :build_visual_studio || goto error
)

call :build_bundle || goto error

if "%BUNDLE_ONLY%"=="false" (
    call :create_self_contained_package || goto error
)

call :log "=== Build completed successfully ==="
call :log "Output location: %OUTPUT_PATH%"
goto end

:test_prerequisites
call :log "Checking prerequisites..."

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    call :error "Node.js is not installed or not in PATH"
    goto :eof
)
for /f "tokens=*" %%i in ('node --version') do call :log "Node.js version: %%i"

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    call :error "npm is not installed or not in PATH"
    goto :eof
)
for /f "tokens=*" %%i in ('npm --version') do call :log "npm version: %%i"

REM Check Visual Studio Build Tools
if exist "%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe" (
    for /f "tokens=*" %%i in ('"%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe" -latest -products * -requires Microsoft.VisualStudio.Workload.VCTools -property installationPath') do (
        call :log "Visual Studio Build Tools found at: %%i"
        goto vs_found
    )
    call :error "Visual Studio Build Tools workload is not installed"
    goto :eof
) else (
    call :error "Visual Studio Installer (vswhere.exe) not found"
    goto :eof
)
:vs_found

call :log "Prerequisites check completed"
goto :eof

:initialize_build
call :log "Initializing build environment..."

REM Create output directory
if not exist "%OUTPUT_PATH%" mkdir "%OUTPUT_PATH%"

REM Clean build directory if requested
if "%CLEAN%"=="true" (
    call :log "Cleaning build directory..."
    rmdir /s /q "%OUTPUT_PATH%" 2>nul
    mkdir "%OUTPUT_PATH%"
)

REM Initialize log file
if exist "%BUILD_LOG%" del "%BUILD_LOG%"
call :log "Build started - Configuration: %CONFIGURATION%, Platform: %PLATFORM%"
goto :eof

:install_dependencies
call :log "Installing npm dependencies..."
pushd "%PROJECT_ROOT%"

call npm ci
if errorlevel 1 (
    call :error "npm install failed"
    popd
    goto :eof
)

call :log "Dependencies installed successfully"
popd
goto :eof

:prepare_data_files
call :log "Preparing data files for bundling..."

REM Create data directory in project
if not exist "%PROJECT_ROOT%\assets\data" mkdir "%PROJECT_ROOT%\assets\data"

REM Check for source data files
set "TOC_JSON=%HACKTRICKS_DATA%\toc.json"
set "PROCESSED_DOCS_JSON=%HACKTRICKS_DATA%\processed_docs.json"
set "SEARCH_INDEX_JSON=%HACKTRICKS_DATA%\search_index.json"

set "MISSING_FILES="
if not exist "%TOC_JSON%" set "MISSING_FILES=%MISSING_FILES% toc.json"
if not exist "%PROCESSED_DOCS_JSON%" set "MISSING_FILES=%MISSING_FILES% processed_docs.json"
if not exist "%SEARCH_INDEX_JSON%" set "MISSING_FILES=%MISSING_FILES% search_index.json"

if defined MISSING_FILES (
    call :warn "Missing data files:%MISSING_FILES%"
    call :log "Generating placeholder data files..."

    REM Create placeholder toc.json
    echo {>"%TOC_JSON%"
    echo   "sections": [],>>"%TOC_JSON%"
    echo   "version": "1.0.0",>>"%TOC_JSON%"
    echo   "generated": "%DATE%T%TIME%">>"%TOC_JSON%"
    echo }>>"%TOC_JSON%"

    REM Create placeholder processed_docs.json
    echo {>"%PROCESSED_DOCS_JSON%"
    echo   "documents": {},>>"%PROCESSED_DOCS_JSON%"
    echo   "version": "1.0.0",>>"%PROCESSED_DOCS_JSON%"
    echo   "generated": "%DATE%T%TIME%">>"%PROCESSED_DOCS_JSON%"
    echo }>>"%PROCESSED_DOCS_JSON%"

    REM Create placeholder search_index.json
    echo {>"%SEARCH_INDEX_JSON%"
    echo   "index": {},>>"%SEARCH_INDEX_JSON%"
    echo   "version": "1.0.0",>>"%SEARCH_INDEX_JSON%"
    echo   "generated": "%DATE%T%TIME%">>"%SEARCH_INDEX_JSON%"
    echo }>>"%SEARCH_INDEX_JSON%"
)

REM Copy data files to assets
copy "%TOC_JSON%" "%PROJECT_ROOT%\assets\data\toc.json" >nul
copy "%PROCESSED_DOCS_JSON%" "%PROJECT_ROOT%\assets\data\processed_docs.json" >nul
copy "%SEARCH_INDEX_JSON%" "%PROJECT_ROOT%\assets\data\search_index.json" >nul

call :log "Data files prepared successfully"
goto :eof

:update_version
call :log "Updating version information..."

REM Generate build number (YYYYMMDDHHMMSS)
for /f "tokens=2-7 delims=/-: " %%a in ("%DATE% %TIME%") do (
    set "BUILD_NUMBER=%%a%%b%%c%%d%%e%%f"
)

set "VERSION=1.0.%BUILD_NUMBER%.0"

REM Update package.json (simplified - would need more robust JSON editing in production)
echo {>"%PROJECT_ROOT%\package.json.tmp"
echo   "name": "HacktricksViewerRN",>>"%PROJECT_ROOT%\package.json.tmp"
echo   "version": "1.0.%BUILD_NUMBER%",>>"%PROJECT_ROOT%\package.json.tmp"
echo   "private": true,>>"%PROJECT_ROOT%\package.json.tmp"
echo   "scripts": {>>"%PROJECT_ROOT%\package.json.tmp"
echo     "android": "react-native run-android",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "ios": "react-native run-ios",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "lint": "eslint .",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "start": "react-native start",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "test": "jest",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "windows": "react-native run-windows">>"%PROJECT_ROOT%\package.json.tmp"
echo   },>>"%PROJECT_ROOT%\package.json.tmp"
echo   "dependencies": {>>"%PROJECT_ROOT%\package.json.tmp"
echo     "@react-native-async-storage/async-storage": "^2.2.0",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "@react-native-community/slider": "^5.1.1",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "react": "18.3.1",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "react-native": "0.75.4",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "react-native-windows": "0.75.20">>"%PROJECT_ROOT%\package.json.tmp"
echo   },>>"%PROJECT_ROOT%\package.json.tmp"
echo   "devDependencies": {>>"%PROJECT_ROOT%\package.json.tmp"
echo     "@babel/core": "^7.20.0",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "@babel/preset-env": "^7.20.0",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "@babel/runtime": "^7.20.0",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "@react-native/babel-preset": "0.75.4",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "@react-native/eslint-config": "0.75.4",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "@react-native/metro-config": "0.75.4",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "@react-native/typescript-config": "0.75.4",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "@types/react": "^18.2.6",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "@types/react-test-renderer": "^18.0.0",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "babel-jest": "^29.6.3",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "eslint": "^8.19.0",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "jest": "^29.6.3",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "metro-config": "^0.80.12",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "prettier": "2.8.8",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "react-test-renderer": "18.3.1",>>"%PROJECT_ROOT%\package.json.tmp"
echo     "typescript": "5.0.4">>"%PROJECT_ROOT%\package.json.tmp"
echo   },>>"%PROJECT_ROOT%\package.json.tmp"
echo   "engines": {>>"%PROJECT_ROOT%\package.json.tmp"
echo     "node": "^>=18">>"%PROJECT_ROOT%\package.json.tmp"
echo   }>>"%PROJECT_ROOT%\package.json.tmp"
echo }>>"%PROJECT_ROOT%\package.json.tmp"
move "%PROJECT_ROOT%\package.json.tmp" "%PROJECT_ROOT%\package.json" >nul

REM Update manifest (simplified XML editing)
powershell -Command "(Get-Content '%PROJECT_ROOT%\windows\HacktricksViewerRN\Package.appxmanifest') -replace 'Version=\"[^\"]*\"', 'Version=\"%VERSION%\"' | Set-Content '%PROJECT_ROOT%\windows\HacktricksViewerRN\Package.appxmanifest'"

call :log "Version updated to: %VERSION%"
goto :eof

:build_bundle
call :log "Building Metro bundle..."

pushd "%PROJECT_ROOT%"

call npx react-native bundle --platform windows --dev false --minify true --entry-file index.js --bundle-output windows\HacktricksViewerRN\Bundle\index.windows.bundle --assets-dest windows\HacktricksViewerRN\Bundle --sourcemap-output windows\HacktricksViewerRN\Bundle\index.windows.bundle.map
if errorlevel 1 (
    call :error "Metro bundling failed"
    popd
    goto :eof
)

call :log "Bundle created successfully"
popd
goto :eof

:build_visual_studio
call :log "Building Visual Studio project..."

pushd "%PROJECT_ROOT%\windows"

REM Find MSBuild
for /f "tokens=*" %%i in ('"%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe" -latest -requires Microsoft.Component.MSBuild -find "MSBuild\**\Bin\MSBuild.exe"') do (
    set "MSBUILD=%%i"
    goto msbuild_found
)
call :error "MSBuild not found"
popd
goto :eof

:msbuild_found
call :log "Using MSBuild: %MSBUILD%"

REM Build the project
"%MSBUILD%" HacktricksViewerRN.sln /p:Configuration=%CONFIGURATION% /p:Platform=%PLATFORM% /p:AppxPackageSigningEnabled=false /p:PackageCertificateThumbprint= /verbosity:minimal /maxcpucount
if errorlevel 1 (
    call :error "Visual Studio build failed"
    popd
    goto :eof
)

call :log "Visual Studio build completed successfully"
popd
goto :eof

:create_self_contained_package
call :log "Creating self-contained deployment package..."

set "APPX_DIR=%PROJECT_ROOT%\windows\HacktricksViewerRN\AppPackages\HacktricksViewerRN_%CONFIGURATION%_%PLATFORM%_Test"

REM Get timestamp for output directory
for /f "tokens=2-4 delims=/- " %%a in ("%DATE%") do for /f "tokens=1-3 delims=: " %%d in ("%TIME%") do set "TIMESTAMP=%%a%%b%%c_%%d%%e%%f"
set "OUTPUT_DIR=%OUTPUT_PATH%\HacktricksViewerRN_%TIMESTAMP%"

if exist "%APPX_DIR%" (
    REM Create output directory
    mkdir "%OUTPUT_DIR%"

    REM Copy the built app
    xcopy "%APPX_DIR%\*" "%OUTPUT_DIR%\" /E /I /H /Y >nul

    REM Create a simple installer batch file
    echo @echo off>"%OUTPUT_DIR%\Install.bat"
    echo REM Hacktricks Viewer RN Installer>>"%OUTPUT_DIR%\Install.bat"
    echo REM This batch file installs the Hacktricks Documentation Viewer>>"%OUTPUT_DIR%\Install.bat"
    echo.>>"%OUTPUT_DIR%\Install.bat"
    echo if "%%1"=="uninstall" (>>"%OUTPUT_DIR%\Install.bat"
    echo     echo Uninstalling Hacktricks Viewer RN...>>"%OUTPUT_DIR%\Install.bat"
    echo     REM Add uninstall logic here>>"%OUTPUT_DIR%\Install.bat"
    echo ) else (>>"%OUTPUT_DIR%\Install.bat"
    echo     echo Installing Hacktricks Viewer RN...>>"%OUTPUT_DIR%\Install.bat"
    echo     echo.>>"%OUTPUT_DIR%\Install.bat"
    echo     REM Check if app is already installed>>"%OUTPUT_DIR%\Install.bat"
    echo     powershell -Command "Get-AppxPackage -Name '*HacktricksViewerRN*' -ErrorAction SilentlyContinue ^| Remove-AppxPackage -ErrorAction SilentlyContinue">>"%OUTPUT_DIR%\Install.bat"
    echo.>>"%OUTPUT_DIR%\Install.bat"
    echo     REM Install the app>>"%OUTPUT_DIR%\Install.bat"
    echo     for %%%%f in ("HacktricksViewerRN_*.appx") do (>>"%OUTPUT_DIR%\Install.bat"
    echo         powershell -Command "Add-AppxPackage -Path '%%%%f' -ErrorAction Stop">>"%OUTPUT_DIR%\Install.bat"
    echo     )>>"%OUTPUT_DIR%\Install.bat"
    echo     echo Installation completed successfully!>>"%OUTPUT_DIR%\Install.bat"
    echo )>>"%OUTPUT_DIR%\Install.bat"

    call :log "Self-contained package created at: %OUTPUT_DIR%"
    call :log "Run Install.bat to install the application"
) else (
    call :warn "Appx package not found - skipping package creation"
)

goto :eof

:log
echo [%DATE% %TIME%] [INFO] %~1
echo [%DATE% %TIME%] [INFO] %~1>>"%BUILD_LOG%"
goto :eof

:warn
echo [%DATE% %TIME%] [WARN] %~1
echo [%DATE% %TIME%] [WARN] %~1>>"%BUILD_LOG%"
goto :eof

:error
echo [%DATE% %TIME%] [ERROR] %~1>&2
echo [%DATE% %TIME%] [ERROR] %~1>>"%BUILD_LOG%"
goto :eof

:end
exit /b 0

:error
call :error "Build failed"
exit /b 1