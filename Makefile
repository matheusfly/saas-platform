# SaaS Multi-Service Makefile
# Docker Compose automation for development, build, test, and service management

.PHONY: help dev build test stop clean status logs

# Default target
help: ## Show this help message
	@echo "Available targets:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Profiles available:"
	@echo "  dev   - Development services (web-root, dashboard-page, cliente360-page, schedule-manager, docs-site)"
	@echo "  build - Production build services"
	@echo "  test  - Test runner services (unit tests and e2e tests)"

dev: ## Start development services with hot reload
	@echo "Starting development services..."
	docker compose --profile dev up -d
	@echo "Development services started!"
	@echo "Services available at:"
	@echo "  Web Root: http://localhost:5173"
	@echo "  Dashboard: http://localhost:5174"
	@echo "  Cliente360: http://localhost:5175"
	@echo "  Schedule Manager: http://localhost:5176"
	@echo "  Documentation: http://localhost:3000"

build: ## Build production services
	@echo "Building production services..."
	docker compose --profile build up --build
	@echo "Production build completed!"

test: ## Run test services (unit tests and e2e)
	@echo "Running test services..."
	docker compose --profile test up --build --abort-on-container-exit
	@echo "Tests completed!"

test-unit: ## Run only unit tests
	@echo "Running unit tests..."
	docker compose run --rm test-runner
	@echo "Unit tests completed!"

test-e2e: ## Run only e2e tests
	@echo "Running e2e tests..."
	docker compose run --rm e2e-runner
	@echo "E2E tests completed!"

stop: ## Stop all running services
	@echo "Stopping all services..."
	docker compose down
	@echo "All services stopped!"

clean: ## Stop services and remove containers, volumes, and images
	@echo "Cleaning up containers, volumes, and images..."
	docker compose down -v --rmi local
	@echo "Cleanup completed!"

status: ## Show status of all services
	@echo "Service status:"
	docker compose ps

logs: ## Show logs from all services
	docker compose logs -f

logs-dev: ## Show logs from development services only
	docker compose --profile dev logs -f

logs-build: ## Show logs from build services only
	docker compose --profile build logs -f

logs-test: ## Show logs from test services only
	docker compose --profile test logs -f

restart-dev: ## Restart development services
	@echo "Restarting development services..."
	docker compose --profile dev restart
	@echo "Development services restarted!"

health: ## Check health status of services
	@echo "Health check status:"
	@docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Individual service management
dev-web: ## Start only web-root service
	docker compose up -d web-root

dev-dashboard: ## Start only dashboard-page service
	docker compose up -d dashboard-page

dev-cliente360: ## Start only cliente360-page service
	docker compose up -d cliente360-page

dev-schedule: ## Start only schedule-manager service
	docker compose up -d schedule-manager

dev-docs: ## Start only docs-site service
	docker compose up -d docs-site

# Utility targets
shell-web: ## Open shell in web-root container
	docker compose exec web-root sh

shell-dashboard: ## Open shell in dashboard-page container
	docker compose exec dashboard-page sh

shell-cliente360: ## Open shell in cliente360-page container
	docker compose exec cliente360-page sh

shell-schedule: ## Open shell in schedule-manager container
	docker compose exec schedule-manager sh

install-deps: ## Install/update dependencies in all services
	@echo "Installing dependencies..."
	docker compose --profile dev build --no-cache
	@echo "Dependencies updated!"

# CI/CD and advanced targets
ci: ## Run full CI pipeline (build + test)
	@echo "Running CI pipeline..."
	docker compose -f .compose.ci.yaml up --build --abort-on-container-exit
	@echo "CI pipeline completed!"

smoke: ## Local smoke test - build everything and run tests
	@echo "Running smoke tests..."
	docker compose --profile build,test up --build --abort-on-container-exit
	@echo "Smoke tests completed!"

build-fast: ## Build with BuildKit for faster builds
	@echo "Building with BuildKit..."
	DOCKER_BUILDKIT=1 docker compose --profile build up --build --abort-on-container-exit
	@echo "Fast build completed!"

clean-deep: ## Deep clean - remove all caches, volumes, and images
	@echo "Performing deep cleanup..."
	docker compose -f .compose.ci.yaml down --volumes --remove-orphans
	docker compose down --volumes --remove-orphans
	docker system prune -af --volumes
	@echo "Deep cleanup completed!"

# Development utilities with corepack
setup-node: ## Setup Node.js version and enable corepack
	@echo "Setting up Node.js environment..."
	@if command -v nvm >/dev/null 2>&1; then \
		nvm use; \
	else \
		echo "NVM not found. Please ensure Node.js 20.12.2 is installed."; \
	fi
	@corepack enable
	@echo "Node.js environment setup completed!"
