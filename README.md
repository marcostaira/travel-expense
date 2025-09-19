# 🧳 SaaS de Gestão de Despesas de Viagem

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
```

### 2. Configurar Ambiente

```bash
# Copiar arquivos de exemplo
cp packages/api/.env.example packages/api/.env
cp packages/mobile/.env.example packages/mobile/.env

# Editar as configurações conforme necessário
```

### 3. Iniciar Infraestrutura

```bash
# Subir PostgreSQL, Redis e MinIO
npm run dev:db

# Executar migrations e seeds
npm run migrate
npm run seed
```

### 4. Iniciar API

```bash
# Desenvolvimento
npm run dev:api

# Produção
npm run build:api
cd packages/api && npm run start:prod
```

### 5. Configurar App Flutter

```bash
# Instalar dependências
cd packages/mobile
flutter pub get

# Configurar URL da API no arquivo .env
API_BASE_URL=http://localhost:3000/api/v1

# Executar no web
flutter run -d web-server --web-port 3001

# Executar no Android/iOS
flutter run
```

## 📱 Usuários de Demonstração

Após executar o seed, os seguintes usuários estarão disponíveis:

| Usuário       | Email             | Senha        | Papel         |
| ------------- | ----------------- | ------------ | ------------- |
| Admin Demo    | admin@demo.com    | Admin@123    | Administrador |
| Manager Demo  | manager@demo.com  | Manager@123  | Gestor        |
| Employee Demo | employee@demo.com | Employee@123 | Colaborador   |

**Tenant**: Demo Corp (demo@example.com)

## 🔗 URLs Importantes

- **API**: http://localhost:3000
- **Swagger**: http://localhost:3000/api/v1/docs
- **App Web**: http://localhost:3001
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **MailHog**: http://localhost:8025

## 📊 Estrutura do Projeto

```
travel-expense-saas/
├── packages/
│   ├── api/                 # Backend NestJS
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── test/
│   │   └── package.json
│   └── mobile/              # App Flutter
│       ├── lib/
│       ├── android/
│       ├── ios/
│       ├── web/
│       └── pubspec.yaml
├── docs/                    # Documentação
├── docker-compose.yml       # Infraestrutura
├── .github/workflows/       # CI/CD
└── package.json            # Workspace root
```

## 🧪 Testes

```bash
# API
npm run test:api

# App
npm run test:app

# E2E (quando disponível)
npm run test:e2e
```

## 🚀 Deploy

### Docker

```bash
# Build e deploy
docker-compose -f docker-compose.prod.yml up -d

# Executar migrations
docker-compose exec api npx prisma migrate deploy
```

### Vercel/Netlify (Web)

```bash
# Build do app web
npm run build:app

# Deploy da pasta packages/mobile/build/web
```

## 📖 Documentação

- [**API Documentation**](./docs/api.md) - Endpoints e esquemas
- [**Database Schema**](./docs/database.md) - Modelo de dados
- [**Business Rules**](./docs/business-rules.md) - Regras de negócio
- [**Deployment Guide**](./docs/deployment.md) - Guia de deployment
- [**Contributing**](./docs/contributing.md) - Como contribuir

## 🔒 Segurança

- Autenticação JWT com refresh tokens
- Rate limiting por IP e usuário
- Validação rigorosa de entrada
- Row-level security por tenant
- Hash seguro de senhas (bcrypt)
- CORS configurado
- Headers de segurança (Helmet)

## 📈 Monitoramento

- Logs estruturados (JSON)
- Health check endpoints
- Metrics com Prometheus (opcional)
- Error tracking com Sentry (opcional)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📜 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## 📞 Suporte

- **Email**: support@travelexpense.com
- **Issues**: [GitHub Issues](https://github.com/org/travel-expense-saas/issues)
- **Wiki**: [Documentação Wiki](https://github.com/org/travel-expense-saas/wiki)

---

Feito com ❤️ pela equipe Travel Expense SaaS
