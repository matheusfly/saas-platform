
## 🐳 Dockerization & Deployment Strategy

> **Purpose**: Provide a clear, incremental plan for containerising every component of the platform (marketing site, admin portal, BI dashboard, API, worker services) and deploying them across local, staging and production environments.

### 0. Index

1. Key Concepts & Terminology
2. High-Level Architecture Diagram
3. Containerisation Approach
   3.1 Base Images & Language Runtimes
   3.2 Multi-Stage Builds & Caching
   3.3 Build-time vs Run-time ENV separation
4. Development Environment (Local Docker Compose)
   4.1 Hot Reload & Volume Mounts
   4.2 Debugging inside Containers
5. Application Stacks
   5.1 Marketing Site (Next.js)
   5.2 Admin Portal / BI Dashboard (Vite + React)
   5.3 Public API (FastAPI)
   5.4 Background Workers (Celery/RQ)
6. Cross-Stack Concerns
   6.1 Shared Environment Variables & Secrets (Vault)
   6.2 Networking & Service Discovery
   6.3 Logs & Metrics Exporters
7. CI / CD Workflow
   7.1 Docker Buildx + Multi-platform Images
   7.2 GitHub Actions Matrix Build
   7.3 Tagging & Versioning Conventions
8. Deployment Targets
   8.1 Local (docker compose)
   8.2 Single-Node (Docker Swarm)
   8.3 Production (Kubernetes)
9. Roll-out Strategies
   9.1 Blue/Green & Canary Releases
   9.2 Database Migrations
   9.3 Zero-Downtime Considerations
10. Cost Optimisation Tips
11. Security Hardening
12. Roadmap & Milestones

### 1. Key Concepts & Terminology

| Term | Definition |
|------|------------|
| **Image** | Immutable snapshot produced by a Docker build. |
| **Container** | Running instance of an image with an isolated filesystem & process namespace. |
| **Multi-Stage Build** | Technique to keep final images small by copying artefacts from previous stages. |
| **Service Mesh** | Layer that handles inter-service communication, observability & security (e.g. Istio). |

### 2. High-Level Architecture Diagram *(WIP)*

```
┌────────────┐   ┌────────────────┐
│ Marketing  │   │ Admin / BI     │
│  (Next.js) │   │  Dashboard     │
└────┬───────┘   └──────┬─────────┘
     │ CDN / Edge        │
┌────▼────────┐   ┌──────▼───────┐
│  NGINX      │   │  FastAPI API │
│   Gateway   │   │   Service    │
└────┬────────┘   └──────────────┘
     │                ▲  ▲
     │                │  │
┌────▼────────┐   ┌───┴──────┐
│ PostgreSQL  │   │  Redis   │
└─────────────┘   └──────────┘
```

*Full diagram with K8s objects lives in `/docs/architecture/saas-k8s.puml`*

### 3. Containerisation Approach

#### 3.1 Base Images & Language Runtimes

* **Node 20-slim** for all JavaScript/TypeScript front-end builds.
* **python:3.12-slim** for API & workers.
* Custom *bi-dash-base* image with shared OS packages (e.g., `curl`, `git`, `tzdata`).

#### 3.2 Multi-Stage Builds & Caching

```
# Stage 1 – builder
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# Stage 2 – runtime
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

*Leverages build cache layers; final image < 50 MB.*

#### 3.3 Build-time vs Run-time ENV Separation

* Build-time: feature flags baked into static bundles (`VITE_*`).
* Run-time: secrets injected via ConfigMaps/Secrets or `docker run -e`.

### 4. Development Environment (Local Docker Compose)

```yaml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: example
    ports:
      - "5432:5432"
  api:
    build: ./services/api
    environment:
      DATABASE_URL: postgres://postgres:example@db:5432/postgres
    depends_on:
      - db
    ports:
      - "8000:8000"
  web-admin:
    build: ./apps/admin
    ports:
      - "3000:80"
