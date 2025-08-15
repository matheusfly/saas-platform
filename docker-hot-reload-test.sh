#!/bin/bash

# Cross-Platform Docker Hot-Reload Test Script
# Supports Linux, macOS, and Windows (with WSL2 or Git Bash)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Function to check if Docker is running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_color $RED "❌ Docker is not installed or not in PATH"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_color $RED "❌ Docker daemon is not running"
        print_color $YELLOW "Please start Docker Desktop and try again"
        exit 1
    fi

    print_color $GREEN "✅ Docker is running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    elif docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    else
        print_color $RED "❌ docker-compose is not available"
        exit 1
    fi
    
    print_color $GREEN "✅ Using $COMPOSE_CMD"
}

# Function to detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macOS"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        OS="Windows"
    else
        OS="Unknown"
    fi
    print_color $CYAN "🖥️  Detected OS: $OS"
}

# Function to cleanup containers
cleanup() {
    print_color $YELLOW "🧹 Cleaning up containers..."
    $COMPOSE_CMD down --remove-orphans -v 2>/dev/null || true
}

# Function to start containers
start_containers() {
    print_color $BLUE "🚀 Starting Docker containers with hot-reload..."
    print_color $YELLOW "   This may take a moment on first run..."
    
    # Use the dev profile to start development containers
    $COMPOSE_CMD --profile dev up --build -d
    
    # Wait for containers to be healthy
    print_color $YELLOW "⏳ Waiting for containers to be ready..."
    sleep 10
    
    # Check container status
    if $COMPOSE_CMD ps | grep -q "Up"; then
        print_color $GREEN "✅ Containers are running"
        $COMPOSE_CMD ps
    else
        print_color $RED "❌ Failed to start containers"
        $COMPOSE_CMD logs
        exit 1
    fi
}

# Function to test hot reload
test_hot_reload() {
    print_color $MAGENTA "🔥 Starting hot-reload test..."
    
    # Run the hot reload test script
    if command -v node &> /dev/null; then
        node test-hot-reload.js
    else
        print_color $YELLOW "⚠️  Node.js not found. Manually edit components to test hot-reload."
        print_color $BLUE "Open the following URLs in your browser:"
        print_color $BLUE "• Main App: http://localhost:5173"
        print_color $BLUE "• Dashboard: http://localhost:5174"
        print_color $BLUE "• Cliente360: http://localhost:5175"
        print_color $BLUE "• Schedule Manager: http://localhost:5176"
        print_color $BLUE "• Docs: http://localhost:3000"
    fi
}

# Function to verify volumes
verify_volumes() {
    print_color $BLUE "📁 Verifying volume mounts..."
    
    # Check if the source code is properly mounted
    CONTAINER_ID=$($COMPOSE_CMD ps -q web-root | head -1)
    if [ -n "$CONTAINER_ID" ]; then
        if docker exec $CONTAINER_ID ls -la /app/App.tsx &> /dev/null; then
            print_color $GREEN "✅ Source code properly mounted in container"
        else
            print_color $RED "❌ Source code not found in container"
        fi
    fi
}

# Function to show usage instructions
show_instructions() {
    print_color $CYAN "📋 Hot-Reload Test Instructions:"
    print_color $NC "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_color $BLUE "1. 🌐 Open your browser to http://localhost:5173"
    print_color $BLUE "2. 👀 Look for hot-reload test indicators in the UI"
    print_color $BLUE "3. 📝 Edit any React component file (App.tsx, components/*.tsx)"
    print_color $BLUE "4. 💾 Save the file"
    print_color $BLUE "5. 🔄 Watch the browser automatically refresh"
    print_color $NC ""
    print_color $YELLOW "🎯 Test Points:"
    print_color $NC "• Changes should appear within 1-2 seconds"
    print_color $NC "• No manual refresh should be needed"
    print_color $NC "• Console should show HMR (Hot Module Replacement) activity"
    print_color $NC ""
    print_color $MAGENTA "🐛 Troubleshooting:"
    print_color $NC "• If hot-reload is slow, Vite polling is configured (usePolling: true)"
    print_color $NC "• Check Docker Desktop file sharing settings"
    print_color $NC "• Verify container logs: docker-compose logs web-root"
}

# Function to run the full test
run_full_test() {
    print_color $CYAN "🔥 Docker Hot-Reload Cross-Platform Test"
    print_color $NC "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    detect_os
    check_docker
    check_docker_compose
    
    # Trap to cleanup on exit
    trap cleanup EXIT
    
    cleanup
    start_containers
    verify_volumes
    show_instructions
    
    print_color $GREEN "✅ Setup complete! Test hot-reload by editing React components."
    print_color $YELLOW "Press Ctrl+C to stop containers and exit"
    
    # Keep script running and show logs
    print_color $BLUE "📊 Container logs (press Ctrl+C to stop):"
    $COMPOSE_CMD logs -f web-root
}

# Main execution
case "${1:-full}" in
    "start")
        detect_os
        check_docker
        check_docker_compose
        start_containers
        ;;
    "test")
        test_hot_reload
        ;;
    "cleanup")
        cleanup
        ;;
    "full"|*)
        run_full_test
        ;;
esac
