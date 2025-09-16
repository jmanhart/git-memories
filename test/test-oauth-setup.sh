#!/bin/bash

# Git Memories - OAuth Test Setup Script
# This script sets up the environment specifically for OAuth testing

echo "🔐 Git Memories OAuth Test Setup"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Get project root directory
PROJECT_ROOT="$(dirname "$(dirname "$0")")"
cd "$PROJECT_ROOT"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the git-memories project root"
    exit 1
fi

# 1. Check for .env file
echo "1. Checking for .env file..."
if [ -f ".env" ]; then
    print_status "Found .env file"
    
    # Check if it has the required variables
    if grep -q "GITHUB_CLIENT_ID" .env && grep -q "GITHUB_CLIENT_SECRET" .env; then
        print_status "OAuth credentials found in .env"
    else
        print_warning "OAuth credentials missing from .env"
        echo "Please add:"
        echo "GITHUB_CLIENT_ID=your_client_id"
        echo "GITHUB_CLIENT_SECRET=your_client_secret"
        exit 1
    fi
else
    print_warning "No .env file found"
    echo "Creating .env template..."
    cat > .env << EOF
# GitHub OAuth App Credentials
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
EOF
    print_info "Created .env template. Please add your OAuth credentials."
    exit 1
fi

# 2. Disable GitHub CLI authentication
echo "2. Checking GitHub CLI authentication..."
if command -v gh &> /dev/null; then
    if gh auth status &> /dev/null; then
        print_warning "GitHub CLI is authenticated. Logging out for OAuth testing..."
        gh auth logout
        print_status "GitHub CLI logged out"
    else
        print_status "GitHub CLI not authenticated (perfect for OAuth testing)"
    fi
else
    print_warning "GitHub CLI not installed (good for OAuth testing)"
fi

# 3. Build and package
echo "3. Building and packaging..."
npm run build
if [ $? -eq 0 ]; then
    print_status "Build successful"
else
    print_error "Build failed"
    exit 1
fi

# Create package
npm pack
if [ $? -eq 0 ]; then
    print_status "Package created"
    PACKAGE_FILE=$(ls git-memories-*.tgz | head -1)
    print_info "Package file: $PACKAGE_FILE"
else
    print_error "Package creation failed"
    exit 1
fi

# 4. Install globally
echo "4. Installing package globally..."
npm install -g "$PACKAGE_FILE"
if [ $? -eq 0 ]; then
    print_status "Package installed globally"
else
    print_error "Global installation failed"
    exit 1
fi

# 5. Clean up package file
rm "$PACKAGE_FILE"
print_status "Cleaned up package file"

# 6. Test instructions
echo ""
echo "🎯 OAuth Testing Ready!"
echo "======================="
echo ""
print_info "To test OAuth flow:"
echo "1. cd to a different directory (e.g., ~/Desktop)"
echo "2. Run: git-memories"
echo "3. The OAuth flow should start automatically"
echo ""
print_info "Expected behavior:"
echo "- Should show 'Opening GitHub in your browser...'"
echo "- Should open GitHub OAuth page"
echo "- Should redirect back to localhost callback"
echo "- Should authenticate and fetch your contributions"
echo ""
print_info "If you see 'OAuth not configured' message:"
echo "- Check your .env file has correct credentials"
echo "- Make sure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are set"
echo ""
print_info "To test other scenarios:"
echo "- git-memories --test (mock data)"
echo "- git-memories --auth-setup (auth setup scenario)"
echo "- git-memories --no-entries (no contributions scenario)"

print_status "OAuth test setup complete!"
