#!/bin/bash

# WhatsApp Batch Buddy - Full Setup Script
# Works on macOS and Linux

cd "$(dirname "$0")"

echo "========================================"
echo "  WhatsApp Batch Buddy - Full Setup"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Or use: brew install node (macOS) / apt install nodejs (Ubuntu)"
    exit 1
fi

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "Bun is not installed. Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    
    # Source the updated profile
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    
    if ! command -v bun &> /dev/null; then
        echo
        echo "Bun was installed. Please restart your terminal and run this script again."
        echo "Or run: source ~/.bashrc (or ~/.zshrc)"
        exit 0
    fi
fi

echo "Node.js version: $(node -v)"
echo "Bun version: $(bun -v)"
echo

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "node_modules/vite" ]; then
    echo "Installing dependencies..."
    NODE_ENV=development npm install
    echo
fi

# Build the production version
echo "Building production version..."
NODE_ENV=development npm run build
if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi
echo

# Create conversations directory if it doesn't exist
mkdir -p conversations

echo "========================================"
echo "  Server starting on http://localhost:3001"
echo "========================================"
echo
echo "  App URL:     http://localhost:3001"
echo "  Webhook URL: http://localhost:3001/webhook"
echo
echo "  Configure webhook settings in the app's Settings page"
echo
echo "  Press Ctrl+C to stop the server"
echo "========================================"
echo

# Open browser (works on macOS and Linux)
if command -v open &> /dev/null; then
    open http://localhost:3001
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3001
fi

# Start the server
bun run server.ts
