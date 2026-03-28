# CONFIG — OHospedeiro (HotelFacil)

> Infraestrutura e servicos de producao.
> Atualizado: 28/03/2026

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
