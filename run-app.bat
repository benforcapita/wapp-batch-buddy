@echo off
title WhatsApp Batch Buddy

REM Change to the project directory (update this path to match your Windows installation)
cd /d "%~dp0"

echo ========================================
echo   WhatsApp Batch Buddy - Production
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Build the production version
echo Building production version...
call npm run build
echo.

REM Start the preview server and open browser
echo Starting server...
echo.
echo App will open in your browser at http://localhost:4173
echo Press Ctrl+C to stop the server
echo.

start http://localhost:4173
call npm run preview

pause
