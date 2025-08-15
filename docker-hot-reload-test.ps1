# Cross-Platform Docker Hot-Reload Test Script (PowerShell)
# Supports Windows PowerShell and PowerShell Core

param(
    [Parameter(Position=0)]
    [ValidateSet("full", "start", "test", "cleanup")]
    [string]$Action = "full"
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green" 
    Yellow = "Yellow"
    Blue = "Blue"
    Magenta = "Magenta"
    Cyan = "Cyan"
    White = "White"
}

function Write-ColorOutput($Color, $Message) {
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Test-Docker {
    Write-ColorOutput "Blue" "🔍 Checking Docker installation..."
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-ColorOutput "Red" "❌ Docker is not installed or not in PATH"
        exit 1
    }
    
    try {
        docker info 2>$null | Out-Null
        Write-ColorOutput "Green" "✅ Docker is running"
    }
    catch {
        Write-ColorOutput "Red" "❌ Docker daemon is not running"
        Write-ColorOutput "Yellow" "Please start Docker Desktop and try again"
        exit 1
    }
}

function Test-DockerCompose {
    Write-ColorOutput "Blue" "🔍 Checking Docker Compose..."
    
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        $script:ComposeCmd = "docker-compose"
    }
    elseif (docker compose version 2>$null) {
        $script:ComposeCmd = "docker compose"
    }
    else {
        Write-ColorOutput "Red" "❌ docker-compose is not available"
        exit 1
    }
    
    Write-ColorOutput "Green" "✅ Using $script:ComposeCmd"
}

function Get-OSInfo {
    $OS = "Windows"
    if ($PSVersionTable.Platform -eq "Unix") {
        if ($IsLinux) { $OS = "Linux" }
        elseif ($IsMacOS) { $OS = "macOS" }
    }
    
    Write-ColorOutput "Cyan" "🖥️  Detected OS: $OS"
    return $OS
}

function Invoke-Cleanup {
    Write-ColorOutput "Yellow" "🧹 Cleaning up containers..."
    try {
        Invoke-Expression "$script:ComposeCmd down --remove-orphans -v" 2>$null
    }
    catch {
        # Ignore cleanup errors
    }
}

function Start-Containers {
    Write-ColorOutput "Blue" "🚀 Starting Docker containers with hot-reload..."
    Write-ColorOutput "Yellow" "   This may take a moment on first run..."
    
    # Use the dev profile to start development containers
    Invoke-Expression "$script:ComposeCmd --profile dev up --build -d"
    
    # Wait for containers to be healthy
    Write-ColorOutput "Yellow" "⏳ Waiting for containers to be ready..."
    Start-Sleep -Seconds 10
    
    # Check container status
    $containerStatus = Invoke-Expression "$script:ComposeCmd ps"
    if ($containerStatus -match "Up") {
        Write-ColorOutput "Green" "✅ Containers are running"
        Write-Host $containerStatus
    }
    else {
        Write-ColorOutput "Red" "❌ Failed to start containers"
        Invoke-Expression "$script:ComposeCmd logs"
        exit 1
    }
}

function Test-HotReload {
    Write-ColorOutput "Magenta" "🔥 Starting hot-reload test..."
    
    # Run the hot reload test script
    if (Get-Command node -ErrorAction SilentlyContinue) {
        node test-hot-reload.js
    }
    else {
        Write-ColorOutput "Yellow" "⚠️  Node.js not found. Manually edit components to test hot-reload."
        Write-ColorOutput "Blue" "Open the following URLs in your browser:"
        Write-ColorOutput "Blue" "• Main App: http://localhost:5173"
        Write-ColorOutput "Blue" "• Dashboard: http://localhost:5174"
        Write-ColorOutput "Blue" "• Cliente360: http://localhost:5175"
        Write-ColorOutput "Blue" "• Schedule Manager: http://localhost:5176"
        Write-ColorOutput "Blue" "• Docs: http://localhost:3000"
    }
}

function Test-Volumes {
    Write-ColorOutput "Blue" "📁 Verifying volume mounts..."
    
    # Check if the source code is properly mounted
    try {
        $containerId = (Invoke-Expression "$script:ComposeCmd ps -q web-root").Split("`n")[0].Trim()
        if ($containerId) {
            docker exec $containerId ls -la /app/App.tsx 2>$null | Out-Null
            Write-ColorOutput "Green" "✅ Source code properly mounted in container"
        }
    }
    catch {
        Write-ColorOutput "Red" "❌ Source code not found in container"
    }
}

function Show-Instructions {
    Write-ColorOutput "Cyan" "📋 Hot-Reload Test Instructions:"
    Write-ColorOutput "White" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-ColorOutput "Blue" "1. 🌐 Open your browser to http://localhost:5173"
    Write-ColorOutput "Blue" "2. 👀 Look for hot-reload test indicators in the UI"
    Write-ColorOutput "Blue" "3. 📝 Edit any React component file (App.tsx, components/*.tsx)"
    Write-ColorOutput "Blue" "4. 💾 Save the file"
    Write-ColorOutput "Blue" "5. 🔄 Watch the browser automatically refresh"
    Write-Host ""
    Write-ColorOutput "Yellow" "🎯 Test Points:"
    Write-Host "• Changes should appear within 1-2 seconds"
    Write-Host "• No manual refresh should be needed"
    Write-Host "• Console should show HMR (Hot Module Replacement) activity"
    Write-Host ""
    Write-ColorOutput "Magenta" "🐛 Troubleshooting:"
    Write-Host "• If hot-reload is slow, Vite polling is configured (usePolling: true)"
    Write-Host "• Check Docker Desktop file sharing settings"
    Write-Host "• Verify container logs: docker-compose logs web-root"
}

function Start-FullTest {
    Write-ColorOutput "Cyan" "🔥 Docker Hot-Reload Cross-Platform Test"
    Write-ColorOutput "White" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    $OS = Get-OSInfo
    Test-Docker
    Test-DockerCompose
    
    # Setup cleanup on exit
    $cleanup = {
        Invoke-Cleanup
    }
    Register-EngineEvent PowerShell.Exiting -Action $cleanup | Out-Null
    
    try {
        Invoke-Cleanup
        Start-Containers
        Test-Volumes
        Show-Instructions
        
        Write-ColorOutput "Green" "✅ Setup complete! Test hot-reload by editing React components."
        Write-ColorOutput "Yellow" "Press Ctrl+C to stop containers and exit"
        
        # Keep script running and show logs
        Write-ColorOutput "Blue" "📊 Container logs (press Ctrl+C to stop):"
        Invoke-Expression "$script:ComposeCmd logs -f web-root"
    }
    finally {
        Invoke-Cleanup
    }
}

# Main execution
switch ($Action) {
    "start" {
        Get-OSInfo | Out-Null
        Test-Docker
        Test-DockerCompose
        Start-Containers
    }
    "test" {
        Test-HotReload
    }
    "cleanup" {
        Test-DockerCompose
        Invoke-Cleanup
    }
    default {
        Start-FullTest
    }
}
