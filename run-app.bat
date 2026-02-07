@echo off
title WhatsApp Batch Buddy
cd /d "%~dp0"

echo ========================================
echo   WhatsApp Batch Buddy - Full Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if Bun is installed
where bun >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Bun is not installed. Installing Bun...
    powershell -Command "irm bun.sh/install.ps1 | iex"
    echo.
    echo Please restart this script after Bun installation completes.
    pause
    exit /b 0
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    set NODE_ENV=development
    call npm install
    echo.
)

REM Build the production version
echo Building production version...
set NODE_ENV=development
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)
echo.

REM Create conversations directory if it doesn't exist
if not exist "conversations" mkdir conversations

REM Start the server
echo ========================================
echo   Server starting on http://localhost:3001
echo ========================================
echo.
echo   App URL:     http://localhost:3001
echo   Webhook URL: http://localhost:3001/webhook
echo.
echo   Configure webhook settings in the app's Settings page
echo.
echo   Press Ctrl+C to stop the server
echo ========================================
echo.

start http://localhost:3001
call bun run server.ts

pause
