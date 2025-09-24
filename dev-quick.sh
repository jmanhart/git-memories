#!/bin/bash

# Quick Development Script - Assumes dependencies are already installed
echo "🚀 Quick Start - Git Memories Development"

# Kill existing processes
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:5174 | xargs kill -9 2>/dev/null || true

# Start backend
echo "📡 Starting backend..."
cd packages/web/backend
node server.js &
BACKEND_PID=$!
cd ../../..

# Start frontend
echo "🌐 Starting frontend..."
cd packages/web
npm run dev &
FRONTEND_PID=$!
cd ../..

sleep 3

echo "✅ Ready! Frontend: http://localhost:5173 Backend: http://localhost:3001"
echo "Press Ctrl+C to stop"

cleanup() {
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
