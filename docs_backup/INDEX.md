# 📚 Índice de Documentação / Documentation Index

<div align="center">
  <h2>Bem-vindo à Documentação da Plataforma de BI SaaS</h2>
  <h3>Welcome to the SaaS BI Platform Documentation</h3>
  
  <p>Este documento fornece uma visão geral da documentação técnica do projeto.</p>
  <p>This document provides a high-level overview of the project's technical documentation.</p>
</div>

## 📋 Sumário / Table of Contents

### 📄 Documentação Principal / Core Documentation

| Português | English | Descrição / Description |
|-----------|---------|-------------------------|
| [Visão Geral do Projeto](../README.md) | [Project Overview](../README.en.md) | Visão geral da plataforma de BI SaaS / Overview of the SaaS BI platform |
| [Fluxo de Trabalho Git](GIT_WORKFLOW.md) | [Git Workflow](GIT_WORKFLOW.md) | Padrões e fluxos de trabalho do Git / Git standards and workflows |
| [Guia do Desenvolvedor](DEVELOPER_GUIDE.md) | [Developer Guide](DEVELOPER_GUIDE.md) | Guia completo para desenvolvedores / Comprehensive developer guide |

### 🏗️ Arquitetura / Architecture

| Português | English | Descrição / Description |
|-----------|---------|-------------------------|
| [Arquitetura](ARCHITECTURE.md) | [Architecture](ARCHITECTURE.md) | Visão geral da arquitetura do sistema / System architecture overview |
| [Componentes](COMPONENTS.md) | [Components](COMPONENTS.md) | Documentação dos componentes do sistema / System components documentation |
| [Modelos de Dados](DATA_MODELS.md) | [Data Models](DATA_MODELS.md) | Estrutura e relacionamentos dos dados / Data structure and relationships |

### 🔌 API e Integração / API & Integration

| Português | English | Descrição / Description |
|-----------|---------|-------------------------|
| [Referência da API](API_REFERENCE.md) | [API Reference](API_REFERENCE.md) | Documentação completa da API / Complete API documentation |
| [Versionamento da API](API_VERSIONING.md) | [API Versioning](API_VERSIONING.md) | Estratégia de versionamento da API / API versioning strategy |

### 🚀 Implantação e Operações / Deployment & Operations

| Português | English | Descrição / Description |
|-----------|---------|-------------------------|
| [Implantação](DEPLOYMENT.md) | [Deployment](DEPLOYMENT.md) | Guia de implantação / Deployment guide |
| [Segurança](SECURITY.md) | [Security](SECURITY.md) | Políticas e práticas de segurança / Security policies and practices |

### 🧪 Qualidade / Quality

| Português | English | Descrição / Description |
|-----------|---------|-------------------------|
| [Testes](TESTING.md) | [Testing](TESTING.md) | Estratégia e guia de testes / Testing strategy and guide |

### 📅 Planejamento / Planning

| Português | English | Descrição / Description |
|-----------|---------|-------------------------|
| [Roteiro](ROADMAP.md) | [Roadmap](ROADMAP.md) | Roteiro do projeto e planejamento futuro / Project roadmap and future planning |

## 📝 Como Contribuir / How to Contribute

Contribuições são bem-vindas! Por favor, consulte nosso guia de contribuição:
Contributions are welcome! Please see our contributing guide:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Faça commit das suas alterações
4. Faça push para a branch
5. Abra um Pull Request

## Project Overview

[Full Document](../README.md)

### Key Features

- Business Intelligence Dashboard
- Real-time Data Visualization
- User Authentication & Authorization
- Responsive Design
- API-First Architecture
- Internationalization (i18n) Support
- Comprehensive Testing Suite

### Quick Links

- [Project Status](../PROJECT_STATUS.md)
- [Changelog](../CHANGELOG.md)
- [Roadmap](./ROADMAP.md)
- [API Versioning](./API_VERSIONING.md)
- [Security Guidelines](./SECURITY.md)

## API Reference

[Full Document](./API_REFERENCE.md)

### Key Features

- Comprehensive API endpoints documentation
- Authentication flow and security
- Error handling and status codes
- Rate limiting and quotas
- Webhook events and payloads

### Main Sections

- Authentication
- User Management
- Dashboard Management
- Widget Operations
- Webhooks

## Component Architecture

[Full Document](./COMPONENTS.md)

### Core Components

- Layout Structure
- Component Hierarchy
- State Management
- Form Handling
- Data Fetching
- Internationalization

### Key Patterns

- Higher-Order Components (HOCs)
- Custom Hooks
- Context API Usage
- Performance Optimization
- Error Boundaries

## Data Models & Schemas

[Full Document](./DATA_MODELS.md)

### Core Models

- **User Model**
  - User profiles and authentication
  - Role-based access control
  - User preferences

- **Client Model**
  - Client organization structure
  - Contact management
  - Deal tracking

### Database Schema

- Entity relationships
- Field definitions
- Data validation rules
- Indexing strategy

## Git Workflow

[Full Document](./GIT_WORKFLOW.md)

### Branching Strategy

- GitFlow-based workflow
- Main branches: `main`, `develop`
- Feature branches: `feature/*`
- Release and hotfix branches

### Commit Guidelines

