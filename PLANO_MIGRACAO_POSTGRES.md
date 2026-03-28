# PLANO DE MIGRACAO: Firebase Firestore → PostgreSQL

> HotelFacil — Sistema de Gestao Hoteleira
> Data: 28/03/2026
> Escopo: Migracao completa de dados, autenticacao, real-time, e regras de seguranca

---

## INDICE

1. [Visao Geral da Migracao](#1-visao-geral)
2. [Nova Arquitetura](#2-nova-arquitetura)
3. [Schema PostgreSQL Completo](#3-schema-postgresql)
4. [Mapeamento Firebase → Postgres](#4-mapeamento)
5. [Backend API (NestJS)](#5-backend-api)
6. [Autenticacao (substituindo Firebase Auth)](#6-autenticacao)
7. [Real-Time (substituindo onSnapshot)](#7-real-time)
8. [Migracao de Dados Existentes](#8-migracao-dados)
9. [Adaptacao do Frontend React](#9-frontend)
10. [Infraestrutura e Deploy](#10-infraestrutura)
11. [Cronograma por Fases](#11-cronograma)
12. [Riscos e Mitigacoes](#12-riscos)

---

## 1. VISAO GERAL

### O que muda

| Antes (Firebase) | Depois (PostgreSQL) |
|---|---|
| Firestore (NoSQL, documentos) | PostgreSQL 17 (relacional, tabelas) |
| Firebase Auth (email/password) | JWT + bcrypt (backend proprio) |
| onSnapshot (real-time push) | WebSocket via Socket.IO (real-time push) |
| Firestore Rules (seguranca) | RBAC no backend (guards + middleware) |
| Firebase Storage (imagens) | AWS S3 ou manter Firebase Storage |
| Sem backend (SPA direto no Firestore) | NestJS API REST (backend intermediario) |
| Frontend fala direto com banco | Frontend fala com API, API fala com banco |
| writeBatch (atomicidade) | SQL Transactions (BEGIN/COMMIT/ROLLBACK) |
| serverTimestamp() | DEFAULT CURRENT_TIMESTAMP |
| Firestore auto-generated IDs | UUID v4 ou SERIAL |

### O que NAO muda

- React 19 + Vite (frontend)
- Tailwind CSS + shadcn/ui (design system)
- Firebase Analytics (GA4) — independente do banco
- Firebase Storage (imagens) — pode manter ou migrar para S3
- Logica de negocio (regras de reserva, fluxo caixa, etc.)

### Por que migrar?

1. **Custo previsivel** — Firestore cobra por read/write; Postgres e fixo
2. **Queries complexas** — JOINs, GROUP BY, subqueries, window functions
3. **Relatorios nativos** — DRE, fluxo de caixa, ocupacao com SQL puro
4. **Controle total** — Schema, indices, constraints, triggers
5. **Escalabilidade previsivel** — Connection pooling, read replicas
6. **Seguranca server-side** — RBAC no backend, nao no cliente
7. **Testes** — Banco testavel com seeds, truncate, transactions

---

## 2. NOVA ARQUITETURA

```
ANTES:
  React SPA → Firestore (direto, sem backend)
             → Firebase Auth
             → Firebase Storage

DEPOIS:
  React SPA → NestJS API REST (:8000)  → PostgreSQL 17
             ↕ WebSocket (Socket.IO)    → Redis (cache + pub/sub)
             → Firebase Storage (imagens)
             → JWT Auth (backend proprio)
```

### Stack do Backend

| Componente | Tecnologia | Justificativa |
|---|---|---|
| Framework | NestJS 11 | Modular, DI nativa, TypeORM integrado |
| ORM | TypeORM 0.3 | Migrations, relations, query builder |
| DB | PostgreSQL 17 | Relacional, ACID, indexes, triggers |
| Auth | JWT + bcrypt | Tokens stateless, httpOnly cookies |
| Real-time | Socket.IO | Substitui onSnapshot, rooms por empresa |
| Cache | Redis 7 | Sessions, cache de queries frequentes |
| Validation | class-validator | DTOs tipados com decorators |
| Docs | Swagger/OpenAPI | Auto-gerado via @nestjs/swagger |

### Diagrama de Fluxo

```
Browser (React)
    |
    | HTTP REST (CRUD)
    | WebSocket (real-time updates)
    |
    v
NestJS API (:8000)
    |
    |-- AuthModule (JWT, bcrypt, guards)
    |-- QuartosModule (CRUD + events)
    |-- ReservasModule (CRUD + batch logic + events)
    |-- DespesasModule (CRUD + fluxoCaixa auto + events)
    |-- FluxoCaixaModule (CRUD + events)
    |-- FaturasModule (CRUD + events)
    |-- UsuariosModule (CRUD + RBAC + events)
    |-- FornecedoresModule (CRUD + events)
    |-- BancosModule (CRUD + events)
    |-- EmpresasModule (CRUD + trial + admin)
    |-- WebSocketGateway (Socket.IO, rooms por empresa)
    |
    v
PostgreSQL 17          Redis 7
(dados de negocio)     (cache + pub/sub real-time)
```

---

## 3. SCHEMA POSTGRESQL

### 3.1 Tabela: empresas

```sql
CREATE TABLE empresas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome            VARCHAR(255) NOT NULL,
    cnpj            VARCHAR(18),
    telefone        VARCHAR(20),
    endereco        TEXT,
    proprietario_id UUID NOT NULL,  -- FK para usuarios (criador)
    ativo           BOOLEAN DEFAULT true,
    status_pagamento VARCHAR(20) DEFAULT 'trial'
                     CHECK (status_pagamento IN ('trial', 'expirado', 'pago')),
    data_inicio     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dias_trial      INTEGER DEFAULT 3,
    valor_mensal    DECIMAL(10,2) DEFAULT 99.90,
    data_pagamento  TIMESTAMP,
    logo_url        TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_empresas_proprietario ON empresas(proprietario_id);
CREATE INDEX idx_empresas_status ON empresas(status_pagamento);
```

### 3.2 Tabela: usuarios

```sql
CREATE TABLE usuarios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    senha_hash      VARCHAR(255) NOT NULL,  -- bcrypt hash
    telefone        VARCHAR(20),
    role            VARCHAR(20) DEFAULT 'Recepcionista'
                     CHECK (role IN ('Admin', 'Gerente', 'Recepcionista', 'Financeiro', 'Manutencao')),
    status          VARCHAR(20) DEFAULT 'Ativo'
                     CHECK (status IN ('Ativo', 'Inativo', 'Suspenso')),
    observacoes     TEXT,
    is_super_admin  BOOLEAN DEFAULT false,  -- substitui check de email hardcoded
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_usuarios_email ON usuarios(email);
```

### 3.3 Tabela: empresa_usuarios (N:N)

```sql
CREATE TABLE empresa_usuarios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    role            VARCHAR(20) DEFAULT 'Recepcionista'
                     CHECK (role IN ('Admin', 'Gerente', 'Recepcionista', 'Financeiro', 'Manutencao')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(empresa_id, usuario_id)
);

CREATE INDEX idx_eu_empresa ON empresa_usuarios(empresa_id);
CREATE INDEX idx_eu_usuario ON empresa_usuarios(usuario_id);
```

### 3.4 Tabela: permissoes

```sql
CREATE TABLE permissoes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_usuario_id UUID NOT NULL REFERENCES empresa_usuarios(id) ON DELETE CASCADE,
    dashboard       BOOLEAN DEFAULT true,
    disponibilidade BOOLEAN DEFAULT true,
    quartos         BOOLEAN DEFAULT false,
    vendas          BOOLEAN DEFAULT false,
    faturas         BOOLEAN DEFAULT false,
    despesas        BOOLEAN DEFAULT false,
    fluxo_caixa     BOOLEAN DEFAULT false,
    usuarios        BOOLEAN DEFAULT false,
    configuracoes   BOOLEAN DEFAULT false,

    UNIQUE(empresa_usuario_id)
);
```

### 3.5 Tabela: quartos

```sql
CREATE TABLE quartos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    numero          INTEGER NOT NULL,
    tipo            VARCHAR(30) DEFAULT 'standard'
                     CHECK (tipo IN ('standard', 'deluxe', 'suite', 'triplo')),
    andar           INTEGER,
    capacidade      INTEGER DEFAULT 2,
    preco_diaria    DECIMAL(10,2) NOT NULL,
    status          VARCHAR(20) DEFAULT 'disponivel'
                     CHECK (status IN ('disponivel', 'ocupado', 'limpeza', 'manutencao')),
    descricao       TEXT,
    caracteristicas TEXT[] DEFAULT '{}',  -- array nativo do Postgres
    imagens         TEXT[] DEFAULT '{}',  -- URLs
    manutencao_inicio DATE,
    manutencao_fim    DATE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(empresa_id, numero)
);

CREATE INDEX idx_quartos_empresa ON quartos(empresa_id);
CREATE INDEX idx_quartos_status ON quartos(empresa_id, status);
CREATE INDEX idx_quartos_numero ON quartos(empresa_id, numero);
```

### 3.6 Tabela: reservas

```sql
CREATE TABLE reservas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    quarto_id       UUID NOT NULL REFERENCES quartos(id),
    numero_quarto   INTEGER,  -- denormalizado para queries rapidas
    nome_hospede    VARCHAR(255) NOT NULL,
    email           VARCHAR(255),
    telefone        VARCHAR(20),
    cpf             VARCHAR(14),
    adultos         INTEGER DEFAULT 1,
    criancas        INTEGER DEFAULT 0,
    data_checkin    TIMESTAMP NOT NULL,
    data_checkout   TIMESTAMP NOT NULL,
    valor_total     DECIMAL(10,2) NOT NULL,
    valor_extra     DECIMAL(10,2) DEFAULT 0,
    desconto        DECIMAL(10,2) DEFAULT 0,
    forma_pagamento VARCHAR(30) DEFAULT 'a_definir'
                     CHECK (forma_pagamento IN (
                       'a_definir', 'dinheiro', 'pix', 'cartao_credito',
                       'cartao_debito', 'transferencia', 'cheque', 'faturado'
                     )),
    status          VARCHAR(20) DEFAULT 'confirmada'
                     CHECK (status IN ('confirmada', 'checkin', 'checkout', 'concluida', 'cancelada')),
    data_pagamento  DATE,
    banco_id        UUID REFERENCES bancos(id),
    observacoes     TEXT,
    -- Dados de faturamento (quando forma_pagamento = 'faturado')
    faturado_cnpj     VARCHAR(18),
    faturado_empresa  VARCHAR(255),
    faturado_contato  VARCHAR(255),
    faturado_endereco TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (data_checkout > data_checkin)
);

CREATE INDEX idx_reservas_empresa ON reservas(empresa_id);
CREATE INDEX idx_reservas_quarto ON reservas(quarto_id);
CREATE INDEX idx_reservas_status ON reservas(empresa_id, status);
CREATE INDEX idx_reservas_checkin ON reservas(empresa_id, data_checkin);
CREATE INDEX idx_reservas_checkout ON reservas(empresa_id, data_checkout);
CREATE INDEX idx_reservas_created ON reservas(empresa_id, created_at DESC);
```

### 3.7 Tabela: despesas

```sql
CREATE TABLE despesas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    categoria       VARCHAR(50) NOT NULL
                     CHECK (categoria IN (
                       'Alimentacao', 'Limpeza', 'Manutencao', 'Pessoal',
                       'Marketing', 'Utilidades', 'Administrativo', 'Outros'
                     )),
    descricao       VARCHAR(500) NOT NULL,
    valor           DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    data            DATE NOT NULL,
    status          VARCHAR(20) DEFAULT 'pendente'
                     CHECK (status IN ('pendente', 'pago', 'cancelado')),
    fornecedor      VARCHAR(255),
    observacoes     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_despesas_empresa ON despesas(empresa_id);
CREATE INDEX idx_despesas_data ON despesas(empresa_id, data DESC);
CREATE INDEX idx_despesas_status ON despesas(empresa_id, status);
CREATE INDEX idx_despesas_categoria ON despesas(empresa_id, categoria);
```

### 3.8 Tabela: fluxo_caixa

```sql
CREATE TABLE fluxo_caixa (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    tipo            VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    categoria       VARCHAR(50) NOT NULL,
    descricao       VARCHAR(500) NOT NULL,
    valor           DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    data            DATE NOT NULL,
    reserva_id      UUID REFERENCES reservas(id),    -- null se manual ou despesa
    despesa_id      UUID REFERENCES despesas(id),     -- null se manual ou reserva
    metodo_pagamento VARCHAR(30),
    status          VARCHAR(20),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fluxo_empresa ON fluxo_caixa(empresa_id);
CREATE INDEX idx_fluxo_data ON fluxo_caixa(empresa_id, data DESC);
CREATE INDEX idx_fluxo_tipo ON fluxo_caixa(empresa_id, tipo);
CREATE INDEX idx_fluxo_reserva ON fluxo_caixa(reserva_id);
CREATE INDEX idx_fluxo_despesa ON fluxo_caixa(despesa_id);
```

### 3.9 Tabela: faturas

```sql
CREATE TABLE faturas (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id            UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    empresa_cliente       VARCHAR(255) NOT NULL,
    cnpj                  VARCHAR(18),
    contato               VARCHAR(255),
    email                 VARCHAR(255),
    telefone              VARCHAR(20),
    endereco              TEXT,
    tipo_contrato         VARCHAR(20) DEFAULT 'Mensal'
                           CHECK (tipo_contrato IN ('Mensal', 'Trimestral', 'Semestral', 'Anual')),
    data_inicio           DATE NOT NULL,
    data_fim              DATE NOT NULL,
    periodicidade_fatura  VARCHAR(20) DEFAULT 'Mensal'
                           CHECK (periodicidade_fatura IN ('Quinzenal', 'Mensal', 'Bimestral', 'Trimestral')),
    valor_mensal          DECIMAL(10,2) NOT NULL,
    valor_total           DECIMAL(10,2),
    quartos_inclusos      INTEGER[] DEFAULT '{}',  -- array de numeros de quartos
    status                VARCHAR(20) DEFAULT 'Ativo'
                           CHECK (status IN ('Ativo', 'Suspenso', 'Cancelado', 'Vencido')),
    proxima_fatura        DATE,
    faturas_pendentes     INTEGER DEFAULT 0,
    observacoes           TEXT,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (data_fim >= data_inicio)
);

CREATE INDEX idx_faturas_empresa ON faturas(empresa_id);
CREATE INDEX idx_faturas_status ON faturas(empresa_id, status);
CREATE INDEX idx_faturas_created ON faturas(empresa_id, created_at DESC);
```

### 3.10 Tabela: fornecedores

```sql
CREATE TABLE fornecedores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome            VARCHAR(255) NOT NULL,
    cnpj            VARCHAR(18),
    email           VARCHAR(255),
    telefone        VARCHAR(20),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fornecedores_empresa ON fornecedores(empresa_id);
CREATE INDEX idx_fornecedores_nome ON fornecedores(empresa_id, nome);
```

### 3.11 Tabela: bancos

```sql
CREATE TABLE bancos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome            VARCHAR(100) NOT NULL,
    codigo          VARCHAR(10),
    agencia         VARCHAR(20),
    conta           VARCHAR(30),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bancos_empresa ON bancos(empresa_id);
```

### 3.12 Trigger: auto-update updated_at

```sql
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em todas as tabelas com updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
          AND table_schema = 'public'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
            t
        );
    END LOOP;
END;
$$;
```

### 3.13 Trigger: auto-criar fluxo_caixa na reserva

```sql
CREATE OR REPLACE FUNCTION trigger_reserva_fluxo_caixa()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO fluxo_caixa (empresa_id, tipo, categoria, descricao, valor, data, reserva_id)
        VALUES (
            NEW.empresa_id,
            'entrada',
            'Hospedagem',
            'Hospedagem - ' || NEW.nome_hospede || ' (Quarto ' || NEW.numero_quarto || ')',
            NEW.valor_total,
            COALESCE(NEW.data_checkout::date, CURRENT_DATE),
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reserva_fluxo
AFTER INSERT ON reservas
FOR EACH ROW EXECUTE FUNCTION trigger_reserva_fluxo_caixa();
```

### 3.14 Trigger: auto-criar fluxo_caixa na despesa

```sql
CREATE OR REPLACE FUNCTION trigger_despesa_fluxo_caixa()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO fluxo_caixa (empresa_id, tipo, categoria, descricao, valor, data, despesa_id)
        VALUES (
            NEW.empresa_id,
            'saida',
            NEW.categoria,
            NEW.descricao,
            NEW.valor,
            NEW.data,
            NEW.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_despesa_fluxo
AFTER INSERT ON despesas
FOR EACH ROW EXECUTE FUNCTION trigger_despesa_fluxo_caixa();
```

### 3.15 Views para relatorios

```sql
-- View: Dashboard stats
CREATE VIEW vw_dashboard_stats AS
SELECT
    e.id AS empresa_id,
    COUNT(q.*) FILTER (WHERE q.status = 'disponivel') AS quartos_disponiveis,
    COUNT(q.*) FILTER (WHERE q.status = 'ocupado') AS quartos_ocupados,
    COUNT(q.*) AS quartos_total,
    ROUND(
        COUNT(q.*) FILTER (WHERE q.status = 'ocupado') * 100.0 /
        NULLIF(COUNT(q.*), 0), 1
    ) AS taxa_ocupacao,
    COALESCE(SUM(r.valor_total) FILTER (
        WHERE r.status != 'cancelada'
          AND DATE_TRUNC('month', r.created_at) = DATE_TRUNC('month', CURRENT_DATE)
    ), 0) AS receita_mes,
    COALESCE(SUM(d.valor) FILTER (
        WHERE DATE_TRUNC('month', d.data) = DATE_TRUNC('month', CURRENT_DATE)
    ), 0) AS despesas_mes
FROM empresas e
LEFT JOIN quartos q ON q.empresa_id = e.id
LEFT JOIN reservas r ON r.empresa_id = e.id
LEFT JOIN despesas d ON d.empresa_id = e.id
GROUP BY e.id;

-- View: DRE mensal
CREATE VIEW vw_dre_mensal AS
SELECT
    fc.empresa_id,
    DATE_TRUNC('month', fc.data) AS mes,
    SUM(fc.valor) FILTER (WHERE fc.tipo = 'entrada') AS receita,
    SUM(fc.valor) FILTER (WHERE fc.tipo = 'saida') AS despesa,
    SUM(fc.valor) FILTER (WHERE fc.tipo = 'entrada') -
    SUM(fc.valor) FILTER (WHERE fc.tipo = 'saida') AS lucro
FROM fluxo_caixa fc
GROUP BY fc.empresa_id, DATE_TRUNC('month', fc.data)
ORDER BY mes DESC;

-- View: Disponibilidade de quartos por data
CREATE VIEW vw_disponibilidade AS
SELECT
    q.empresa_id,
    q.id AS quarto_id,
    q.numero,
    q.tipo,
    q.status AS status_quarto,
    r.id AS reserva_id,
    r.nome_hospede,
    r.data_checkin,
    r.data_checkout,
    r.status AS status_reserva
FROM quartos q
LEFT JOIN reservas r ON r.quarto_id = q.id
    AND r.status NOT IN ('cancelada', 'concluida')
    AND r.data_checkin <= CURRENT_DATE + INTERVAL '30 days'
    AND r.data_checkout >= CURRENT_DATE;
```

---

## 4. MAPEAMENTO FIREBASE → POSTGRES

### Colecoes → Tabelas

| Firestore Collection | PostgreSQL Table | Notas |
|---|---|---|
| `/empresas/{id}` | `empresas` | Campos `usuarios[]` → tabela `empresa_usuarios` |
| `/empresas/{id}/quartos/{qid}` | `quartos` | FK `empresa_id`, `caracteristicas` como `TEXT[]` |
| `/empresas/{id}/reservas/{rid}` | `reservas` | FK `empresa_id`, `quarto_id`. Campo `faturado{}` → colunas flat |
| `/empresas/{id}/despesas/{did}` | `despesas` | FK `empresa_id` |
| `/empresas/{id}/fluxoCaixa/{tid}` | `fluxo_caixa` | FK `empresa_id`, `reserva_id`, `despesa_id` |
| `/empresas/{id}/faturas/{fid}` | `faturas` | FK `empresa_id`. `quartosInclusos[]` → `INTEGER[]` |
| `/empresas/{id}/usuarios/{uid}` | `empresa_usuarios` + `permissoes` | Relacao N:N com tabela de permissoes |
| `/empresas/{id}/fornecedores/{fid}` | `fornecedores` | FK `empresa_id` |
| `/empresas/{id}/bancos/{bid}` | `bancos` | FK `empresa_id` |
| `/usuarios/{uid}` (global) | `usuarios` | Tabela unica com `empresa_usuarios` como pivot |

### Tipos de Dados

| Firestore | PostgreSQL |
|---|---|
| `Timestamp` | `TIMESTAMP` |
| `serverTimestamp()` | `DEFAULT CURRENT_TIMESTAMP` |
| `string` | `VARCHAR(n)` ou `TEXT` |
| `number` (inteiro) | `INTEGER` |
| `number` (decimal) | `DECIMAL(10,2)` |
| `boolean` | `BOOLEAN` |
| `array<string>` | `TEXT[]` |
| `array<number>` | `INTEGER[]` |
| `map/object` (faturado) | Colunas flat (`faturado_cnpj`, etc.) |
| Document ID (auto) | `UUID DEFAULT gen_random_uuid()` |

### Features Firebase → Equivalente

| Firebase Feature | PostgreSQL/NestJS Equivalente |
|---|---|
| `writeBatch()` | `BEGIN; ... COMMIT;` (TypeORM `queryRunner.startTransaction()`) |
| `onSnapshot()` | Socket.IO events (backend emite apos cada write) |
| `serverTimestamp()` | `DEFAULT CURRENT_TIMESTAMP` |
| `Timestamp.fromDate()` | Cast direto (TypeORM aceita `Date` nativo) |
| `orderBy('campo', 'desc')` | `ORDER BY campo DESC` |
| `where('field', '==', val)` | `WHERE field = $1` |
| `array-contains` | `ANY(array_column)` ou tabela junction |
| Firestore Rules (RBAC) | NestJS Guards + Interceptors |
| Firebase Auth | JWT + bcrypt + AuthModule |

---

## 5. BACKEND API (NestJS)

### Estrutura de Modulos

```
src/
├── main.ts
├── app.module.ts
├── config/
│   ├── database.config.ts        -- TypeORM config
│   ├── jwt.config.ts             -- JWT secret, expiry
│   └── cors.config.ts
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts     -- Verifica JWT valido
│   │   ├── empresa.guard.ts      -- Verifica usuario pertence a empresa
│   │   └── permission.guard.ts   -- Verifica permissao especifica
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── current-empresa.decorator.ts
│   │   └── require-permission.decorator.ts
│   ├── interceptors/
│   │   └── empresa-scope.interceptor.ts  -- Auto-filtra por empresa_id
│   ├── dto/
│   │   └── pagination.dto.ts
│   └── entities/
│       └── base.entity.ts        -- id, created_at, updated_at
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts    -- POST /auth/login, /auth/register, /auth/refresh
│   │   ├── auth.service.ts       -- bcrypt, JWT, trial logic
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   ├── empresas/
│   │   ├── empresas.module.ts
│   │   ├── empresas.controller.ts -- GET/PUT /empresas/:id, GET /admin/empresas
│   │   ├── empresas.service.ts
│   │   └── entities/
│   │       ├── empresa.entity.ts
│   │       └── empresa-usuario.entity.ts
│   ├── quartos/
│   │   ├── quartos.module.ts
│   │   ├── quartos.controller.ts  -- CRUD /empresas/:empresaId/quartos
│   │   ├── quartos.service.ts
│   │   └── entities/
│   │       └── quarto.entity.ts
│   ├── reservas/
│   │   ├── reservas.module.ts
│   │   ├── reservas.controller.ts -- CRUD + checkout + cancel
│   │   ├── reservas.service.ts    -- Transaction: reserva + quarto + fluxoCaixa
│   │   └── entities/
│   │       └── reserva.entity.ts
│   ├── despesas/
│   │   ├── despesas.module.ts
│   │   ├── despesas.controller.ts
│   │   ├── despesas.service.ts    -- Transaction: despesa + fluxoCaixa
│   │   └── entities/
│   │       └── despesa.entity.ts
│   ├── fluxo-caixa/
│   │   ├── fluxo-caixa.module.ts
│   │   ├── fluxo-caixa.controller.ts
│   │   ├── fluxo-caixa.service.ts
│   │   └── entities/
│   │       └── fluxo-caixa.entity.ts
│   ├── faturas/
│   │   ├── faturas.module.ts
│   │   ├── faturas.controller.ts
│   │   ├── faturas.service.ts
│   │   └── entities/
│   │       └── fatura.entity.ts
│   ├── usuarios/
│   │   ├── usuarios.module.ts
│   │   ├── usuarios.controller.ts
│   │   ├── usuarios.service.ts
│   │   └── entities/
│   │       ├── usuario.entity.ts
│   │       └── permissao.entity.ts
│   ├── fornecedores/
│   │   ├── fornecedores.module.ts
│   │   ├── fornecedores.controller.ts
│   │   ├── fornecedores.service.ts
│   │   └── entities/
│   │       └── fornecedor.entity.ts
│   ├── bancos/
│   │   ├── bancos.module.ts
│   │   ├── bancos.controller.ts
│   │   ├── bancos.service.ts
│   │   └── entities/
│   │       └── banco.entity.ts
│   ├── dashboard/
│   │   ├── dashboard.module.ts
│   │   ├── dashboard.controller.ts -- GET /dashboard/stats
│   │   └── dashboard.service.ts    -- SQL queries para stats
│   ├── relatorios/
│   │   ├── relatorios.module.ts
│   │   ├── relatorios.controller.ts -- GET /relatorios/dre, /relatorios/disponibilidade
│   │   └── relatorios.service.ts    -- Views SQL
│   └── websocket/
│       ├── websocket.module.ts
│       └── websocket.gateway.ts    -- Socket.IO gateway
└── database/
    ├── database.module.ts
    ├── migrations/
    │   └── 001-initial-schema.ts
    └── seeds/
        └── bancos.seed.ts         -- 9 bancos padrao
```

### Endpoints da API

```
AUTH
  POST   /auth/register          -- Criar conta + empresa
  POST   /auth/login             -- Login, retorna JWT
  POST   /auth/refresh           -- Refresh token
  POST   /auth/forgot-password   -- Enviar email reset
  POST   /auth/reset-password    -- Reset com token
  GET    /auth/me                -- Dados do usuario logado

EMPRESAS
  GET    /empresas               -- Listar empresas do usuario
  GET    /empresas/:id           -- Detalhes da empresa
  PUT    /empresas/:id           -- Atualizar empresa
  GET    /admin/empresas         -- [Admin] Listar todas
  PUT    /admin/empresas/:id/ativar -- [Admin] Ativar empresa

QUARTOS
  GET    /empresas/:eid/quartos           -- Listar (paginado)
  GET    /empresas/:eid/quartos/:id       -- Detalhe
  POST   /empresas/:eid/quartos           -- Criar
  PUT    /empresas/:eid/quartos/:id       -- Atualizar
  DELETE /empresas/:eid/quartos/:id       -- Deletar

RESERVAS
  GET    /empresas/:eid/reservas          -- Listar (paginado, filtros)
  GET    /empresas/:eid/reservas/:id      -- Detalhe
  POST   /empresas/:eid/reservas          -- Criar (TX: + quarto + fluxo)
  PUT    /empresas/:eid/reservas/:id      -- Atualizar
  PUT    /empresas/:eid/reservas/:id/checkin   -- Check-in
  PUT    /empresas/:eid/reservas/:id/checkout  -- Check-out (TX: + quarto)
  PUT    /empresas/:eid/reservas/:id/cancelar  -- Cancelar (TX: + quarto)

DESPESAS
  GET    /empresas/:eid/despesas          -- Listar (paginado, filtros)
  POST   /empresas/:eid/despesas          -- Criar (TX: + fluxo)
  PUT    /empresas/:eid/despesas/:id      -- Atualizar
  DELETE /empresas/:eid/despesas/:id      -- Deletar (TX: + fluxo)

FLUXO DE CAIXA
  GET    /empresas/:eid/fluxo-caixa       -- Listar (paginado, filtros)
  POST   /empresas/:eid/fluxo-caixa       -- Criar manual

FATURAS
  GET    /empresas/:eid/faturas           -- Listar
  POST   /empresas/:eid/faturas           -- Criar
  PUT    /empresas/:eid/faturas/:id       -- Atualizar
  DELETE /empresas/:eid/faturas/:id       -- Deletar

USUARIOS
  GET    /empresas/:eid/usuarios          -- Listar
  POST   /empresas/:eid/usuarios          -- Criar (hash senha)
  PUT    /empresas/:eid/usuarios/:id      -- Atualizar
  DELETE /empresas/:eid/usuarios/:id      -- Deletar

FORNECEDORES
  GET    /empresas/:eid/fornecedores      -- Listar
  POST   /empresas/:eid/fornecedores      -- Criar
  PUT    /empresas/:eid/fornecedores/:id  -- Atualizar
  DELETE /empresas/:eid/fornecedores/:id  -- Deletar

BANCOS
  GET    /empresas/:eid/bancos            -- Listar
  POST   /empresas/:eid/bancos            -- Criar
  PUT    /empresas/:eid/bancos/:id        -- Atualizar
  DELETE /empresas/:eid/bancos/:id        -- Deletar

DASHBOARD
  GET    /empresas/:eid/dashboard/stats   -- Stats agregados (SQL view)

RELATORIOS
  GET    /empresas/:eid/relatorios/dre?ano=2026&mes=3  -- DRE
  GET    /empresas/:eid/relatorios/disponibilidade?mes=2026-03 -- Calendario
```

---

## 6. AUTENTICACAO

### Substituindo Firebase Auth

| Firebase Auth | NestJS Auth |
|---|---|
| `createUserWithEmailAndPassword` | `POST /auth/register` → bcrypt hash → INSERT usuarios |
| `signInWithEmailAndPassword` | `POST /auth/login` → bcrypt compare → JWT |
| `onAuthStateChanged` | Frontend verifica JWT no cookie/localStorage |
| `signOut` | Frontend remove JWT; opcional: blacklist no Redis |
| Custom Claims (roles) | JWT payload: `{ sub: userId, empresaId, role }` |
| `sendPasswordResetEmail` | Gerar token, enviar email (nodemailer/resend) |

### JWT Strategy

```typescript
// Payload do JWT
{
  sub: 'uuid-do-usuario',
  email: 'user@email.com',
  nome: 'Nome',
  empresaId: 'uuid-empresa-atual',  // empresa selecionada
  role: 'Admin',
  iat: 1711612800,
  exp: 1711616400  // 1 hora
}

// Refresh token: 7 dias, armazenado em httpOnly cookie
// Access token: 1 hora, armazenado em httpOnly cookie
```

### Guards

```typescript
// jwt-auth.guard.ts — Verifica se JWT e valido
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// empresa.guard.ts — Verifica se usuario pertence a empresa do request
@Injectable()
export class EmpresaGuard implements CanActivate {
  canActivate(context) {
    const user = request.user;
    const empresaId = request.params.eid;
    return this.empresaUsuarioRepo.exists({
      where: { empresa_id: empresaId, usuario_id: user.sub }
    });
  }
}

// permission.guard.ts — Verifica permissao especifica
@UseGuards(JwtAuthGuard, EmpresaGuard, PermissionGuard)
@RequirePermission('vendas')
@Post('reservas')
async criarReserva() { ... }
```

---

## 7. REAL-TIME (substituindo onSnapshot)

### Estrategia: Socket.IO com Rooms por Empresa

```typescript
// websocket.gateway.ts
@WebSocketGateway({ cors: true })
export class WebSocketGateway {

  @WebSocketServer() server: Server;

  // Ao conectar, usuario entra na room da empresa
  handleConnection(client: Socket) {
    const empresaId = client.handshake.auth.empresaId;
    client.join(`empresa:${empresaId}`);
  }

  // Metodo chamado pelos services apos cada CRUD
  emitToEmpresa(empresaId: string, event: string, data: any) {
    this.server.to(`empresa:${empresaId}`).emit(event, data);
  }
}

// Exemplo no ReservasService:
async criarReserva(empresaId, dto) {
  const reserva = await this.repo.save({ ...dto, empresa_id: empresaId });
  // Emitir para todos os clientes da empresa
  this.wsGateway.emitToEmpresa(empresaId, 'reservas:created', reserva);
  this.wsGateway.emitToEmpresa(empresaId, 'quartos:updated', quarto);
  this.wsGateway.emitToEmpresa(empresaId, 'fluxoCaixa:created', fluxo);
  return reserva;
}
```

### Frontend: Hook useRealTime

```typescript
// hooks/useRealTime.ts
export function useRealTime(empresaId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(API_URL, { auth: { empresaId, token: getToken() } });

    // Quando backend emitir evento, invalidar cache do React Query
    socket.on('reservas:created', () => queryClient.invalidateQueries(['reservas']));
    socket.on('reservas:updated', () => queryClient.invalidateQueries(['reservas']));
    socket.on('quartos:updated', () => queryClient.invalidateQueries(['quartos']));
    socket.on('despesas:created', () => queryClient.invalidateQueries(['despesas']));
    socket.on('fluxoCaixa:created', () => queryClient.invalidateQueries(['fluxoCaixa']));
    // ... todos os eventos

    return () => socket.disconnect();
  }, [empresaId]);
}
```

---

## 8. MIGRACAO DE DADOS EXISTENTES

### Script de Migracao Firestore → PostgreSQL

```
Ordem de migracao (respeitar FKs):
1. usuarios (sem FK externa)
2. empresas (FK: proprietario_id → usuarios)
3. empresa_usuarios + permissoes (FKs: empresa + usuario)
4. bancos (FK: empresa)
5. fornecedores (FK: empresa)
6. quartos (FK: empresa)
7. reservas (FK: empresa, quarto, banco)
8. despesas (FK: empresa)
9. fluxo_caixa (FK: empresa, reserva, despesa)
10. faturas (FK: empresa)
```

### Script Node.js de Migracao

```javascript
// scripts/migrate-firestore-to-postgres.js
//
// 1. Conectar no Firestore (firebase-admin)
// 2. Conectar no PostgreSQL (pg)
// 3. Para cada empresa no Firestore:
//    a. Inserir empresa no Postgres
//    b. Mapear Firestore doc ID → UUID gerado
//    c. Inserir subcollections usando o mapa de IDs
// 4. Validar contagens: Firestore docs === Postgres rows

const ID_MAP = {};  // { firestoreId: postgresUUID }

async function migrateEmpresas() {
  const snap = await admin.firestore().collection('empresas').get();
  for (const doc of snap.docs) {
    const data = doc.data();
    const result = await pg.query(
      `INSERT INTO empresas (nome, cnpj, ...) VALUES ($1, $2, ...) RETURNING id`,
      [data.nome, data.cnpj, ...]
    );
    ID_MAP[doc.id] = result.rows[0].id;
  }
}

async function migrateQuartos(firestoreEmpresaId, pgEmpresaId) {
  const snap = await admin.firestore()
    .collection('empresas').doc(firestoreEmpresaId)
    .collection('quartos').get();
  for (const doc of snap.docs) {
    const data = doc.data();
    const result = await pg.query(
      `INSERT INTO quartos (empresa_id, numero, tipo, ...) VALUES ($1, $2, $3, ...) RETURNING id`,
      [pgEmpresaId, data.numero, data.tipo, ...]
    );
    ID_MAP[doc.id] = result.rows[0].id;
  }
}

// ... repetir para cada subcollection
```

### Validacao Pos-Migracao

```sql
-- Comparar contagens
SELECT 'empresas' AS tabela, COUNT(*) FROM empresas
UNION ALL SELECT 'quartos', COUNT(*) FROM quartos
UNION ALL SELECT 'reservas', COUNT(*) FROM reservas
UNION ALL SELECT 'despesas', COUNT(*) FROM despesas
UNION ALL SELECT 'fluxo_caixa', COUNT(*) FROM fluxo_caixa
UNION ALL SELECT 'faturas', COUNT(*) FROM faturas
UNION ALL SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL SELECT 'fornecedores', COUNT(*) FROM fornecedores
UNION ALL SELECT 'bancos', COUNT(*) FROM bancos;

-- Verificar integridade referencial
SELECT r.id FROM reservas r
LEFT JOIN quartos q ON r.quarto_id = q.id
WHERE q.id IS NULL;  -- Deve retornar 0 rows

SELECT fc.id FROM fluxo_caixa fc
LEFT JOIN reservas r ON fc.reserva_id = r.id
WHERE fc.reserva_id IS NOT NULL AND r.id IS NULL;  -- Deve retornar 0 rows
```

---

## 9. ADAPTACAO DO FRONTEND REACT

### Substituicoes Principais

| Antes (Firebase) | Depois (API REST) |
|---|---|
| `import { db } from '../config/firebase'` | `import { api } from '../services/api'` |
| `addDoc(collection(...))` | `api.post('/empresas/:eid/recurso', dados)` |
| `updateDoc(doc(...))` | `api.put('/empresas/:eid/recurso/:id', dados)` |
| `deleteDoc(doc(...))` | `api.delete('/empresas/:eid/recurso/:id')` |
| `getDocs(query(...))` | `api.get('/empresas/:eid/recurso?page=1&limit=20')` |
| `onSnapshot(...)` | Socket.IO + React Query invalidation |
| `writeBatch()` | Backend cuida da transaction internamente |
| `AuthContext` (Firebase Auth) | `AuthContext` (JWT + API calls) |
| `HotelFirestoreContext` | React Query hooks por dominio |

### Nova Estrutura de Services

```
src/
├── services/
│   ├── api.ts                    -- Axios instance com interceptors
│   ├── auth.service.ts           -- login, register, refresh, logout
│   ├── quartos.service.ts        -- CRUD quartos via API
│   ├── reservas.service.ts       -- CRUD reservas via API
│   ├── despesas.service.ts       -- CRUD despesas via API
│   ├── fluxoCaixa.service.ts
│   ├── faturas.service.ts
│   ├── usuarios.service.ts
│   ├── fornecedores.service.ts
│   ├── bancos.service.ts
│   └── dashboard.service.ts
├── hooks/
│   ├── useAuth.ts                -- Login/logout/register
│   ├── useQuartos.ts             -- React Query: useQuery + useMutation
│   ├── useReservas.ts
│   ├── useDespesas.ts
│   ├── useFluxoCaixa.ts
│   ├── useFaturas.ts
│   ├── useUsuarios.ts
│   ├── useFornecedores.ts
│   ├── useBancos.ts
│   ├── useDashboard.ts
│   └── useRealTime.ts           -- Socket.IO connection
├── context/
│   └── AuthContext.tsx           -- Simplificado: apenas auth state
```

### Exemplo: useReservas (React Query)

```typescript
// hooks/useReservas.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservasService } from '../services/reservas.service';

export function useReservas(empresaId: string) {
  const queryClient = useQueryClient();

  const { data: reservas = [], isLoading } = useQuery({
    queryKey: ['reservas', empresaId],
    queryFn: () => reservasService.listar(empresaId),
    enabled: !!empresaId,
  });

  const criarReserva = useMutation({
    mutationFn: (dados) => reservasService.criar(empresaId, dados),
    onSuccess: () => {
      queryClient.invalidateQueries(['reservas', empresaId]);
      queryClient.invalidateQueries(['quartos', empresaId]);
      queryClient.invalidateQueries(['fluxoCaixa', empresaId]);
    },
  });

  return { reservas, isLoading, criarReserva };
}
```

---

## 10. INFRAESTRUTURA E DEPLOY

### Docker Compose (Desenvolvimento)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: hotelfacil
      POSTGRES_USER: hotelfacil
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgres://hotelfacil:${DB_PASSWORD}@postgres:5432/hotelfacil
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis

volumes:
  pgdata:
```

### Producao (Hetzner + Coolify)

```
Hetzner VPS (CPX31 — 4 vCPU, 8 GB RAM)
├── Coolify (orquestrador)
│   ├── NestJS API (backend)          -- porta 8000
│   ├── PostgreSQL 17                 -- porta 5432 (rede interna)
│   ├── Redis 7                       -- porta 6379 (rede interna)
│   └── Traefik (reverse proxy + SSL)
│
AWS Amplify (frontend React)
Firebase Storage (imagens) — manter por enquanto
```

---

## 11. CRONOGRAMA POR FASES

### FASE 0 — Preparacao (1 semana)

```
[ ] Criar repositorio do backend (NestJS)
[ ] Configurar TypeORM + PostgreSQL
[ ] Configurar Docker Compose (dev)
[ ] Configurar ESLint + Prettier
[ ] Configurar Jest (testes)
[ ] Criar CLAUDE.md do backend
```

### FASE 1 — Schema + Auth (1 semana)

```
[ ] Migration 001: schema completo (todas tabelas, indices, triggers, views)
[ ] Seed: bancos padrao (9 bancos)
[ ] AuthModule: register, login, refresh, JWT strategy
[ ] Guards: JwtAuth, Empresa, Permission
[ ] Testes: auth e2e + unit
```

### FASE 2 — CRUD Modules (2 semanas)

```
[ ] EmpresasModule (CRUD + trial + admin)
[ ] QuartosModule (CRUD)
[ ] ReservasModule (CRUD + checkin/checkout/cancelar com transactions)
[ ] DespesasModule (CRUD + auto fluxoCaixa)
[ ] FluxoCaixaModule (CRUD manual + listagem)
[ ] FaturasModule (CRUD)
[ ] UsuariosModule (CRUD + RBAC)
[ ] FornecedoresModule (CRUD)
[ ] BancosModule (CRUD)
[ ] DashboardModule (stats SQL)
[ ] RelatoriosModule (DRE + disponibilidade)
[ ] Testes para cada modulo
```

### FASE 3 — Real-Time + WebSocket (3 dias)

```
[ ] WebSocket Gateway (Socket.IO)
[ ] Rooms por empresa
[ ] Emit events em todos os services apos CRUD
[ ] Testes de WebSocket
```

### FASE 4 — Migracao de Dados (3 dias)

```
[ ] Script de migracao Firestore → Postgres
[ ] Mapeamento de IDs (Firestore → UUID)
[ ] Validacao pos-migracao (contagens, integridade)
[ ] Teste com dados reais em ambiente staging
```

### FASE 5 — Adaptacao Frontend (2 semanas)

```
[ ] Instalar React Query + Socket.IO client
[ ] Criar services (api.ts + domain services)
[ ] Criar hooks (useReservas, useQuartos, etc.)
[ ] Criar useRealTime hook
[ ] Adaptar AuthContext (JWT em vez de Firebase Auth)
[ ] Adaptar todas as 12 paginas para usar hooks
[ ] Remover todas dependencias Firebase (exceto Storage)
[ ] Testes frontend
```

### FASE 6 — Deploy + Cutover (3 dias)

```
[ ] Deploy backend no Hetzner (Coolify)
[ ] Configurar PostgreSQL em producao
[ ] Executar migracao de dados em producao
[ ] Apontar frontend para novo backend
[ ] Monitorar por 48h
[ ] Desligar Firestore (manter backup)
```

### TOTAL ESTIMADO: ~6 semanas

```
Fase 0: 1 semana  (preparacao)
Fase 1: 1 semana  (schema + auth)
Fase 2: 2 semanas (CRUD modules — maior fase)
Fase 3: 3 dias    (real-time)
Fase 4: 3 dias    (migracao dados)
Fase 5: 2 semanas (frontend — segunda maior fase)
Fase 6: 3 dias    (deploy + cutover)
```

---

## 12. RISCOS E MITIGACOES

| Risco | Impacto | Mitigacao |
|---|---|---|
| Perda de dados na migracao | CRITICO | Script de migracao idempotente + backup Firestore antes + validacao automatica |
| Downtime durante cutover | ALTO | Blue-green: rodar ambos (Firebase + Postgres) em paralelo ate validar |
| Real-time mais lento que onSnapshot | MEDIO | Socket.IO com Redis adapter; fallback: polling a cada 5s |
| IDs diferentes quebram referências | ALTO | Mapa de IDs persistido; validacao de integridade referencial |
| Firebase Storage sem backend | BAIXO | Manter Firebase Storage por enquanto; migrar para S3 depois |
| Usuarios precisam recriar senha | ALTO | Gerar senhas temporarias + forcar reset no primeiro login pos-migracao |
| Timestamps com timezone errado | MEDIO | Padronizar UTC no Postgres; converter para timezone local no frontend |
| Queries lentas sem indices | MEDIO | Indices ja definidos no schema; EXPLAIN ANALYZE nas queries mais usadas |
| Multiplos devs no mesmo schema | BAIXO | TypeORM migrations versionadas no git |

### Estrategia de Rollback

```
Se problemas criticos pos-cutover:
1. Frontend aponta de volta para Firebase (flag de feature ou env var)
2. Qualquer dado criado no Postgres apos cutover e perdido
3. Por isso: manter Firestore ativo (read-only) por 7 dias apos cutover
```

### Checklist Pre-Cutover

```
[ ] Todos os testes do backend passando (unit + e2e)
[ ] Migracao de dados validada em staging
[ ] Contagens Firestore === Contagens Postgres
[ ] Integridade referencial verificada (0 orphans)
[ ] Frontend testado contra backend em staging
[ ] Backup do Firestore exportado
[ ] Plano de rollback documentado
[ ] Equipe notificada sobre janela de manutencao
```

---

## APENDICE: VANTAGENS POS-MIGRACAO

### Queries que ficam triviais com SQL

```sql
-- Top 10 quartos mais reservados (impossivel com Firestore)
SELECT q.numero, q.tipo, COUNT(r.id) AS total_reservas
FROM quartos q
JOIN reservas r ON r.quarto_id = q.id
WHERE r.empresa_id = $1 AND r.status != 'cancelada'
GROUP BY q.id
ORDER BY total_reservas DESC
LIMIT 10;

-- Receita por forma de pagamento (GROUP BY impossivel no Firestore)
SELECT forma_pagamento, SUM(valor_total) AS total
FROM reservas
WHERE empresa_id = $1 AND status != 'cancelada'
  AND data_checkin >= $2 AND data_checkin <= $3
GROUP BY forma_pagamento
ORDER BY total DESC;

-- DRE completo em uma query (substitui 100+ linhas de JS no frontend)
SELECT
    DATE_TRUNC('month', fc.data) AS mes,
    SUM(valor) FILTER (WHERE tipo = 'entrada') AS receita,
    SUM(valor) FILTER (WHERE tipo = 'saida') AS despesa,
    SUM(valor) FILTER (WHERE tipo = 'entrada') -
    SUM(valor) FILTER (WHERE tipo = 'saida') AS lucro
FROM fluxo_caixa fc
WHERE fc.empresa_id = $1
  AND EXTRACT(YEAR FROM fc.data) = $2
GROUP BY DATE_TRUNC('month', fc.data)
ORDER BY mes;

-- Disponibilidade: quartos livres em um periodo (substituir O(Q*D*R))
SELECT q.*
FROM quartos q
WHERE q.empresa_id = $1
  AND q.status != 'manutencao'
  AND q.id NOT IN (
    SELECT r.quarto_id FROM reservas r
    WHERE r.empresa_id = $1
      AND r.status NOT IN ('cancelada', 'concluida')
      AND r.data_checkin < $3   -- fim do periodo
      AND r.data_checkout > $2  -- inicio do periodo
  );

-- Despesas vencidas (substitui filter em memoria no Layout.jsx)
SELECT * FROM despesas
WHERE empresa_id = $1
  AND status = 'pendente'
  AND data < CURRENT_DATE
ORDER BY data ASC;
```

### Economia estimada

```
Firebase Firestore (cenario 100 quartos, 3 anos de dados):
  ~50,000 reads/dia (8 listeners x ~6000 docs) = ~1.5M reads/mes
  Custo: ~$45/mes (apos free tier)

PostgreSQL no Hetzner:
  VPS CPX21: ~€8/mes (inclui tudo: API + DB + Redis)
  Custo: ~$9/mes

Economia: ~$36/mes (~$430/ano)
+ Custo previsivel (nao escala com reads)
+ Queries 10-100x mais rapidas para relatorios
```
