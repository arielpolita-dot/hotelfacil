# CLAUDE.md — Hotel Facil

## Central Knowledge Base
Shared knowledge across all Claude instances lives in `~/Documents/00-claude-knowledge/`:
- `CLAUDE.md` — Global directives
- `memory.md` — Persistent memory. **Update after every significant task.**
- `projects.md` — Project registry with stacks and conventions

## Project Stack
- **App name**: Hotel Facil (Sistema de Gestao Hoteleira)
- **Frontend**: React 19 + Vite 6 + JavaScript/JSX (NOT TypeScript)
- **Styling**: Tailwind CSS 4 + shadcn/ui (Radix UI)
- **Database**: Firebase Firestore (NoSQL, multi-tenant)
- **Auth**: Firebase Authentication (email/password)
- **Storage**: Google Cloud Storage
- **Analytics**: Google Analytics 4
- **Hosting**: Firebase Hosting
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Package Manager**: pnpm
- **Firebase Project**: hotelfacil-850d1

## Architecture
- **Pattern**: SPA (Single Page Application) — NO backend server
- **State**: React Context API (AuthContext, HotelFirestoreContext)
- **Data Access**: Firestore real-time listeners (onSnapshot)
- **Multi-Tenant**: `/empresas/{empresaId}/` collection structure
- **Routing**: React Router DOM 7 (12 protected routes)

## Firestore Collections (under /empresas/{id}/)
- `dados_empresa` — Company info (CNPJ, address, configs)
- `quartos` — Room inventory
- `hospedes` — Guest records
- `reservas` — Bookings (subcollection by date)
- `contratos_corporativos` — Corporate contracts
- `faturas` — Invoices
- `despesas` — Expenses (12 categories)
- `fluxo_caixa` — Cash flow ledger
- `usuarios` — Users with permissions & roles
- `configuracoes_hotel` — Hotel settings
- `fornecedores` — Suppliers

## Pages (12)
Dashboard, Disponibilidade, Quartos, Vendas, Faturas, Despesas, Usuarios, FluxoCaixa, DRE, Configuracoes, Fornecedores, AdminPanel

## Security
- Firestore Security Rules (role-based: Admin, Gerente, Financeiro)
- Firebase Auth with company-scoped access
- Trial status per company

## Conventions
- **UI Library**: shadcn/ui (Radix primitives)
- **Path aliases**: `@/*` → `src/*` (jsconfig.json)
- **Language**: Portuguese (BR) throughout
- **Never hardcode data** — all from Firestore

## Development
- `pnpm dev` — Vite dev server
- `pnpm build` — Production build
- Deploy: `firebase deploy` (Hosting)

## Infrastructure Config

---

## Servidor

| Campo | Valor |
|-------|-------|
| **Nome** | Hetzner VPS — OEntregador/OHospedeiro |
| **IP** | `178.156.220.246` |
| **SSH** | `ssh root@178.156.220.246` |
| **OS** | Ubuntu (kernel 6.8.0-79-generic) |
| **RAM** | 7.6 GB |
| **Disco** | 150 GB NVMe |
| **Coolify URL** | https://server.oentregador.com.br |
| **Coolify Projeto** | OHospedeiro (UUID: `nnpg94yjpdn1io9kspuoko8b`) |
| **Coolify Environment** | production (UUID: `dmdk6jyouq3li81k3zex4vja`) |

---

## Servicos no Coolify

### PostgreSQL 17

| Campo | Valor |
|-------|-------|
| **UUID** | `j10091rlz24bbq717necpte1` |
| **Container** | `j10091rlz24bbq717necpte1` |
| **Host interno** | `j10091rlz24bbq717necpte1` |
| **Porta** | 5432 (internal only) |
| **Database** | `ohospedeiro` |
| **Usuario** | `ohospedeiro` |
| **Senha** | `OH_pg_2026_secure!` |
| **URL interna** | `postgres://ohospedeiro:OH_pg_2026_secure%21@j10091rlz24bbq717necpte1:5432/ohospedeiro` |
| **Publico** | NAO — apenas rede Docker interna |

### Redis 7

| Campo | Valor |
|-------|-------|
| **UUID** | `h2133wf017ty3lh8s6cgu56e` |
| **Container** | `h2133wf017ty3lh8s6cgu56e` |
| **Host interno** | `h2133wf017ty3lh8s6cgu56e` |
| **Porta** | 6379 (internal only) |
| **Senha** | `OH_redis_2026!` |
| **URL interna** | `redis://default:OH_redis_2026%21@h2133wf017ty3lh8s6cgu56e:6379/0` |
| **Publico** | NAO — apenas rede Docker interna |
| **Nota** | Opcional para fase inicial. Usado para cache e sessions futuras. |

### Backend NestJS

| Campo | Valor |
|-------|-------|
| **UUID** | `j20mi1qlrbombayarhgoscg9` |
| **Container** | `j20mi1qlrbombayarhgoscg9` |
| **Repo** | `https://github.com/arielpolita-dot/hotelfacil` |
| **Branch** | `main` |
| **Base directory** | `/backend` |
| **Dockerfile** | `/Dockerfile` (relativo ao base_directory) |
| **Porta** | 8000 |
| **Dominio** | `https://api-ohospedeiro.oentregador.com.br` |
| **Health check** | `/health` |

---

## DNS (Cloudflare)

