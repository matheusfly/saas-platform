# 🚀 Deployment Guide

This document provides comprehensive instructions for deploying the application in different environments.

## Table of Contents
- [Prerequisites](#-prerequisites)
- [Local Development](#-local-development)
- [Staging Environment](#-staging-environment)
- [Production Deployment](#-production-deployment)
- [Configuration Management](#-configuration-management)
- [Scaling](#-scaling)
- [Troubleshooting](#-troubleshooting)

## 🛠 Prerequisites

### Common Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+
- Python 3.9+
- PostgreSQL 13+
- Redis 6.0+

### Infrastructure Requirements
- **Development**: 4GB RAM, 2 CPU cores, 20GB storage
- **Staging**: 8GB RAM, 4 CPU cores, 50GB storage
- **Production**: 16GB+ RAM, 8+ CPU cores, 100GB+ storage

## 💻 Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/saas-platform.git
cd saas-platform
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start Services
```bash
# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend alembic upgrade head

# Seed initial data (if needed)
docker-compose exec backend python -m scripts.seed_data
```

### 4. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Database Adminer**: http://localhost:8080
- **Redis Commander**: http://localhost:8081

## 🚦 Staging Environment

### 1. Prepare the Server
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.0.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Deploy Application
```bash
# Clone repository
mkdir -p /opt/saas-platform
cd /opt/saas-platform
git clone https://github.com/your-org/saas-platform.git .

# Set up environment
cp .env.staging .env
nano .env  # Update configuration

# Start services
docker-compose -f docker-compose.staging.yml up -d --build

# Run migrations
docker-compose -f docker-compose.staging.yml exec backend alembic upgrade head
```

## 🏗 Production Deployment

### 1. Infrastructure as Code (Terraform)
```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

module "ecs_cluster" {
  source = "./modules/ecs-cluster"
  environment = "production"
  instance_type = "t3.large"
  min_size = 2
  max_size = 5
  desired_capacity = 2
}
```

### 2. CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy-prod.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_TOKEN }}
      - name: Build and push
        uses: docker/build-push-action@v3
        with:
          context: .
          push: true
          tags: your-org/saas-platform:latest
      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-definition.json
          service: saas-platform-service
          cluster: production-cluster
          wait-for-service-stability: true
```

## ⚙️ Configuration Management

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Application environment |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection URL |
| `JWT_SECRET` | Yes | - | Secret key for JWT token signing |
| `API_BASE_URL` | No | `http://localhost:8000` | Base URL for API requests |

### Feature Flags
```yaml
# config/features.yaml
features:
  enable_new_ui: false
  enable_experimental_features: false
  maintenance_mode: false
```

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale backend service
docker-compose up -d --scale backend=4

# Configure load balancer
# Example with Nginx
upstream backend {
    least_conn;
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
    server backend4:8000;
}
```

### Database Scaling
```sql
-- Set up read replicas
CREATE PUBLICATION my_publication FOR ALL TABLES;

-- On replica
CREATE SUBSCRIPTION my_subscription
CONNECTION 'host=publisher dbname=my_database user=replicator'
PUBLICATION my_publication;
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database connection
pg_isready -h localhost -p 5432

# View logs
docker-compose logs db
```

#### 2. Service Not Starting
```bash
# Check container status
docker ps -a

# View container logs
docker logs <container_id>

# Check resource usage
docker stats
```

#### 3. Performance Issues
```bash
# Check database queries
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';

# Check Redis memory usage
redis-cli info memory
```

## 🔄 Rollback Procedure

### 1. Manual Rollback
```bash
# Revert to previous version
git checkout tags/v1.2.3

# Restart services
docker-compose up -d --build
```

### 2. Automated Rollback (CI/CD)
```yaml
# .github/workflows/rollback.yml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to (e.g., v1.2.3)'
        required: true
        default: 'v1.2.3'

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Checkout specific version
        run: git checkout ${{ github.event.inputs.version }}
      - name: Deploy version
        run: |
          docker-compose down
          docker-compose up -d --build
```

## 📚 Additional Resources

- [Monitoring Setup Guide](./MONITORING.md)
- [Database Maintenance](./DATABASE_MAINTENANCE.md)
- [Security Best Practices](./SECURITY.md)