```

*Hot reload enabled via `volumes` & `npm run dev` entrypoints.*

### 5. Application Stacks

#### 5.1 Marketing Site (Next.js)
* SSR / SSG build producing static assets.
* Deployed through CDN (Cloudflare Pages) or container via nginx.

#### 5.2 Admin Portal / BI Dashboard (Vite + React)
* Single Page Application served via nginx.

#### 5.3 Public API (FastAPI)
* Uvicorn workers behind NGINX ingress.

#### 5.4 Background Workers (Celery/RQ)
* Separate deployment + HPA based on queue depth.

### 6. Cross-Stack Concerns

#### 6.1 Shared Environment Variables & Secrets (Vault)
* `.env.example` maintained at repo root.
* Vault secrets synced to Kubernetes Secret objects.

#### 6.2 Networking & Service Discovery
* Docker Compose: default bridge network.
* Kubernetes: `ClusterIP` services + optional Istio sidecars.

#### 6.3 Logs & Metrics Exporters
* **Promtail** and **Grafana Loki** for logs.
* **Prometheus** + **Grafana** dashboards for metrics.

### 7. CI / CD Workflow

| Stage | Tooling | Artifact |
|-------|---------|----------|
| Build | `docker buildx` | Multi-arch images (`linux/amd64,arm64`) |
| Test  | `pytest`, `vitest` | JUnit / Coverage reports |
| Push  | GitHub Actions | `ghcr.io/org/image:sha` |
| Deploy| ArgoCD | K8s manifests Helm-templated |

### 8. Deployment Targets

| Environment | Orchestrator | Notes |
|-------------|--------------|-------|
| Dev | docker compose | Single-node, rapid feedback |
| Staging | K8s (k3s) | Mirrors prod; minimal nodes |
| Prod | K8s (EKS/GKE) | Autoscaling, multi-AZ |

### 9. Roll-out Strategies

1. **Blue / Green** for major releases.
2. **Canary** (5% → 25% → 100%) behind Istio.
3. DB migrations via `alembic` pre-hook; rollback plan documented.

### 10. Cost Optimisation Tips

* Use **alpine**/-slim images.
* Enable image layer caching in CI.
* Right-size K8s nodes; cluster-autoscaler.
* Spot instances for stateless workloads.

### 11. Security Hardening

* Non-root user in all containers.
* Image scanning with Trivy in CI.
* Network policies deny-all egress except whitelisted.
* Secrets mounted as tmpfs.

### 12. Roadmap & Milestones

| Milestone | Target Date | Description |
|-----------|------------|-------------|
| Compose-first local dev | 2025-08-20 | All services runnable with `docker compose up` |
| CI Image Build Pipeline | 2025-09-01 | Build, scan & push images on every merge to `main` |
| k3s Staging Cluster     | 2025-09-15 | Automated deployment via ArgoCD |
| Production K8s (EKS)    | 2025-10-15 | HA cluster with autoscaling |
| Istio + Canary          | 2025-11-01 | Progressive delivery |
| Cost Optimisation Pass  | 2026-01-15 | Spot, image slimming, scaling policies |

# Project Status & Roadmap

## 🚦 Current Status (2025-08-13)

### ✅ Completed Features

#### Core Platform
- [x] Project setup with Vite + React + TypeScript
- [x] Basic routing and navigation
- [x] Authentication system (JWT)
- [x] Responsive layout
- [x] Theme system with light/dark mode
- [x] Internationalization (i18n) support
- [x] Comprehensive documentation with Docusaurus

#### Business Intelligence Dashboard
- [x] Interactive chart components (Line, Bar, Pie, etc.)
- [x] Advanced data table with sorting and filtering
- [x] Dashboard creation and customization
- [x] Data source management
- [x] Query builder and SQL editor
- [x] Dashboard sharing and embedding

#### Documentation
- [x] Complete documentation site setup
- [x] User guides and API documentation
- [x] Bilingual support (en/pt-br)
- [x] Search and navigation
- [x] Versioning support

## 📊 Current Focus

### Documentation & Onboarding (Sprint 2025-08)
- [x] Finalize documentation structure
- [x] Translate key documentation to Portuguese
- [x] Create getting started guides
- [ ] Add video tutorials
- [ ] Implement interactive examples

### Core Improvements (Sprint 2025-09)
- [ ] Enhance dashboard performance
- [ ] Improve data source connection management
- [ ] Add more visualization types
- [ ] Implement scheduled reports

## 🚀 Upcoming Roadmap

### Q4 2025: Advanced Analytics
- [ ] Advanced filtering and segmentation
- [ ] Custom calculations and formulas
- [ ] Predictive analytics features
- [ ] Custom report builder

### Q1 2026: Collaboration & Sharing
- [ ] Team workspaces
- [ ] Comments and annotations
- [ ] Advanced sharing controls
- [ ] Audit logs

### Future Considerations
- [ ] Mobile app
- [ ] AI-powered insights
- [ ] Custom plugin system
- [ ] Marketplace for templates and extensions

## 📝 Documentation Status

### Current Version: v1.2.0
- [x] Updated for latest features
- [x] Bilingual support (en/pt-br)
- [x] Searchable and navigable
- [x] Versioned documentation

### Recent Updates
- 2025-08-13: Complete documentation overhaul with Docusaurus
- 2025-08-12: Added data sources and queries guide
- 2025-08-10: Updated authentication and user management docs
- 2025-08-08: Initial Portuguese translation completed

### Phase 4: Production Readiness
- [ ] Security audit
- [ ] Load testing
- [ ] Monitoring setup
- [ ] Deployment pipeline

## 📈 Performance Metrics

| Metric                  | Target       | Current | Status  |
|-------------------------|--------------|---------|---------|
| Load Time (Home)       | < 2s         | 3.2s    | ⚠️      |
| Bundle Size (gzipped)  | < 500KB      | 780KB   | ⚠️      |
| Test Coverage          | > 80%        | 45%     | ⚠️      |
| API Response Time (p95)| < 500ms      | 720ms   | ⚠️      |
| Lighthouse Score       | > 90         | 75      | ⚠️      |

## 🐛 Known Issues

### High Priority
- [ ] Memory leak in dashboard component
- [ ] Authentication token expiration not handled
- [ ] Mobile layout issues on small screens

### Medium Priority
- [ ] Form validation messages not user-friendly
- [ ] Dashboard loading state flicker
- [ ] Inconsistent error messages

### Low Priority
- [ ] Console warnings in development
- [ ] Missing loading states
- [ ] Tooltip positioning issues

## 🔄 Recent Changes

### v0.1.0 (2025-08-12)
- Initial project setup
- Basic routing and navigation
- Authentication system
- Core UI components

## 🔄 In Progress

### Current Sprint: Authentication & Core Features
- [ ] Implement password reset flow
- [ ] Add email verification
- [ ] Update user profile
- [ ] Session management

## 🏗 Technical Debt

| Description | Impact | Priority | Assigned To |
|-------------|--------|----------|-------------|
| Refactor authentication context | High | High | Team Frontend |
| Optimize bundle size | Medium | High | Team Build |
| Add missing TypeScript types | Low | Medium | Team Frontend |
| Improve test coverage | High | High | Team QA |

## 🎯 Focus Areas for Next Release

1. **Performance**
   - Code splitting
   - Lazy loading
   - Image optimization

2. **Stability**
   - Error boundaries
   - Better error handling
   - Test coverage

3. **UX Improvements**
   - Loading states
   - Form validation
   - Accessibility

## 📊 Resource Allocation

| Team Member | Role | Current Focus |
|-------------|------|---------------|
| Dev 1 | Frontend | Authentication |
| Dev 2 | Backend | API Development |
| Dev 3 | UI/UX | Component Library |
| QA 1 | Testing | Test Automation |

## 📅 Upcoming Milestones

- **v0.2.0 (2025-09-15)**: Core features complete
- **v0.3.0 (2025-10-01)**: Beta release
- **v1.0.0 (2025-11-15)**: Production release

## 📝 Notes
- All dates are estimates and subject to change
- Priorities may shift based on user feedback
- Regular sync meetings every Monday and Thursday
