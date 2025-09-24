#!/bin/bash

echo "🚀 Starting Git Memories Demo..."

# Check if we have a GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  Warning: No GITHUB_TOKEN environment variable set."
    echo "   The demo will work with public GitHub data only."
    echo "   Set GITHUB_TOKEN for authenticated requests."
    echo ""
fi

# Start backend in background
echo "📡 Starting backend server..."
cd backend
npm install
GITHUB_TOKEN=${GITHUB_TOKEN:-"demo-token"} npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Git Memories Demo is running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""
echo "Try these commands in the terminal:"
echo "  user octocat"
echo "  memories octocat"
echo "  help"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for either process to exit
wait
