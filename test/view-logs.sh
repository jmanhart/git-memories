#!/bin/bash

# Git Memories - View Logs Script
# This script helps you view authentication logs for debugging

echo "📋 Git Memories Log Viewer"
echo "=========================="

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

# Check for logs directory
LOGS_DIR="test/logs"
if [ ! -d "$LOGS_DIR" ]; then
    print_warning "No logs directory found at $LOGS_DIR"
    print_info "Logs will be created when you run git-memories with authentication"
    exit 0
fi

# List available log files
echo "📁 Available log files:"
echo "======================="
ls -la "$LOGS_DIR"/*.log 2>/dev/null | while read -r line; do
    echo "  $line"
done

echo ""

# Show options
echo "🔍 View Options:"
echo "================"
echo "1. View latest log file"
echo "2. View all log files"
echo "3. Follow latest log file (real-time)"
echo "4. Search for errors in logs"
echo "5. Clear all logs"
echo ""

read -p "Choose an option (1-5): " choice

case $choice in
    1)
        LATEST_LOG=$(ls -t "$LOGS_DIR"/*.log 2>/dev/null | head -1)
        if [ -n "$LATEST_LOG" ]; then
            print_info "Showing latest log: $LATEST_LOG"
            echo ""
            cat "$LATEST_LOG"
        else
            print_warning "No log files found"
        fi
        ;;
    2)
        print_info "Showing all log files:"
        echo ""
        for log_file in "$LOGS_DIR"/*.log; do
            if [ -f "$log_file" ]; then
                echo "=== $(basename "$log_file") ==="
                cat "$log_file"
                echo ""
            fi
        done
        ;;
    3)
        LATEST_LOG=$(ls -t "$LOGS_DIR"/*.log 2>/dev/null | head -1)
        if [ -n "$LATEST_LOG" ]; then
            print_info "Following latest log: $LATEST_LOG"
            print_info "Press Ctrl+C to stop following"
            echo ""
            tail -f "$LATEST_LOG"
        else
            print_warning "No log files found"
        fi
        ;;
    4)
        print_info "Searching for errors in all logs:"
        echo ""
        grep -n "ERROR" "$LOGS_DIR"/*.log 2>/dev/null || print_warning "No errors found"
        ;;
    5)
        read -p "Are you sure you want to clear all logs? (y/N): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            rm -f "$LOGS_DIR"/*.log
            print_status "All logs cleared"
        else
            print_info "Logs not cleared"
        fi
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac
