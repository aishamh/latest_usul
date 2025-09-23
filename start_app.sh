#!/bin/bash

# Usul AI - Local Development Startup Script
# This script sets up and runs your React Native/Expo app on macOS

echo "🚀 Starting Usul AI Chat App..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js which includes npm."
    exit 1
fi

# Check if Expo CLI is installed globally
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI globally..."
    npm install -g @expo/cli
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing project dependencies..."
    npm install
fi

# Set OpenAI API Key environment variable
if [ -z "$OPENAI_API_KEY" ]; then
    echo ""
    echo "⚠️  OpenAI API Key not found in environment variables."
    echo "Please set your OpenAI API key:"
    read -p "Enter your OpenAI API Key: " api_key
    export OPENAI_API_KEY="$api_key"
    echo ""
    echo "✅ API Key set for this session."
    echo "To make it permanent, add this to your ~/.bash_profile or ~/.zshrc:"
    echo "export OPENAI_API_KEY=\"$api_key\""
    echo ""
fi

echo "🎯 Starting Expo development server..."
echo ""
echo "📱 Your app will be available at:"
echo "   - Web: http://localhost:5000"
echo "   - iOS Simulator: Use the QR code with Camera app"
echo "   - Android: Use the QR code with Expo Go app"
echo ""
echo "⌨️  Useful commands:"
echo "   - Press 'w' to open in web browser"
echo "   - Press 'i' to open iOS simulator"
echo "   - Press 'a' to open Android emulator"
echo "   - Press 'r' to reload the app"
echo "   - Press 'q' to quit"
echo ""

# Start the Expo development server
EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 npx expo start --web --port 5000