| Tipo | Nome | Destino | Proxy |
|------|------|---------|-------|
| A | `api-ohospedeiro.oentregador.com.br` | `178.156.220.246` | Proxied |
| CNAME | `app-ohospedeiro.oentregador.com.br` | Amplify | DNS only |

---

## Frontend (AWS Amplify)

| Campo | Valor |
|-------|-------|
| **Hosting** | AWS Amplify |
| **App ID** | `dq20t12et9vm2` |
| **Default Domain** | `dq20t12et9vm2.amplifyapp.com` |
| **Repo** | `https://github.com/arielpolita-dot/hotelfacil` |
| **Branch** | `main` |
| **App root** | `/` (raiz, SPA React) |
| **Dominio** | `https://app-ohospedeiro.oentregador.com.br` |
| **Build** | pnpm install → pnpm build → dist/ |
| **SPA Rewrite** | Configurado (todas rotas → index.html) |
| **Firebase** | Temporario — frontend usa Firestore enquanto VITE_USE_API=false |
| **Para ativar Postgres** | Mudar VITE_USE_API=true no Amplify |

---

## Environment Variables (Backend — Coolify)

```
PORT=8000
NODE_ENV=production
CORS_ORIGIN=https://app-ohospedeiro.oentregador.com.br
DATABASE_HOST=j10091rlz24bbq717necpte1
DATABASE_PORT=5432
DATABASE_NAME=ohospedeiro
DATABASE_USER=ohospedeiro
DATABASE_PASSWORD=OH_pg_2026_secure!
REDIS_HOST=h2133wf017ty3lh8s6cgu56e
REDIS_PORT=6379
JWT_SECRET=(gerado — ver Coolify)
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=(gerado — ver Coolify)
JWT_REFRESH_EXPIRATION=7d
AUTHIFY_URL=https://auth.ohanax.com
AUTHIFY_FRONTEND_URL=https://auth.ohanax.com
AUTHIFY_API_KEY=ak_d30b2d4f5740d8a9d141e0c0cff7de1833f71bf797aac713
BILLING_API_URL=https://billing.ohanax.com
BILLING_FRONTEND_URL=https://billing.ohanax.com
BILLING_API_KEY=bk_6dd737d4b336cd22bb199cf4bc4010d63967818b9853d2e6
FRONTEND_URL=https://app-ohospedeiro.oentregador.com.br
```

---

## Outros projetos neste servidor (178.156.220.246)

| Projeto | UUID | Status |
|---------|------|--------|
| OEntregador | `buucl237pbk1ll9i1imyopne` | Ativo |
| OFinanceiro | `ukdxza5yqpnmekvxyg18wb8t` | Ativo |
| **OHospedeiro** | `nnpg94yjpdn1io9kspuoko8b` | **Novo** |

---

## Servidores da infra completa

| Servidor | IP | Projetos | Coolify URL |
|----------|-----|----------|-------------|
| **Hetzner 1** | `5.161.213.157` | Auth, Billing, Security, Cardapio, Edifisco, Streaming, Notetaker, Dashboard, Audience, Credito | https://server.ohanax.com |
| **Hetzner 2** | `178.156.238.246` | SellPipe | N/A (Docker Compose direto) |
| **Hetzner 3** | `178.156.220.246` | OEntregador, OFinanceiro, **OHospedeiro** | https://server.oentregador.com.br |

## Integration Guides

### Authify (Authentication)
Full integration guide: `~/Documents/00-projetos/01-ohanax/01-auth/integracao.md`
- **Pattern**: BFF (Backend For Frontend) — tokens never exposed to frontend
- **Cookie**: httpOnly `security_access_token` (24h, secure, sameSite=none)
- **Backend**: AuthBffModule (global) with service + controller + guard
- **Endpoints**: GET `/api/auth/login`, POST `/api/auth/callback`, GET `/api/auth/me`, GET `/api/auth/status`, POST `/api/auth/refresh`, POST `/api/auth/logout`
- **Entities**: AdminUser (`security_admin_users`), AdminSession (`security_admin_sessions`)
- **Env vars**: `AUTHIFY_URL`, `AUTHIFY_FRONTEND_URL`, `AUTHIFY_API_KEY`
- **Frontend**: AuthCallback page + AuthProvider (useAuth hook) + api client with cookie credentials
- **Flow**: Frontend → backend `/auth/login` → Authify login URL → callback with code → backend exchanges code for tokens → sets httpOnly cookie → frontend uses `/auth/me` and `/auth/status`

### Billing (Subscriptions & Payments)
Full integration guide: `~/Documents/00-projetos/01-ohanax/02-billing/integracao.md`
- **Pattern**: External billing service — your app does NOT process payments
- **Backend**: BillingModule (global) with service + controller
- **Models**: A) Subscription only (OEntregador) | B) Subscription + Credits (SellPipe/SecAudit)
- **Endpoints**: GET `/billing/plans`, GET `/billing/subscription`, GET `/billing/subscription-checkout-url`
- **Env vars**: `BILLING_API_URL`, `BILLING_FRONTEND_URL`, `BILLING_PROJECT_ID`, `BILLING_API_KEY`
- **Auth header**: `x-api-key` with billing API key (format `bk_...`)
- **externalUserId**: maps to your app's `companyId`
- **Checkout flow**: Backend generates URL → frontend redirects to billing frontend → after payment, redirects back via `successUrl`
- **Cache**: 60s TTL recommended (in-memory Map or Redis)
- **Frontend**: usePlanGuard hook + PlanGuard component + redirect to billing checkout
