# 🛣️ Roadmap Geral (2025-2026)

> Documento complementar ao `PROJECT_STATUS.md` — consulte-o para detalhes diários de sprint.

## 📅 Linha do Tempo de Releases

| Data Alvo | Versão | Entregas Principais |
|-----------|--------|---------------------|
| 2025-09-15 | **v0.2.0** | Core Features concluídas (CRUD completo, RBAC, Dashboard básico) |
| 2025-10-01 | **v0.3.0** | Beta pública + Telemetria básica |
| 2025-11-15 | **v1.0.0** | Lançamento de Produção + Cluster K8s em HA |
| 2026-01-15 | **v1.1.0** | Otimização de Custos + Progressive Delivery (Istio Canary) |
| 2026-03-30 | **v1.2.0** | Módulo de Analytics Avançado + Marketplace de Templates |

## 🔨 Em Andamento

- Dockerização completa dos serviços (ver seção "🐳 Estratégia de Dockerização" abaixo).
- Tradução de 100% da documentação PT-BR ⇄ EN.
- Otimizações de performance do dashboard (code splitting & lazy loading).

## 🚀 Próximos Marcos

1. **Integração CI Image Build** — pipeline GitHub Actions + Trivy scan.
2. **Cluster k3s de Staging** — deploy automático via ArgoCD.
3. **Feature Flags** — usando `Unleash` server.
4. **Relatórios Agendados** — jobs Celery.

## ✅ Concluído

- Configuração inicial do Monorepo (Turborepo + PNPM).
- Setup do Docusaurus + versão multilíngue.
- Autenticação JWT + refresh token.

---

## 🐳 Estratégia de Dockerização & Deploy

| Fase | Objetivo | Status |
|------|----------|--------|
| 1 | Arquivos `Dockerfile` individuais por serviço | ✅ Concluído |
| 2 | Ambiente local `docker compose` com hot-reload | 🟡 Em andamento |
| 3 | Build multi-plataforma (`linux/amd64,arm64`) | ⚪ Agendado |
| 4 | Staging em k3s + auto-deploy | ⚪ Agendado |
| 5 | Prod em EKS/GKE + Istio | ⚪ Agendado |

Detalhes completos em `PROJECT_STATUS.md` → seção **Dockerization & Deployment Strategy**.

---

## 📚 Estratégia de Documentação

- **Docusaurus** hospedado em Cloudflare Pages.
- **Exemplos interativos** com StackBlitz (previsto para v0.3.0).
- Tutoriais em vídeo curtos (YouTube playlist) — roteiro em criação.
- Docs de API geradas via **OpenAPI** + `redocly`.

Referencie sempre a pasta `/docs` para o material mais recente.

---

## 🔗 Referências Rápidas

- Roadmap detalhado em inglês: [`PROJECT_STATUS.md`](../../PROJECT_STATUS.md)
- Estratégia de Deploy PlantUML: [`docs/architecture/saas-k8s.puml`](../../docs/architecture/saas-k8s.puml)
- Documentação pública: https://docs.example.com
