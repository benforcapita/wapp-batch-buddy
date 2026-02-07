#!/bin/bash

# WhatsApp Batch Buddy - Quick Start Script
# Works on macOS and Linux

cd "$(dirname "$0")"

echo "========================================"
echo "  WhatsApp Batch Buddy - Quick Start"
echo "========================================"
echo

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "ERROR: Bun is not installed!"
    echo "Please run ./run-app.sh first to install everything."
    exit 1
fi

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "No build found. Please run ./run-app.sh first."
    exit 1
fi

# Create conversations directory if it doesn't exist
mkdir -p conversations

echo "Starting server at http://localhost:3001"
echo
echo "  App URL:     http://localhost:3001"
echo "  Webhook URL: http://localhost:3001/webhook"
echo
echo "Press Ctrl+C to stop the server"
echo

# Open browser (works on macOS and Linux)
if command -v open &> /dev/null; then
    open http://localhost:3001
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3001
fi

# Start the server
bun run server.ts
