# Docker Setup Guide

This project includes a comprehensive Docker setup with multi-stage builds optimized for Node.js development.

## Prerequisites

1. **Docker Desktop** - Install and start Docker Desktop
2. **Node.js 20+** - For local development (optional if using Docker only)

## Project Structure

```
├── Dockerfile                 # Multi-stage build configuration
├── docker-compose.yml         # Development and production services  
├── docker-compose.override.yml # Development overrides
├── .dockerignore              # Files to exclude from Docker context
├── docker-scripts.ps1         # PowerShell management scripts
└── DOCKER.md                  # This guide
```

## Docker Stages

### Stage 1: Dependencies (`deps`)
- Base: `node:20-alpine`
- Installs npm dependencies with `npm ci`
- Optimized for caching

### Stage 2: Development (`dev`)
- Inherits from `deps`
- Copies source code
- Configurable command via build arg
- Default: `npm run dev`

### Stage 3: Production (`prod`)
- Inherits from `dev`
- Builds the application with `npm run build`
- Exposes `/dist` volume for deployment

## Quick Start

### Method 1: Using PowerShell Scripts

```powershell
# Load the management functions
. .\docker-scripts.ps1

# Show available commands
Show-Help

# Build all stages
Build-All

# Start development environment
Start-Dev

# Run tests
Run-Tests

# Build and preview production
Start-Preview

# Export build artifacts
Export-Build -OutputPath "./my-build"

# Clean up everything
Clean-Docker
```

### Method 2: Using Docker Compose Directly

```bash
# Development with hot reload
docker-compose up dev

# Production build
docker-compose up --build build

# Run tests
docker-compose run --rm test

# Run E2E tests  
docker-compose run --rm test-e2e

# Preview production build
docker-compose up --build preview
```

### Method 3: Using Docker Directly

```bash
# Build dependency stage
docker build --target deps -t saas-home:deps .

# Build development stage
docker build --target dev -t saas-home:dev .

# Build production stage
docker build --target prod -t saas-home:prod .

# Run development
docker run -p 5173:5173 -v "${PWD}:/app" -v "/app/node_modules" saas-home:dev

# Run production build
docker run saas-home:prod

# Extract built files
docker create --name temp saas-home:prod
docker cp temp:/app/dist ./dist
docker rm temp
```

## Environment Variables

### Development
- `NODE_ENV=development`
- `VITE_DEV_SERVER_HOST=0.0.0.0`
- `VITE_DEV_SERVER_PORT=5173`

### Production
- `NODE_ENV=production`

### Testing
- `NODE_ENV=test`

## Port Mappings

- **5173** - Vite development server
- **4173** - Vite preview server

## Volume Mappings

### Development
- `.:/app` - Source code hot reload
- `/app/node_modules` - Prevent host override

### Production
- `./dist:/app/dist` - Build output

## Optimization Features

1. **Layer Caching** - Dependencies installed separately from source
2. **Multi-stage** - Separate stages for different environments
3. **Alpine Base** - Minimal image size
4. **Lock File** - Reproducible builds with `package-lock.json`
5. **Build Args** - Configurable commands
6. **Dockerignore** - Excludes unnecessary files

## Development Workflow

1. **Start Development**
   ```powershell
   Start-Dev
   ```
   - Starts Vite dev server with hot reload
   - Available at http://localhost:5173

2. **Run Tests**
   ```powershell
   Run-Tests
   ```
   - Runs unit tests with Vitest

3. **E2E Testing**
   ```powershell
   Run-E2ETests  
   ```
   - Installs Playwright and runs E2E tests

4. **Production Preview**
   ```powershell
   Start-Preview
   ```
   - Builds production version and serves it
   - Available at http://localhost:4173

## Build Customization

### Custom Commands
```bash
# Custom dev command
docker build --target dev --build-arg CMD="npm run dev:custom" -t saas-home:dev .

# Custom production build
docker build --target prod --build-arg BUILD_ENV=staging -t saas-home:staging .
```

### Environment-specific Builds
```bash
# Development build
docker-compose -f docker-compose.yml -f docker-compose.override.yml up dev

# Production build (no override)
docker-compose -f docker-compose.yml up build
```

## Troubleshooting

For comprehensive troubleshooting including common issues and fixes, see:
**[Docker Troubleshooting Guide](docs/developer-handbook/docker-troubleshooting.md)**

### Quick Fixes

#### Docker Desktop Not Running
```
ERROR: error during connect: Head "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/_ping"
```
**Solution**: Start Docker Desktop application

#### Port Conflicts
```
Error starting userland proxy: listen tcp4 0.0.0.0:5173: bind: address already in use
```
**Solution**: Check what's using the port with `netstat -ano | findstr ":5173"`, then either kill the process or change the port mapping in docker-compose.yml

#### Service Dependencies
```
service "docs-site" depends on undefined service "dashboard-page-build": invalid compose project
```
**Solution**: Run with correct profiles: `docker compose --profile dev --profile build up`

#### Container Exits Immediately
Check logs with `docker compose logs <service>` and verify the command is correct in Dockerfile

## Production Deployment

### Extract Build Artifacts
```powershell
Export-Build -OutputPath "./production-build"
```

### Copy to Web Server
```bash
# Example with nginx
docker build --target prod -t saas-home:prod .
docker run --rm -v "./nginx-html:/output" saas-home:prod sh -c "cp -r /app/dist/* /output/"
```

### Use with CI/CD
```yaml
# Example GitHub Actions
- name: Build Docker Image
  run: docker build --target prod -t ${{ github.repository }}:${{ github.sha }} .
  
- name: Extract Build
  run: |
    docker create --name temp ${{ github.repository }}:${{ github.sha }}
    docker cp temp:/app/dist ./dist
    docker rm temp
```

## Maintenance

### Regular Cleanup
```powershell
Clean-Docker
```

### Update Dependencies
```bash
# Rebuild with latest packages
docker-compose build --no-cache dev
```

### Monitor Resources
```bash
docker stats
docker system df
```

## Performance Tips

1. **Use BuildKit** - Enable Docker BuildKit for faster builds
2. **Cache Layers** - Order Dockerfile commands by change frequency  
3. **Multi-stage** - Only include necessary artifacts in final image
4. **Volume Mounting** - Use volumes for development hot reload
5. **Resource Limits** - Set memory/CPU limits in compose files

## Security Considerations

1. **Non-root User** - Alpine images run as non-root by default
2. **Minimal Base** - Alpine provides smaller attack surface
3. **Lock Files** - Prevent dependency tampering
4. **Secrets** - Use Docker secrets for sensitive data
5. **Network Isolation** - Use custom networks for service isolation
