# Development Environment Setup

This document provides instructions for setting up and using the development environment for the SaaS multi-service application.

## Prerequisites

- Docker and Docker Compose installed
- For Windows users: PowerShell 5.0 or later
- For Unix/Linux/macOS users: Make utility

## Quick Start

### Using Make (Unix/Linux/macOS)

```bash
# Show available commands
make help

# Start development services
make dev

# Run tests
make test

# Stop all services
make stop
```

### Using PowerShell (Windows)

```powershell
# Show available commands
.\scripts\dev.ps1 help

# Start development services
.\scripts\dev.ps1 dev

# Run tests
.\scripts\dev.ps1 test

# Stop all services
.\scripts\dev.ps1 stop
```

### Using Batch File (Windows CMD)

```cmd
# Show available commands
.\scripts\dev.bat help

# Start development services
.\scripts\dev.bat dev

# Run tests
.\scripts\dev.bat test

# Stop all services
.\scripts\dev.bat stop
```

## Available Commands

Both the Makefile and PowerShell script provide the same functionality:

### Core Commands

| Command | Description |
|---------|-------------|
| `help` | Show available commands and usage information |
| `dev` | Start development services with hot reload |
| `build` | Build production services |
| `test` | Run all test services (unit tests and e2e) |
| `stop` | Stop all running services |

### Extended Commands

| Command | Description |
|---------|-------------|
| `test-unit` | Run only unit tests |
| `test-e2e` | Run only e2e tests |
| `clean` | Stop services and remove containers, volumes, and images |
| `status` | Show status of all services |
| `logs` | Show logs from all services |
| `logs-dev` | Show logs from development services only |
| `logs-build` | Show logs from build services only |
| `logs-test` | Show logs from test services only |
| `restart-dev` | Restart development services |
| `health` | Check health status of services |
| `install-deps` | Install/update dependencies in all services |

### Individual Service Commands

| Command | Description |
|---------|-------------|
| `dev-web` | Start only web-root service |
| `dev-dashboard` | Start only dashboard-page service |
| `dev-cliente360` | Start only cliente360-page service |
| `dev-schedule` | Start only schedule-manager service |
| `dev-docs` | Start only docs-site service |

### Shell Access Commands

| Command | Description |
|---------|-------------|
| `shell-web` | Open shell in web-root container |
| `shell-dashboard` | Open shell in dashboard-page container |
| `shell-cliente360` | Open shell in cliente360-page container |
| `shell-schedule` | Open shell in schedule-manager container |

## Service Profiles

The application uses Docker Compose profiles to organize services:

### Development Profile (`dev`)
- **web-root**: Main application (http://localhost:5173)
- **dashboard-page**: Dashboard service (http://localhost:5174)
- **cliente360-page**: Cliente360 service (http://localhost:5175)
- **schedule-manager**: Schedule manager service (http://localhost:5176)
- **docs-site**: Documentation site (http://localhost:3000)

### Build Profile (`build`)
- **web-root-build**: Production build for web-root
- **dashboard-page-build**: Production build for dashboard-page
- **cliente360-page-build**: Production build for cliente360-page
- **schedule-manager-build**: Production build for schedule-manager

### Test Profile (`test`)
- **test-runner**: Unit test runner (Vitest)
- **e2e-runner**: End-to-end test runner (Playwright)

## Development Workflow

### 1. Initial Setup

```bash
# Unix/Linux/macOS
make install-deps
make dev

# Windows
.\scripts\dev.ps1 install-deps
.\scripts\dev.ps1 dev
```

### 2. Running Tests

```bash
# Run all tests
make test            # Unix/Linux/macOS
.\scripts\dev.ps1 test  # Windows

# Run only unit tests
make test-unit       # Unix/Linux/macOS
.\scripts\dev.ps1 test-unit  # Windows

# Run only e2e tests
make test-e2e        # Unix/Linux/macOS
.\scripts\dev.ps1 test-e2e   # Windows
```

### 3. Monitoring Services

```bash
# Check service status
make status          # Unix/Linux/macOS
.\scripts\dev.ps1 status     # Windows

# View logs
make logs            # Unix/Linux/macOS
.\scripts\dev.ps1 logs       # Windows

# View development logs only
make logs-dev        # Unix/Linux/macOS
.\scripts\dev.ps1 logs-dev   # Windows
```

### 4. Individual Service Management

```bash
# Start only specific services
make dev-web         # Unix/Linux/macOS
.\scripts\dev.ps1 dev-web    # Windows

make dev-dashboard   # Unix/Linux/macOS
.\scripts\dev.ps1 dev-dashboard  # Windows
```

### 5. Debugging

```bash
# Open shell in specific container
make shell-web       # Unix/Linux/macOS
.\scripts\dev.ps1 shell-web  # Windows

make shell-dashboard # Unix/Linux/macOS
.\scripts\dev.ps1 shell-dashboard  # Windows
```

### 6. Cleanup

```bash
# Stop services
make stop            # Unix/Linux/macOS
.\scripts\dev.ps1 stop       # Windows

# Complete cleanup (removes containers, volumes, images)
make clean           # Unix/Linux/macOS
.\scripts\dev.ps1 clean      # Windows
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 5173-5176 are not in use by other applications
2. **Docker issues**: Restart Docker Desktop if services fail to start
3. **Volume permissions**: On Linux, ensure proper file permissions for mounted volumes

### Health Checks

```bash
# Check service health
make health          # Unix/Linux/macOS
.\scripts\dev.ps1 health     # Windows
```

### Service Dependencies

The docs-site service depends on the build services. When running development services, ensure all required services are healthy before accessing the documentation.

## Environment Variables

The following environment variables are automatically set:

- `NODE_ENV`: Set to `development` for dev profile, `production` for build profile, `test` for test profile
- `VITE_PORT`: Individual port for each Vite development server
- `VITE_DEV_SERVER_HOST`: Set to `0.0.0.0` for Docker compatibility

## File Structure

```
saas/
├── Makefile                 # Unix/Linux/macOS automation
├── scripts/
│   ├── dev.ps1             # Windows PowerShell automation
│   └── dev.bat             # Windows Batch file wrapper
├── docker-compose.yml      # Main Docker Compose configuration
├── docker-compose.override.yml  # Development overrides
├── Dockerfile              # Multi-stage Dockerfile
└── DEVELOPMENT.md          # This documentation
```

## Contributing

When adding new services or modifying existing ones:

1. Update the Docker Compose configuration
2. Add corresponding targets to the Makefile
3. Add corresponding functions to the PowerShell script
4. Update this documentation

## Support

For issues with the development environment:
1. Check service logs: `make logs` or `.\scripts\dev.ps1 logs`
2. Verify service status: `make health` or `.\scripts\dev.ps1 health`
3. Try a clean restart: `make clean && make dev` or `.\scripts\dev.ps1 clean; .\scripts\dev.ps1 dev`
