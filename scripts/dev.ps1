# SaaS Multi-Service PowerShell Development Script
# Docker Compose automation for Windows users
# Equivalent to Makefile targets for cross-platform support

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Service = ""
)

function Show-Help {
    Write-Host "SaaS Multi-Service Development Script" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  help              Show this help message" -ForegroundColor Green
    Write-Host "  dev               Start development services with hot reload" -ForegroundColor Green
    Write-Host "  build             Build production services" -ForegroundColor Green
    Write-Host "  test              Run test services (unit tests and e2e)" -ForegroundColor Green
    Write-Host "  test-unit         Run only unit tests" -ForegroundColor Green
    Write-Host "  test-e2e          Run only e2e tests" -ForegroundColor Green
    Write-Host "  stop              Stop all running services" -ForegroundColor Green
    Write-Host "  clean             Stop services and remove containers, volumes, and images" -ForegroundColor Green
    Write-Host "  status            Show status of all services" -ForegroundColor Green
    Write-Host "  logs              Show logs from all services" -ForegroundColor Green
    Write-Host "  logs-dev          Show logs from development services only" -ForegroundColor Green
    Write-Host "  logs-build        Show logs from build services only" -ForegroundColor Green
    Write-Host "  logs-test         Show logs from test services only" -ForegroundColor Green
    Write-Host "  restart-dev       Restart development services" -ForegroundColor Green
    Write-Host "  health            Check health status of services" -ForegroundColor Green
    Write-Host "  install-deps      Install/update dependencies in all services" -ForegroundColor Green
    Write-Host ""
    Write-Host "Individual service commands:" -ForegroundColor Yellow
    Write-Host "  dev-web           Start only web-root service" -ForegroundColor Green
    Write-Host "  dev-dashboard     Start only dashboard-page service" -ForegroundColor Green
    Write-Host "  dev-cliente360    Start only cliente360-page service" -ForegroundColor Green
    Write-Host "  dev-schedule      Start only schedule-manager service" -ForegroundColor Green
    Write-Host "  dev-docs          Start only docs-site service" -ForegroundColor Green
    Write-Host ""
    Write-Host "Shell access commands:" -ForegroundColor Yellow
    Write-Host "  shell-web         Open shell in web-root container" -ForegroundColor Green
    Write-Host "  shell-dashboard   Open shell in dashboard-page container" -ForegroundColor Green
    Write-Host "  shell-cliente360  Open shell in cliente360-page container" -ForegroundColor Green
    Write-Host "  shell-schedule    Open shell in schedule-manager container" -ForegroundColor Green
    Write-Host ""
    Write-Host "Profiles available:" -ForegroundColor Yellow
    Write-Host "  dev   - Development services (web-root, dashboard-page, cliente360-page, schedule-manager, docs-site)" -ForegroundColor Cyan
    Write-Host "  build - Production build services" -ForegroundColor Cyan
    Write-Host "  test  - Test runner services (unit tests and e2e tests)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage examples:" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 dev               # Start development services" -ForegroundColor Gray
    Write-Host "  .\dev.ps1 test              # Run all tests" -ForegroundColor Gray
    Write-Host "  .\dev.ps1 stop              # Stop all services" -ForegroundColor Gray
}

function Start-DevServices {
    Write-Host "Starting development services..." -ForegroundColor Yellow
    docker compose --profile dev up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Development services started!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Services available at:" -ForegroundColor Cyan
        Write-Host "  Web Root: http://localhost:5173" -ForegroundColor White
        Write-Host "  Dashboard: http://localhost:5174" -ForegroundColor White
        Write-Host "  Cliente360: http://localhost:5175" -ForegroundColor White
        Write-Host "  Schedule Manager: http://localhost:5176" -ForegroundColor White
        Write-Host "  Documentation: http://localhost:3000" -ForegroundColor White
    } else {
        Write-Host "Failed to start development services!" -ForegroundColor Red
    }
}

function Start-BuildServices {
    Write-Host "Building production services..." -ForegroundColor Yellow
    docker compose --profile build up --build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Production build completed!" -ForegroundColor Green
    } else {
        Write-Host "Production build failed!" -ForegroundColor Red
    }
}

