#!/bin/bash

# Git Memories - Complete Test Reset Script
# This script completely resets your environment for testing

echo "🧹 Git Memories Test Reset"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Uninstall global package
echo "1. Uninstalling global git-memories package..."
if npm list -g git-memories > /dev/null 2>&1; then
    npm uninstall -g git-memories
    print_status "Global package uninstalled"
else
    print_warning "Global package not found (already uninstalled)"
fi

# 2. Clear npm cache
echo "2. Clearing npm cache..."
npm cache clean --force
print_status "NPM cache cleared"

# 3. Remove stored authentication data
echo "3. Removing stored authentication data..."
AUTH_DIR="$HOME/.config/git-memories"
if [ -d "$AUTH_DIR" ]; then
    rm -rf "$AUTH_DIR"
    print_status "Authentication data removed from $AUTH_DIR"
else
    print_warning "No authentication data found"
fi

# 3.5. Remove test logs
echo "3.5. Removing test logs..."
TEST_LOGS_DIR="test/logs"
if [ -d "$TEST_LOGS_DIR" ]; then
    rm -rf "$TEST_LOGS_DIR"
    print_status "Test logs removed from $TEST_LOGS_DIR"
else
    print_warning "No test logs found"
fi

# 4. Remove any .env files in the project
echo "4. Removing .env files from project..."
PROJECT_ROOT="$(dirname "$(dirname "$0")")"
cd "$PROJECT_ROOT"
if [ -f ".env" ]; then
    rm .env
    print_status "Removed .env file"
fi
if [ -f ".env.local" ]; then
    rm .env.local
    print_status "Removed .env.local file"
fi

# 5. Clear GitHub CLI authentication (optional)
echo "5. GitHub CLI authentication status:"
if command -v gh &> /dev/null; then
    if gh auth status &> /dev/null; then
        print_warning "GitHub CLI is authenticated. Run 'gh auth logout' if you want to test OAuth flow"
    else
        print_status "GitHub CLI not authenticated (good for OAuth testing)"
    fi
else
    print_warning "GitHub CLI not installed"
fi

# 6. Show next steps
echo ""
echo "🎯 Next Steps for Testing:"
echo "=========================="
echo "1. For OAuth testing:"
echo "   - Make sure you have GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env"
echo "   - Run: gh auth logout (to disable GitHub CLI fallback)"
echo "   - Run: npm run build && npm pack"
echo "   - Run: npm install -g git-memories-*.tgz"
echo "   - Test in a different directory: git-memories"
echo ""
echo "2. For GitHub CLI testing:"
echo "   - Run: gh auth login"
echo "   - Run: npm run build && npm pack"
echo "   - Run: npm install -g git-memories-*.tgz"
echo "   - Test in a different directory: git-memories"
echo ""
echo "3. For manual token testing:"
echo "   - Run: gh auth logout (to disable GitHub CLI)"
echo "   - Don't create .env file (to disable OAuth)"
echo "   - Run: npm run build && npm pack"
echo "   - Run: npm install -g git-memories-*.tgz"
echo "   - Test in a different directory: git-memories"

print_status "Reset complete! Ready for testing."
