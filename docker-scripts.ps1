# Docker management scripts for SAAS project

# Build all stages
function Build-All {
    Write-Host "Building all Docker stages..." -ForegroundColor Green
    
    # Build deps stage
    docker build --target deps -t saas-home:deps .
    
    # Build dev stage
    docker build --target dev -t saas-home:dev .
    
    # Build prod stage  
    docker build --target prod -t saas-home:prod .
    
    Write-Host "All stages built successfully!" -ForegroundColor Green
}

# Development mode
function Start-Dev {
    Write-Host "Starting development environment..." -ForegroundColor Green
    docker-compose up dev
}

# Build and preview production
function Start-Preview {
    Write-Host "Building for production and starting preview..." -ForegroundColor Green
    docker-compose up --build build preview
}

# Run tests
function Run-Tests {
    Write-Host "Running unit tests..." -ForegroundColor Green
    docker-compose run --rm test
}

# Run E2E tests
function Run-E2ETests {
    Write-Host "Running E2E tests..." -ForegroundColor Green
    docker-compose run --rm test-e2e
}

# Clean up Docker resources
function Clean-Docker {
    Write-Host "Cleaning up Docker resources..." -ForegroundColor Yellow
    docker-compose down --rmi all --volumes --remove-orphans
    docker system prune -f
    Write-Host "Docker cleanup completed!" -ForegroundColor Green
}

# Export built artifacts
function Export-Build {
    param(
        [string]$OutputPath = "./build-output"
    )
    
    Write-Host "Exporting build artifacts to $OutputPath..." -ForegroundColor Green
    
    # Build production image
    docker build --target prod -t saas-home:prod .
    
    # Create container and copy dist folder
    $containerId = docker create saas-home:prod
    docker cp "${containerId}:/app/dist" $OutputPath
    docker rm $containerId
    
    Write-Host "Build artifacts exported to $OutputPath!" -ForegroundColor Green
}

# Show usage
function Show-Help {
    Write-Host "SAAS Docker Management Scripts" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor White
    Write-Host "  Build-All        - Build all Docker stages" -ForegroundColor Yellow
    Write-Host "  Start-Dev        - Start development environment with hot reload" -ForegroundColor Yellow
    Write-Host "  Start-Preview    - Build and preview production build" -ForegroundColor Yellow
    Write-Host "  Run-Tests        - Run unit tests in container" -ForegroundColor Yellow
    Write-Host "  Run-E2ETests     - Run E2E tests in container" -ForegroundColor Yellow
    Write-Host "  Export-Build     - Export production build artifacts" -ForegroundColor Yellow
    Write-Host "  Clean-Docker     - Clean up all Docker resources" -ForegroundColor Yellow
    Write-Host "  Show-Help        - Show this help message" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  Build-All" -ForegroundColor Gray
    Write-Host "  Start-Dev" -ForegroundColor Gray
    Write-Host "  Export-Build -OutputPath './my-build'" -ForegroundColor Gray
}

# Export functions
Export-ModuleMember -Function Build-All, Start-Dev, Start-Preview, Run-Tests, Run-E2ETests, Export-Build, Clean-Docker, Show-Help