function Start-TestServices {
    Write-Host "Running test services..." -ForegroundColor Yellow
    docker compose --profile test up --build --abort-on-container-exit
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Tests completed!" -ForegroundColor Green
    } else {
        Write-Host "Tests failed!" -ForegroundColor Red
    }
}

function Start-UnitTests {
    Write-Host "Running unit tests..." -ForegroundColor Yellow
    docker compose run --rm test-runner
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Unit tests completed!" -ForegroundColor Green
    } else {
        Write-Host "Unit tests failed!" -ForegroundColor Red
    }
}

function Start-E2ETests {
    Write-Host "Running e2e tests..." -ForegroundColor Yellow
    docker compose run --rm e2e-runner
    if ($LASTEXITCODE -eq 0) {
        Write-Host "E2E tests completed!" -ForegroundColor Green
    } else {
        Write-Host "E2E tests failed!" -ForegroundColor Red
    }
}

function Stop-AllServices {
    Write-Host "Stopping all services..." -ForegroundColor Yellow
    docker compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "All services stopped!" -ForegroundColor Green
    } else {
        Write-Host "Failed to stop some services!" -ForegroundColor Red
    }
}

function Clean-Services {
    Write-Host "Cleaning up containers, volumes, and images..." -ForegroundColor Yellow
    docker compose down -v --rmi local
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Cleanup completed!" -ForegroundColor Green
    } else {
        Write-Host "Cleanup encountered some issues!" -ForegroundColor Red
    }
}

function Show-Status {
    Write-Host "Service status:" -ForegroundColor Cyan
    docker compose ps
}

function Show-Logs {
    docker compose logs -f
}

function Show-DevLogs {
    docker compose --profile dev logs -f
}

function Show-BuildLogs {
    docker compose --profile build logs -f
}

function Show-TestLogs {
    docker compose --profile test logs -f
}

function Restart-DevServices {
    Write-Host "Restarting development services..." -ForegroundColor Yellow
    docker compose --profile dev restart
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Development services restarted!" -ForegroundColor Green
    } else {
        Write-Host "Failed to restart development services!" -ForegroundColor Red
    }
}

function Show-Health {
    Write-Host "Health check status:" -ForegroundColor Cyan
    docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
}

function Install-Dependencies {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    docker compose --profile dev build --no-cache
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Dependencies updated!" -ForegroundColor Green
    } else {
        Write-Host "Failed to update dependencies!" -ForegroundColor Red
    }
}

function Start-IndividualService {
    param([string]$ServiceName)
    Write-Host "Starting $ServiceName service..." -ForegroundColor Yellow
    docker compose up -d $ServiceName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$ServiceName service started!" -ForegroundColor Green
    } else {
        Write-Host "Failed to start $ServiceName service!" -ForegroundColor Red
    }
}

function Open-ServiceShell {
    param([string]$ServiceName)
    Write-Host "Opening shell in $ServiceName container..." -ForegroundColor Yellow
    docker compose exec $ServiceName sh
}

# Main command dispatcher
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "dev" { Start-DevServices }
    "build" { Start-BuildServices }
    "test" { Start-TestServices }
    "test-unit" { Start-UnitTests }
    "test-e2e" { Start-E2ETests }
    "stop" { Stop-AllServices }
    "clean" { Clean-Services }
    "status" { Show-Status }
    "logs" { Show-Logs }
    "logs-dev" { Show-DevLogs }
    "logs-build" { Show-BuildLogs }
    "logs-test" { Show-TestLogs }
    "restart-dev" { Restart-DevServices }
    "health" { Show-Health }
    "install-deps" { Install-Dependencies }
    
    # Individual services
    "dev-web" { Start-IndividualService "web-root" }
    "dev-dashboard" { Start-IndividualService "dashboard-page" }
    "dev-cliente360" { Start-IndividualService "cliente360-page" }
    "dev-schedule" { Start-IndividualService "schedule-manager" }
    "dev-docs" { Start-IndividualService "docs-site" }
    
    # Shell access
    "shell-web" { Open-ServiceShell "web-root" }
    "shell-dashboard" { Open-ServiceShell "dashboard-page" }
    "shell-cliente360" { Open-ServiceShell "cliente360-page" }
    "shell-schedule" { Open-ServiceShell "schedule-manager" }
    
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host "Use 'help' to see available commands." -ForegroundColor Yellow
        Show-Help
    }
}
