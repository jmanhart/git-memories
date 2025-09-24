#!/bin/bash

# Git Memories Development Startup Script
echo "🚀 Starting Git Memories Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    print_error "Please run this script from the git-memories root directory"
    exit 1
fi

# Check for required tools
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Setting up development environment..."

# Kill any existing processes on our ports
print_status "Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:5174 | xargs kill -9 2>/dev/null || true

# Build core package first
print_status "Building core package..."
cd packages/core
if ! npm run build; then
    print_error "Failed to build core package"
    exit 1
fi
print_success "Core package built successfully"
cd ../..

# Install backend dependencies
print_status "Installing backend dependencies..."
cd packages/web/backend
if ! npm install; then
    print_error "Failed to install backend dependencies"
    exit 1
fi
print_success "Backend dependencies installed"
cd ../../..

# Install web dependencies
print_status "Installing web dependencies..."
cd packages/web
if ! npm install; then
    print_error "Failed to install web dependencies"
    exit 1
fi
print_success "Web dependencies installed"
cd ../..

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    print_warning "No GITHUB_TOKEN environment variable set."
    print_warning "The demo will work with public GitHub data only."
    print_warning "Set GITHUB_TOKEN for authenticated requests."
    echo ""
fi

# Start backend server in background
print_status "Starting backend server..."
cd packages/web/backend
node server.js &
BACKEND_PID=$!
cd ../../..

# Wait for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:3001/api/test > /dev/null; then
    print_error "Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
print_success "Backend server started on port 3001"

# Start frontend development server
print_status "Starting frontend development server..."
cd packages/web
npm run dev &
FRONTEND_PID=$!
cd ../..

# Wait for frontend to start
sleep 5

print_success "🎉 Git Memories Development Environment is ready!"
echo ""
echo -e "${GREEN}📡 Backend API:${NC}  http://localhost:3001"
echo -e "${GREEN}🌐 Frontend:${NC}     http://localhost:5173 (or 5174)"
echo -e "${GREEN}🧪 Test API:${NC}     http://localhost:3001/api/test"
echo ""
echo -e "${BLUE}Available terminal commands:${NC}"
echo "  user <username>         - Get GitHub user info"
echo "  memories <username>     - Get contributions for today"
echo "  memories <user> <date>  - Get contributions for specific date"
echo "  help                    - Show all commands"
echo "  version                 - Show version info"
echo "  auth                    - Show auth status"
echo ""
echo -e "${YELLOW}Development tips:${NC}"
echo "  • Backend logs: Check the terminal where backend is running"
echo "  • Frontend hot reload: Changes auto-refresh"
echo "  • API testing: curl http://localhost:3001/api/test"
echo "  • GitHub token: Set GITHUB_TOKEN env var for real data"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Function to cleanup on exit
cleanup() {
    echo ""
    print_status "Shutting down development environment..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    print_success "Development environment stopped"
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for either process to exit
wait
