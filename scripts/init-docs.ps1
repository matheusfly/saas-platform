# Initialize documentation setup
Write-Host "🚀 Setting up documentation system..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 16+ and try again." -ForegroundColor Red
    exit 1
}

# Install Docusaurus dependencies
Write-Host "📦 Installing Docusaurus dependencies..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot/../docs"
npm install

# Create initial documentation structure
Write-Host "📂 Creating documentation structure..." -ForegroundColor Cyan
$docsStructure = @(
    "docs/getting-started/installation.md",
    "docs/getting-started/configuration.md",
    "docs/guides/architecture.md",
    "docs/guides/authentication.md",
    "docs/api/overview.md"
)

foreach ($doc in $docsStructure) {
    $dir = Split-Path $doc -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    if (-not (Test-Path $doc)) {
        "# $(Split-Path $doc -LeafBase)

Documentation content goes here." | Out-File -FilePath $doc -Encoding utf8NoBOM
    }
}

# Run the sync script
Write-Host "🔄 Syncing existing documentation..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot/.."
.\scripts\sync-docs.ps1

Write-Host "
🎉 Documentation setup complete!" -ForegroundColor Green
Write-Host "To start the development server:" -ForegroundColor Yellow
Write-Host "  cd docs" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host "
The documentation will be available at http://localhost:3000" -ForegroundColor Yellow
