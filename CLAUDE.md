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