- Conventional Commits specification
- Type prefixes (feat, fix, docs, etc.)
- Scope and description requirements
- Commit message examples

### Pull Request Process

- Branch creation and naming
- Code review requirements
- CI/CD integration
- Merge strategies

### Submodule Management

- Adding and updating submodules
- Cloning with submodules
- Best practices for submodule usage

---

## Developer Guide

[Full Document](./DEVELOPER_GUIDE.md)

### Getting Started

- Prerequisites
- Environment setup with Docker
- Installation guide
- Running the application
- Internationalization (i18n) setup

### Development Workflow

- Project structure
- Code organization
- Git workflow (see [Git Workflow](#git-workflow))
- Code review process
- CI/CD pipeline

### Advanced Configuration

- Environment variables
- Feature flags
- Performance optimization
- Security best practices

### Deployment

- Production build process
- Docker deployment
- CI/CD configuration
- Monitoring and logging

## Testing Strategy

[Full Document](./TESTING.md)

### Testing Pyramid

- Unit Tests (60%)
- Component Tests (30%)
- Integration Tests (10%)
- End-to-End Tests

### Testing Tools

- Jest
- React Testing Library
- MSW (Mock Service Worker)
- Cypress
- Storybook

### Test Coverage

- Target coverage metrics
- Continuous integration
- Performance testing
- Security testing

## Codebase Architecture

[Full Document](../backend/INTEGRATED_CODEBASE_PLAN.md)

### Project Structure

- Frontend: React with TypeScript
- Backend: Python with FastAPI
- Database: PostgreSQL with SQLAlchemy ORM
- Data Models: Comprehensive business intelligence models
- Visual Schema Tool: Database diagramming and documentation

### Key Components

- API Layer with FastAPI
- Database Migrations with Alembic
- Containerization with Docker
- Testing Strategy
- Documentation Automation

## Security

[Full Document](./SECURITY.md)

### Security Overview

- Authentication
- Authorization
- Data protection
- Compliance

### Best Practices

- Secure coding guidelines
- Dependency management
- Security headers
- Regular security audits

### Compliance
- Data protection regulations
- Security best practices
- Incident response plan

## Backend Operations

[Full Backend Documentation](../backend/backend_docs.md)
[Architecture Plan](../backend/INTEGRATED_CODEBASE_PLAN.md)

### Core Architecture

- **Framework**: FastAPI with Python 3.10+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API**: RESTful endpoints with OpenAPI documentation
- **Containerization**: Docker with multi-stage builds
- **Testing**: Pytest with 80%+ coverage target

### Key Components

#### 1. API Layer

- FastAPI application with dependency injection
- Async request handling
- Request/response validation with Pydantic
- JWT Authentication (Planned)
- Rate limiting and request validation

#### 2. Database Layer

- SQLAlchemy 2.0+ ORM
- Alembic for database migrations
- Connection pooling and session management
- Soft delete pattern implementation
- Database versioning strategy

#### 3. Service Layer

- Business logic encapsulation
- Transaction management
- Background task processing
- Caching layer (Redis planned)
- External service integrations

### Development Workflow

#### Local Development

```bash
# Start development servers
docker-compose up -d

# Run tests
pytest tests/

# Run database migrations
alembic upgrade head
```

#### CI/CD Pipeline

1. Code push triggers automated tests
2. Container image build and test
3. Staging deployment (manual approval)
4. Production deployment (scheduled)

### Performance Considerations

- Database query optimization
- Connection pooling configuration
- Caching strategy
- Background job processing
- Load balancing ready

### Monitoring & Logging

- Structured JSON logging
- Performance metrics collection
- Error tracking integration
- Health check endpoints
- Request tracing

### Security Measures

- Input validation
- SQL injection prevention
- CORS configuration
- Rate limiting
- Security headers
- JWT token validation (planned)

## 🗺️ Project Roadmap

[Full Document](./ROADMAP.md)

### Quick Links
- [Project Status](../PROJECT_STATUS.md)
- [Changelog](../CHANGELOG.md)
- [GitHub Projects](https://github.com/your-org/bi-dash/projects)

## 📊 Project Status

[Full Document](../PROJECT_STATUS.md)

### Current Focus Areas
- Core feature development
- Performance optimization
- Test coverage improvement
- Documentation updates

### Recent Updates
- Added authentication system
- Improved API documentation
- Enhanced error handling
- Updated component library

### Upcoming Features

- **Authentication System**
  - JWT-based authentication
  - Role-based access control (RBAC)
  - Multi-factor authentication (MFA)

### In Progress

- **API Development**
  - Core endpoints implementation
  - Request/response validation
  - Rate limiting and throttling

### Future Enhancements

- **Performance Optimization**
  - Database query optimization
  - Caching layer implementation
  - Background job processing

### Infrastructure

- **CI/CD Pipeline**
  - Automated testing
  - Staging environment
  - Blue-green deployment

### Documentation

- **API Documentation**
  - Interactive API docs
  - Code examples
  - Integration guides

## 🔄 Documentation Updates
This index is automatically generated. When adding or modifying documentation, please ensure to update the relevant sections in this index file.

## 📝 Contributing
For contributing to the documentation, please refer to the [Contributing Guidelines](./CONTRIBUTING.md).
