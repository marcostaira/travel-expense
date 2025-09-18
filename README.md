npm # 🧳 SaaS de Gestão de Despesas de Viagem

Sistema completo e multi-tenant para gestão de despesas de viagem corporativa, com API em Node.js/NestJS e aplicativo Flutter multiplataforma.

## 📋 Funcionalidades

- **Multi-tenant**: Suporte a múltiplas empresas em uma única instalação
- **Autenticação JWT**: Login seguro com refresh tokens
- **RBAC**: Controle de acesso baseado em papéis (Admin, Gestor, Colaborador)
- **Gestão de Viagens**: Criação, aprovação e acompanhamento de viagens
- **Adiantamentos**: Solicitação e controle de cash advances
- **Lançamento de Despesas**: Captura com câmera, OCR e upload de recibos
- **Políticas de Compliance**: Validação automática de limites e regras
- **Aprovações**: Workflow de aprovação com múltiplos níveis
- **Reembolsos**: Geração automática de relatórios de reembolso
- **Offline-first**: Sincronização automática quando voltar online
- **Relatórios**: Análises de gastos, orçamento vs realizado
- **Webhooks**: Integração com sistemas externos
- **Auditoria**: Log completo de todas as operações

## 🏗️ Arquitetura

### Backend (API)
- **Framework**: NestJS + TypeScript
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: JWT + Passport.js
- **Armazenamento**: MinIO (S3-compatible)
- **Cache**: Redis
- **Email**: MailHog (dev) / SMTP (prod)
- **Documentação**: OpenAPI/Swagger

### Frontend (App)
- **Framework**: Flutter 3.16+
- **Plataformas**: Android, iOS, Web
- **Gerência de Estado**: Riverpod
- **Banco Local**: Drift/SQLite
- **HTTP**: Dio + Retrofit
- **Armazenamento Seguro**: Flutter Secure Storage

### DevOps
- **Containerização**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Migrations**: Prisma Migrate
- **Testes**: Jest (API) + Flutter Test

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- Flutter 3.16+
- Docker & Docker Compose
- PostgreSQL 15+

### 1. Clonar e Instalar
```bash
# Clonar o repositório
git clone <repo-url>
cd travel-expense-saas

# Instalar dependências
npm run setup