@echo off
title WhatsApp Batch Buddy - Quick Start
cd /d "%~dp0"

echo ========================================
echo   WhatsApp Batch Buddy - Quick Start
echo ========================================
echo.

REM Check if Bun is installed
where bun >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Bun is not installed!
    echo Please run run-app.bat first to install everything.
    pause
    exit /b 1
)

REM Check if dist folder exists
if not exist "dist" (
    echo No build found. Please run run-app.bat first.
    pause
    exit /b 1
)

REM Create conversations directory if it doesn't exist
if not exist "conversations" mkdir conversations

echo Starting server at http://localhost:3001
echo.
echo   App URL:     http://localhost:3001
echo   Webhook URL: http://localhost:3001/webhook
echo.
echo Press Ctrl+C to stop the server
echo.

start http://localhost:3001
call bun run server.ts

pause
