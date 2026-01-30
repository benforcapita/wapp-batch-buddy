@echo off
title WhatsApp Batch Buddy

REM Change to the project directory
cd /d "%~dp0"

echo ========================================
echo   WhatsApp Batch Buddy - Quick Start
echo ========================================
echo.

REM Check if dist folder exists (production build)
if not exist "dist" (
    echo No build found. Building production version...
    call npm run build
    echo.
)

echo Starting server at http://localhost:4173
echo Press Ctrl+C to stop the server
echo.

start http://localhost:4173
call npm run preview

pause
