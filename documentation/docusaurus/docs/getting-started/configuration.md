---
title: Configuration
description: Configure your SaaS BI Platform installation
---

# Configuration Guide

This guide will help you configure your SaaS BI Platform installation to suit your needs.

## Environment Variables

The application is configured using environment variables. Here are the main configuration options:

### Database Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `saas_platform` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | - |

### Redis Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |

### Application Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development` |
| `PORT` | Application port | `3000` |
| `JWT_SECRET` | JWT secret key | - |
| `API_BASE_URL` | Base URL for API requests | `http://localhost:3000` |

## Configuration Files

### .env

The main configuration file is `.env` in the root directory. You can copy the example file:

```bash
cp .env.example .env
```

### config/

Additional configuration files are located in the `config/` directory:

- `config/database.js` - Database configuration
- `config/redis.js` - Redis configuration
- `config/server.js` - Server configuration

## Environment-Specific Configuration

You can create environment-specific configuration files:

- `.env.development` - For development
- `.env.test` - For testing
- `.env.production` - For production

## Best Practices

1. Never commit sensitive information to version control
2. Use environment variables for all configuration
3. Keep development and production configurations separate
4. Use strong secrets for production environments

## Next Steps

- [Installation Guide](/docs/getting-started/installation)
- [Quick Start Guide](/docs/getting-started/quickstart)
