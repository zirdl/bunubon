@echo off
REM Bunubon LTS - Windows Build Script
REM Builds the portable Windows executable

echo ========================================
echo   Bunubon LTS - Windows Build Script
echo ========================================
echo.

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "GUI_DIR=%SCRIPT_DIR%"
set "BACKEND_DIR=%SCRIPT_DIR%..\backend"
set "FRONTEND_DIR=%SCRIPT_DIR%..\frontend"

echo [Step 1/6] Checking prerequisites...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo   [OK] Node.js: %NODE_VERSION%

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo   [OK] npm: %NPM_VERSION%

echo.
echo [Step 2/6] Updating backend dependencies...
cd /d "%BACKEND_DIR%"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Cannot access backend directory
    pause
    exit /b 1
)

call npm audit fix
call npm install express@^4.21.2 express-rate-limit@^8.3.0
echo   [OK] Backend dependencies updated

echo.
echo [Step 3/6] Building frontend...
cd /d "%FRONTEND_DIR%"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Cannot access frontend directory
    pause
    exit /b 1
)

call npm install
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to build frontend
    pause
    exit /b 1
)
echo   [OK] Frontend built successfully

echo.
echo [Step 4/6] Installing backend production dependencies...
cd /d "%BACKEND_DIR%"
call npm install --production
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo   [OK] Backend dependencies installed

echo.
echo [Step 5/6] Installing GUI dependencies...
cd /d "%GUI_DIR%"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install GUI dependencies
    pause
    exit /b 1
)
echo   [OK] GUI dependencies installed

echo.
echo [Step 6/6] Building Windows portable executable...
call npm run build:portable
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to build executable
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Output location: %GUI_DIR%dist\
echo.
echo Files created:
dir /B "%GUI_DIR%dist\*.exe" 2>nul
echo.
echo Next steps:
echo   1. The executable is ready in the dist\ folder
echo   2. Copy the .exe file to any Windows machine
echo   3. Run the executable (no installation required)
echo   4. Use the GUI to start/stop the backend server
echo.
pause
