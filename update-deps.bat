@echo off
REM Efficient Dependency Update Script for Bunubon - Windows Version

echo ========================================
echo   Bunubon - Dependency Update Script
echo ========================================
echo.

set "ROOT=%~dp0"

echo [Step 1/4] Backend - Safe updates...
cd /d "%ROOT%backend"
call npm audit fix
echo.

echo [Step 2/4] Backend - Critical vulnerability fixes...
call npm install express-rate-limit@^9.0.0
call npm install express@^4.21.0
echo.

echo [Step 3/4] Frontend - Update dependencies...
cd /d "%ROOT%frontend"
call npm install
echo.

echo [Step 4/4] GUI Controller - Update dependencies...
cd /d "%ROOT%gui-controller"
call npm install
echo.

echo ========================================
echo   Update Complete!
echo ========================================
echo.
echo Running final audit...
cd /d "%ROOT%backend"
call npm audit --audit-level=high

echo.
echo Note: Some vulnerabilities in sqlite3 and xlsx are known issues.
echo Run 'update-deps.bat --force' for breaking changes.
echo.
pause
