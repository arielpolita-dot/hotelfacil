# ANALISE CRITICA COMPLETA — HotelFacil

> Revisao multi-agente executada em 28/03/2026
> 30 arquivos analisados | 11 categorias | 150+ issues encontradas

---

## REGRA FUNDAMENTAL: TDD — TESTES PRIMEIRO, SEMPRE

> **Baseado em: agents/tech/10-tdd.md — "Nenhuma linha de codigo de producao existe sem um teste falhando que a justifique."**

**TODA tarefa neste documento segue o ciclo Red-Green-Refactor:**

```
1. 🔴 RED   — Escrever teste que FALHA (descreve o comportamento esperado)
2. 🟢 GREEN — Escrever codigo MINIMO para o teste PASSAR
3. 🔵 REFACTOR — Melhorar o codigo mantendo testes verdes
```

**Na pratica, para CADA tarefa abaixo:**

```
ANTES de implementar qualquer correcao:
  1. Configurar framework de testes (Vitest) se ainda nao existir
  2. Escrever *.spec.js/*.test.js PRIMEIRO
  3. Ver o teste FALHAR (confirma que testa algo real)
  4. Implementar a correcao
  5. Ver o teste PASSAR
  6. Refatorar se necessario
  7. Verificar coverage > 80% statements, > 70% branches

EXEMPLO — Corrigir validacao de input no firestoreService:
  1. Criar: services/__tests__/quartos.service.spec.js
  2. Escrever: it('should throw when empresaId is empty', ...)
  3. Rodar: teste FALHA (ainda nao tem validacao)
  4. Implementar: validateId(empresaId, 'empresaId') no service
  5. Rodar: teste PASSA
  6. Proximo teste: it('should throw when empresaId contains /', ...)
  7. Repetir ciclo

ORDEM DE ARQUIVOS (OBRIGATORIO):
  SEMPRE: *.spec.js → *.js (teste antes do codigo)
  NUNCA:  *.js → *.spec.js (isso e "test-after", NAO e TDD)
```

**Metricas TDD obrigatorias:**

| Metrica | Target |
|---------|--------|
| Test-first ratio | 100% (todo codigo tem teste anterior) |
| Red-Green time | < 5min por ciclo |
| Statement coverage | > 80% |
| Branch coverage | > 70% |
| Flaky test rate | 0% |

---

## SCORE GERAL DE QUALIDADE: 3.5/10

```
+-----------------------+-------+-----------------------------------+
| CATEGORIA             | SCORE | ISSUES                            |
+-----------------------+-------+-----------------------------------+
| Arquitetura & Design  | 2/10  | RED:10  ORANGE:9   YELLOW:4  GREEN:1 |
| Clean Code            | 3/10  | RED:3   ORANGE:13  YELLOW:12 GREEN:5 |
| Seguranca             | 2/10  | RED:10  ORANGE:8   YELLOW:4  GREEN:0 |
| Performance           | 3/10  | RED:2   ORANGE:8   YELLOW:8  GREEN:3 |
| Error Handling        | 2/10  | RED:1   ORANGE:11  YELLOW:5  GREEN:1 |
| TDD & Testabilidade   | 0/10  | ZERO testes no projeto inteiro      |
| Manuteniblidade       | 3/10  | RED:8   ORANGE:8   YELLOW:6  GREEN:2 |
| API / Firestore Rules | 3/10  | RED:3   ORANGE:2   YELLOW:1  GREEN:0 |
| UX / Acessibilidade   | 3/10  | RED:0   ORANGE:9   YELLOW:10 GREEN:2 |
| Dependencias          | 2/10  | RED:2   ORANGE:2   YELLOW:1  GREEN:0 |
+-----------------------+-------+-----------------------------------+
```

---

## TOP 10 PROBLEMAS MAIS CRITICOS

1. **FIRESTORE RULES: Privilege Escalation** — `firestore.rules:108-110` — Self-update check usa `resource.data` (doc existente) em vez de `request.resource.data` (dados enviados), permitindo que usuario altere suas proprias permissoes
2. **FIRESTORE RULES: Company Creation Broken** — `firestore.rules:126` — Usa `resource.data` em operacao CREATE onde `resource` e null, quebrando criacao de empresas
3. **FIRESTORE RULES: Multi-Tenant Data Leak** — `firestore.rules:131` — Logs legiveis por QUALQUER usuario autenticado de QUALQUER empresa
4. **ZERO TESTES** — Nenhum teste unitario, integracao ou E2E em todo o projeto
5. **Firebase API Keys hardcoded** — `firebase.js:11-18` — Chaves commitadas no codigo fonte sem env vars
6. **ZERO Input Validation em 33 funcoes Firestore** — `firestoreService.js` — Raw `...dados` spread em todo documento
7. **Admin check via email hardcoded** — `AuthContext.jsx:29` — `'arielpolita@gmail.com.br'` no codigo, bypass trivial
8. **XSS via innerHTML em impressao** — `Vendas.jsx:1148`, `Despesas.jsx:131` — Dados de usuario injetados em HTML sem sanitizacao
9. **Vendas.jsx com 1227 linhas** — 4x o limite de 300 linhas — God Component monolitico
10. **Sem paginacao em NENHUMA query** — Carrega colecoes inteiras do Firestore sem `limit()`

---

# ANALISE POR ARQUIVO

---

## 1. src/config/firebase.js (30 linhas)

```
METRICAS
LOC: 30 | Complexidade: 1 | Funcoes >30 linhas: 0
```

### 🔴 CRITICO

**1.1 — API Keys hardcoded no codigo fonte**
- Linha: 11-18
- Todas as credenciais Firebase (apiKey, appId, messagingSenderId, measurementId) commitadas no repositorio
```js
const firebaseConfig = {
  apiKey: "AIzaSyB-vb8B3g-g_b7XRTt8Zh1DNWEoZ8GKVAE",
  authDomain: "hotelfacil-850d1.firebaseapp.com",
  projectId: "hotelfacil-850d1",
  storageBucket: "hotelfacil-850d1.firebasestorage.app",
  messagingSenderId: "653289515883",
  appId: "1:653289515883:web:652cb9f1957f456214fa2e",
  measurementId: "G-JFZ48BJERZ"
};
```
- Impacto: Chaves visiveis para qualquer pessoa com acesso ao repo ou bundle JS. Sem rotacao de chaves. Sem config por ambiente.
- Correcao:
```js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};
```

### 🟡 MEDIO

**1.2 — `getAnalytics` chamado incondicionalmente**
- Linha: 27
- Explode em ambientes sem cookies, SSR, ou testes
- Correcao: `export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;`

### 🟢 BAIXO

**1.3 — Export `storage` possivelmente nao utilizado**
- Verificar com `npx depcheck`

---

## 2. src/services/firestoreService.js (502 linhas)

```
METRICAS
LOC: 502 | Complexidade max: 8 (addReserva) | Funcoes >30 linhas: 2
Funcoes exportadas: 33 | Profundidade max: 3
```

### 🔴 CRITICO

**2.1 — Arquivo com 502 linhas — viola limite de 300 por 67%**
- God Module com 8 entidades (quartos, reservas, despesas, fluxoCaixa, faturas, usuarios, fornecedores, bancos)
- Tem pelo menos 8 razoes independentes para mudar — violacao massiva de SRP
- Correcao: Quebrar em services por dominio:
  - `services/quartoService.js`
  - `services/reservaService.js`
  - `services/despesaService.js`
  - `services/fluxoCaixaService.js`
  - `services/faturaService.js`
  - `services/usuarioService.js`
  - `services/fornecedorService.js`
  - `services/bancoService.js`
  - `services/seedService.js`

**2.2 — ZERO validacao de input em TODAS as 33 funcoes**
- Linhas: 22, 29, 36, 45, 52, 58, 74, 90, 139, 146, 159, 174, etc.
- `empresaId`, `quartoId`, `reservaId` passados direto para paths Firestore sem nenhum check. String vazia, null, undefined ou path injection passam direto.
```js
export async function getQuartos(empresaId) {
  // empresaId pode ser null, undefined, string vazia, ou path malicioso
  const snap = await getDocs(
    query(collection(db, 'empresas', empresaId, 'quartos'), orderBy('numero'))
  );
```
- Correcao:
```js
function validateId(id, name) {
  if (!id || typeof id !== 'string' || id.trim().length === 0)
    throw new Error(`${name} is required and must be a non-empty string`);
  if (id.includes('/'))
    throw new Error(`${name} must not contain path separators`);
}
```

**2.3 — Raw `...dados` spread em TODAS as funcoes de escrita**
- Linhas: 101-106, 37, 206, 298, etc.
```js
const reservaData = {
  ...dados,    // QUALQUER campo arbitrario do caller entra no Firestore
  status: dados.status || 'confirmada',
};
```
- Impacto: Callers podem injetar campos como `__proto__`, `role`, `isAdmin`, ou corromper o schema
- Correcao: Destructure explicito apenas dos campos conhecidos

**2.4 — `addUsuario` cria conta Firebase Auth do LADO DO CLIENTE**
- Linhas: 337-366
```js
export async function addUsuario(empresaId, dados) {
  const userCredential = await createUserWithEmailAndPassword(auth, dados.email, dados.senha);
```
- Impacto: Apos `createUserWithEmailAndPassword`, o Firebase Auth SDK automaticamente loga como o NOVO usuario, fazendo logout silencioso do admin
- Correcao: Criacao de usuario deve ser via Cloud Function com Firebase Admin SDK

### 🟠 ALTO

**2.5 — Conversao Timestamp-to-Date duplicada 6+ vezes**
- Linhas: 62-71, 77-86, 178-185, 191-198, 245-253, 269-276, 284-293
- Mesmo padrao copy-paste em todo lugar:
```js
data.data?.toDate ? data.data.toDate() : new Date(data.data)
```
- Correcao: Extrair helper `firestoreToDate()` e `mapDocWithDates()`

**2.6 — Pattern onSnapshot listener duplicado 8 vezes**
- Cada entidade repete: `onSnapshot(query(...), snap => callback(snap.docs.map(...)))`
- Correcao: Factory generica `createListener(empresaId, subcollection, orderField, mapper, callback)`

**2.7 — CRUD para fornecedores/bancos/quartos sao patterns identicos**
- Apenas o nome da collection difere
- Correcao: Factory CRUD generica

**2.8 — `deleteUsuario` NAO deleta conta Firebase Auth**
- Linha: 376-378 — Apenas remove doc Firestore, Auth account continua ativa

**2.9 — `deleteDespesa` NAO remove entrada de fluxoCaixa vinculada**
- Linha: 236-238 — Orfana o registro financeiro, corrompe dados contabeis

**2.10 — ZERO error handling em todas 33 funcoes**
- Nenhuma funcao tem try-catch. Erros Firestore (rede, permissao, quota) nao sao tratados

**2.11 — `onSnapshot` listeners sem callback de erro**
- Linhas: 29-33, 74-88, 188-199, etc.
```js
return onSnapshot(query(...), snap => callback(snap.docs.map(...)));
//                                    ^-- sem 2o callback de erro
```
- Correcao: Adicionar handler de erro como 2o argumento

**2.12 — Sem paginacao em NENHUMA query**
- Todas as queries buscam colecao INTEIRA sem `limit()`
- Impacto: Custos Firestore escalam linearmente com dados historicos

### 🟡 MEDIO

**2.13 — `addDespesa` nao valida `dados.data` antes de `Timestamp.fromDate`**
- Linha: 208 — `new Date(undefined)` produz `Invalid Date`, crash no batch

**2.14 — Race condition em `addUsuario`: Auth sucede, Firestore pode falhar**
- Linhas: 337-366 — Sem rollback do Auth user se write Firestore falhar

**2.15 — `seedDadosIniciais` le todos quartos so pra checar se existe**
- Linha: 398 — `limit(1)` seria suficiente

---

## 3. src/context/AuthContext.jsx (387 linhas)

```
METRICAS
LOC: 387 | Complexidade max: 7 | Funcoes >30 linhas: 3
```

### 🔴 CRITICO

**3.1 — Arquivo excede 300 linhas (387)**
- God Context com 5+ responsabilidades: auth, trial, empresa selection, admin ops, error translation
- Correcao: Separar em `AuthContext`, `EmpresaContext`, `TrialContext`, `utils/authErrors.js`

**3.2 — Admin check via email hardcoded**
- Linhas: 29, 42-44
```js
const ADMIN_EMAIL = 'arielpolita@gmail.com.br';
function isAdmin() {
  return currentUser?.email === ADMIN_EMAIL;
}
```
- Impacto: (1) Email visivel no bundle. (2) Check APENAS client-side. (3) Qualquer usuario pode chamar Firestore REST e ignorar
- Correcao: Firebase Custom Claims para roles, enforcado nas Firestore Rules

**3.3 — `window.location.reload()` apos criar conta**
- Linha: 150
```js
await new Promise(resolve => setTimeout(resolve, 1000));
window.location.reload();
```
- Impacto: (1) 1s arbitrario — race condition se Firestore demorar mais. (2) Perde todo estado em memoria. (3) `return user` na linha 152 e DEAD CODE

### 🟠 ALTO

**3.4 — 14 console.log em codigo de producao**
- Linhas: 39, 104, 109, 113, 123, 144, 191, 203, 225, 242, 243, 268, 305, 310
- Correcao: Remover todos ou usar logger com controle de nivel

**3.5 — `ativarEmpresa` e `listarTodasEmpresas` com auth APENAS client-side**
- Linhas: 255-258
- Correcao: Firestore Rules devem enforcar admin-only

**3.6 — `empresaAtualId` de localStorage sem validacao de ownership**
- Linhas: 209, 236
- Valor stale ou malicioso pode carregar dados de empresa alheia

**3.7 — `verificarStatusTrial` retorna 'expired' em QUALQUER erro**
- Linhas: 81-84
- Impacto: Firestore fora do ar = usuario bloqueado (falso negativo)

**3.8 — Race condition no useEffect onAuthStateChanged**
- Linhas: 304-345
- Auth state mudando rapido = chains async concorrentes setando state stale
- Correcao: Abort flag no useEffect

---

## 4. src/context/HotelFirestoreContext.jsx (290 linhas)

```
METRICAS
LOC: 290 | Complexidade max: 5 | Funcoes >30 linhas: 0
```

### 🔴 CRITICO

**4.1 — 8 colecoes carregadas simultaneamente no mount, sem lazy loading**
- Linhas: 63-87
- TODAS as 8 real-time listeners ativam de uma vez, buscando colecoes inteiras
- Impacto: Hotel com anos de dados = custo Firestore enorme + latencia

### 🟠 ALTO

**4.2 — 24 useCallback wrappers identicos — violacao DRY massiva**
- Linhas: 90-215
- Mesmo pattern repetido 24 vezes com apenas nome da funcao variando
- Correcao: Factory `useEmpresaAction(empresaId, action)`

**4.3 — Context value recriado a cada render**
- Linhas: 234-282
- Sem `useMemo`, causando re-render de todos consumers
- Correcao: Envolver em `useMemo` com deps

**4.4 — `seedDadosIniciais` e `seedBancosIniciais` chamados em CADA mudanca de empresaId**
- Linhas: 72-73

**4.5 — ISP violation: 38 propriedades exportadas (28 funcoes + 10 estados)**
- Fat interface que toda page consome inteira

### 🟡 MEDIO

**4.6 — `getDisponibilidade` com complexidade O(quartos * reservas)**
- Linhas: 218-232
- 100 quartos x 1000 reservas = 100,000 comparacoes
- Correcao: Pre-indexar reservas por quartoId com Map

**4.7 — `setLoading(false)` depende apenas do listener de quartos**
- Linha: 76 — UI mostra "carregado" com dados incompletos

---

## 5. src/pages/Vendas.jsx (1227 linhas)

```
METRICAS
LOC: 1227 | Profundidade max: 7+ | useState: 16 | Funcoes >30: 5
```

### 🔴 CRITICO

**5.1 — 1227 linhas — 4x o limite de 300**
- God Component com 10+ responsabilidades:
  1. Reservation CRUD
  2. Payment processing
  3. Receipt generation/print
  4. Cancellation workflow
  5. Bank CRUD
  6. Filtering/search
  7. Status management (check-in/check-out)
  8. Invoice creation
  9. Value calculation
  10. Mobile + Desktop layouts
- Correcao: Extrair em 9+ arquivos:
  - `ReservaFormModal.jsx` (~190 linhas)
  - `PagamentoModal.jsx` (~180 linhas)
  - `CancelamentoModal.jsx` (~45 linhas)
  - `ReciboModal.jsx` (~105 linhas)
  - `BancoModal.jsx` (~60 linhas)
  - `ReservaMobileCard.jsx` (~70 linhas)
  - `ReservaDesktopTable.jsx` (~75 linhas)
  - `hooks/useReservaForm.js` (~120 linhas)
  - `utils/masks.js` (~20 linhas)

**5.2 — XSS via innerHTML em impressao de recibo**
- Linhas: 1148-1153
```js
const conteudo = document.getElementById('recibo-print').innerHTML;
const janela = window.open('','_blank');
janela.document.write(`<!DOCTYPE html>...${conteudo}...`);
```
- Impacto: Nome do hospede ou observacoes com `<script>` executam na nova janela
- Correcao: DOMPurify ou `react-to-print`

### 🟠 ALTO

**5.3 — `fmt` duplicado em 5+ arquivos**
- Linha: 9
```js
const fmt = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v||0);
```
- Mesmo codigo em: Vendas.jsx:9, Dashboard.jsx:13, Despesas.jsx:7, FluxoCaixa.jsx:9, DRE.jsx:15
- Correcao: Extrair para `utils/formatters.js`

**5.4 — `toDate()` duplicado em 4+ arquivos com COMPORTAMENTO DIFERENTE**
- Dashboard.jsx:16, Despesas.jsx:22, Layout.jsx:14 definem versoes locais
- utils/dateUtils.js tem a versao correta
- Impacto: Bugs sutis de comparacao de datas entre paginas

**5.5 — 16 `useState` em um unico componente**
- Linhas: 164-179 — Sinal claro de SRP violation

**5.6 — Inline arrow functions em lists JSX**
- Linhas: 525-543, 602-621
- Centenas de closures novas criadas por render

**5.7 — `setTimeout` para calculo de valor em vez de useEffect**
- Linhas: 715, 742, 754
```js
setTimeout(() => calcularValor(qId, null, null), 50);
```

**5.8 — Erros silenciados com console.error**
- Linhas: 364, 375
```js
} catch (e) { console.error(e); }
```

**5.9 — Sem validacao de check-out > check-in**
- Linhas: 735-757

---

## 6. src/pages/Dashboard.jsx (600 linhas)

```
METRICAS
LOC: 600 | Profundidade max: 5 | useMemo: 2 | useEffect: 1
```

### 🟠 ALTO

**6.1 — 600 linhas, limite 300**
- Correcao: Extrair `StatCard`, `RoomStatusCard`, `FinancialCard`, `BillsTable`, `ReminderModal`, `useDashboardStats` hook

**6.2 — `toDate()` duplicada localmente (16-25) em vez de importar de dateUtils**

---

## 7. src/pages/Faturas.jsx (786 linhas)

```
METRICAS
LOC: 786 | Profundidade max: 5 | useState: 6 | useEffect: 1 | useMemo: 0
```

### 🔴 CRITICO

**7.1 — 786 linhas, limite 300**

**7.2 — Mock data hardcoded em producao**
- Linhas: 232-271
```js
const mockFaturas = faturas.length === 0 ? [
  { id: '1', empresaCliente: 'Empresa ABC Ltda', cnpj: '12.345.678/0001-90', ... },
  { id: '2', empresaCliente: 'Construtora XYZ S.A.', ... }
] : filteredFaturas;
```
- Viola CLAUDE.md: "NEVER hardcode data in frontend"
- Correcao: Mostrar empty state quando nao ha dados

**7.3 — useEffect/setState loop risk para estado derivado**
- Linhas: 98-104
```js
useEffect(() => {
  setFormData(prev => ({ ...prev, valorTotal: calcularValorTotal(), proximaFatura: calcularProximaFatura() }));
}, [formData.valorMensal, formData.tipoContrato, formData.dataInicio]);
```
- `valorTotal` e `proximaFatura` sao valores derivados — devem ser `useMemo`, nao state

### 🟠 ALTO

**7.4 — Sem validacao: CNPJ aceita qualquer texto**
- Linha: 529

**7.5 — Sem validacao: dataFim pode ser antes de dataInicio**
- Linhas: 636-661

**7.6 — Sem `useMemo` em `filteredFaturas`**
- Linha: 189

**7.7 — Sem loading state**
- Renderiza imediatamente sem verificar `loading`

---

## 8. src/pages/Usuarios.jsx (790 linhas)

```
METRICAS
LOC: 790 | useState: 7 | useMemo: 0
```

### 🔴 CRITICO

**8.1 — 790 linhas, limite 300**

**8.2 — Senha armazenada como texto plano no Firestore**
- Linhas: 188-189
```js
const usuarioData = {
  ...formData,  // inclui `senha` como texto plano
```
- NUNCA armazenar senhas no Firestore. Usar Firebase Auth exclusivamente

**8.3 — Mock data hardcoded em producao**
- Linhas: 298-347 — Mesma violacao de Faturas

### 🟠 ALTO

**8.4 — Sem verificacao de autorizacao na pagina**
- Qualquer usuario autenticado acessa /usuarios e faz CRUD de outros usuarios

**8.5 — `alert()` para validacao**
- Linhas: 178, 183, 214, 238, 245
- Bloqueia thread, nao estilizavel, UX terrivel

**8.6 — Minimo 6 chars para senha e inseguro**
- Linha: 182 — Recomendado minimo 8-12 com complexidade

---

## 9. src/pages/Despesas.jsx (509 linhas)

```
METRICAS
LOC: 509 | useState: 14 | Profundidade max: 5
```

### 🔴 CRITICO

**9.1 — 509 linhas, limite 300**

**9.2 — XSS em relatorio de impressao via innerHTML**
- Linhas: 131-188
```js
`<td>${d.descricao}${d.fornecedor ? `<br><small>${d.fornecedor}</small>` : ''}</td>`
```
- Correcao: `escapeHtml()` em todos os dados de usuario antes de interpolar

**9.3 — `toDate()` duplicada com comportamento DIFERENTE de dateUtils**
- Linhas: 22-28 — Versao local sem normalizacao de midnight

### 🟠 ALTO

**9.4 — Modal duplicado (identico em FluxoCaixa.jsx e Quartos.jsx)**
**9.5 — `fmt`, `inputCls`, `selectCls` duplicados em 3+ arquivos**
**9.6 — 14 useState em um componente**
**9.7 — Erros silenciados com console.error**
**9.8 — Sem `useMemo` em totalPendente/totalPago**

---

## 10. src/pages/DRE.jsx (448 linhas)

```
METRICAS
LOC: 448 | useMemo: 1 (81 linhas!) | Componentes: 3
```

### 🔴 CRITICO

**10.1 — 448 linhas, limite 300**

**10.2 — useMemo de 81 linhas com 6+ responsabilidades**
- Linhas: 125-206
- Faz: revenue filtering, expense filtering, expense grouping, chart data, trend calculations
- Correcao: Quebrar em funcoes puras e memos separados

### 🟠 ALTO

**10.3 — Pattern filter+reduce repetido 10+ vezes**
- `items.filter(condition).reduce((s,f) => s + (f.valor||0), 0)` — extrair helper

**10.4 — Linhas de 180+ caracteres inatintiveis**
- Linhas: 192-196

---

## 11. src/pages/FluxoCaixa.jsx (253 linhas)

```
METRICAS
LOC: 253 | OK (<300)
```

### 🟠 ALTO

**11.1 — Modal duplicado**
**11.2 — fmt/inputCls/selectCls duplicados**
**11.3 — Erro silenciado com console.error**
**11.4 — Linha de 200+ chars com comparacao de datas complexa**
**11.5 — Seletor de mes so mostra ano atual**
**11.6 — `loading` destructured mas nunca usado no JSX**

---

## 12. src/pages/Quartos.jsx (309 linhas)

```
METRICAS
LOC: 309 | Marginalmente acima de 300
```

### 🟠 ALTO

**12.1 — Modal e Field duplicados**
**12.2 — Sem validacao de unicidade do numero do quarto**
**12.3 — `quartosFiltrados` sem useMemo**
**12.4 — Manipulacao de string CSS fragil**
- Linha: 162
```js
cfg.dot.replace('bg-', 'bg-').replace('500', '100')
```
- `replace('bg-', 'bg-')` e um no-op. `replace('500', '100')` quebra se Tailwind purgar classes

---

## 13. src/pages/Disponibilidade.jsx (221 linhas)

```
METRICAS
LOC: 221 | OK (<300)
```

### 🔴 CRITICO

**13.1 — Complexidade O(Quartos x Dias x Reservas) em cada render**
- Linhas: 41-76, 78-87, renderizado em 178-179
- 50 quartos x 30 dias x 200 reservas = 300,000 iteracoes por render
- Correcao: Pre-computar `Map<quartoId, Map<dateStr, status>>` com useMemo

### 🟠 ALTO

**13.2 — `getStatusDia` e `getReservaDia` duplicam 90% da logica de filtro**
- Correcao: Unificar em funcao retornando `{ status, reserva }`

**13.3 — Tooltip expoe nome do hospede (possivel violacao LGPD)**
- Linhas: 191-194

**13.4 — Sem ARIA no grid do calendario**
- Cells sao `<div>` sem `role`, `aria-label`, `tabindex`, navegacao por teclado

---

## 14. src/pages/Fornecedores.jsx (364 linhas)

### 🔴 CRITICO

**14.1 — 364 linhas, limite 300**

### 🟠 ALTO

**14.2 — Modal implementado DIFERENTE de todas as outras paginas**
**14.3 — Sem validacao de formulario (nome, email, CNPJ)**
**14.4 — `alert()` para erros**
**14.5 — Masks formatam mas nao validam (CNPJ check digits)**

---

## 15. src/pages/Configuracoes.jsx (333 linhas)

### 🔴 CRITICO

**15.1 — 333 linhas, limite 300**

### 🟠 ALTO

**15.2 — ZERO validacao de input (CNPJ, email, CEP)**
**15.3 — Sem mascaras de input (Fornecedores tem, Configuracoes nao — inconsistente)**
**15.4 — SVG upload aceito sem sanitizacao (XSS via SVG)**
- Linha: 62 — `file.type.startsWith('image/')` permite `image/svg+xml` com scripts embarcados
- Correcao: Whitelist `['image/png', 'image/jpeg', 'image/webp']`

---

## 16. src/pages/AdminPanel.jsx (336 linhas)

### 🔴 CRITICO

**16.1 — 336 linhas, limite 300**

**16.2 — useEffect com dep array vazio mas funcao de context na closure**
- Linhas: 23-25 — `listarTodasEmpresas` nao esta no dep array

### 🟠 ALTO

**16.3 — Sem autorizacao server-side (Firestore Rules)**
**16.4 — Filter buttons copy-paste 4x**
**16.5 — Stats cards copy-paste 4x**
**16.6 — `formatarData` nao usa shared `toDate()`**

---

## 17. src/App.jsx (114 linhas)

### 🟠 ALTO

**17.1 — ErrorBoundary definido inline — extrair para componente proprio**
**17.2 — ZERO controle de acesso por role nas rotas**
- Linhas: 82-95 — `/usuarios`, `/configuracoes`, `/admin` acessiveis por qualquer usuario autenticado
- Correcao:
```jsx
<Route path="/usuarios" element={<RequireRole roles={['Administrador']}><Usuarios /></RequireRole>} />
```

**17.3 — ErrorBoundary no lugar errado**
- Dentro de AppContent, nao cobre erros em AuthProvider ou loading screen
- Correcao: Mover para envolver `<AppContent />` na funcao `App()`

**17.4 — Sem lazy loading — todos os 11 pages importados estaticamente**
- Linhas: 6-16
- Correcao: `const Dashboard = lazy(() => import('./pages/Dashboard'));`

**17.5 — Sem pagina 404**
- Linha: 95 — `path="*"` redireciona silenciosamente para /dashboard

---

## 18. src/components/Layout.jsx (308 linhas)

### 🟠 ALTO

**18.1 — God Component: sidebar, header, alertas, notificacoes, layout — 5+ responsabilidades**
**18.2 — `toDate()` e `fmt()` definidos inline (duplicados de dateUtils e outros)**
**18.3 — Dados financeiros expostos a TODOS os usuarios na notificacao bell**
**18.4 — Re-render de todo layout em cada mudanca de despesas**

### 🟡 MEDIO

**18.5 — Sem ARIA no dropdown de notificacoes (aria-expanded, aria-haspopup, role)**
**18.6 — Sem ARIA na sidebar (role="navigation")**
**18.7 — Sem focus trap no sidebar mobile**

---

## 19. DEAD CODE — 4 arquivos (450 linhas)

| Arquivo | Motivo |
|---------|--------|
| `src/components/Sidebar.jsx` (136 linhas) | Nunca importado; Layout.jsx tem sidebar inline |
| `src/components/TopBar.jsx` (132 linhas) | Nunca importado; Layout.jsx tem header inline |
| `src/components/ProtectedRoute.jsx` (35 linhas) | Nunca importado; App.jsx faz auth inline |
| `src/components/EmpresaSelector.jsx` (147 linhas) | So importado por ProtectedRoute (dead) |

- Correcao: Deletar todos os 4 arquivos

Problemas adicionais nos arquivos dead:
- TopBar.jsx:59,85,88 — Nome e email pessoal do dev hardcoded como fallback
- TopBar.jsx:61 — Role "Administrador" hardcoded
- Sidebar.jsx:46 — `useHotel().logout` (auth vazando para context errado)

---

## 20. src/components/Login.jsx (307 linhas)

### 🟠 ALTO

**20.1 — Sem validacao de forca de senha**
**20.2 — Sem sanitizacao de input (nome empresa, CNPJ)**
**20.3 — Sem rate limiting/CAPTCHA em registro**
**20.4 — Sem validacao de formato CNPJ/telefone**
**20.5 — `handleSubmit` com 44 linhas e 3 modos misturados**

### 🟡 MEDIO

**20.6 — Sem `autoComplete` nos inputs (email, password, name)**
**20.7 — Sem focus management ao trocar modo (login/cadastro/recuperar)**
**20.8 — Sem `aria-live` em mensagens de erro/sucesso**

---

## 21. src/components/TrialExpired.jsx (119 linhas)

### 🟠 ALTO

**21.1 — Preco hardcoded: `R$ 99,90`**
- Linhas: 45, 80

**21.2 — Email pessoal hardcoded: `arielpolita@gmail.com`**
- Linhas: 84, 105

---

## 22. firestore.rules (141 linhas)

### 🔴 CRITICO

**22.1 — Self-update permission check INVERTIDO**
- Linhas: 108-110
```
!("permissoes" in resource.data) && !("acesso.funcao" in resource.data)
```
- Usa `resource.data` (doc existente) em vez de `request.resource.data` (dados enviados)
- Impacto: Permite privilege escalation — usuario pode alterar suas proprias permissoes
- Correcao:
```
!("permissoes" in request.resource.data.diff(resource.data).affectedKeys()) &&
!("acesso" in request.resource.data.diff(resource.data).affectedKeys())
```

**22.2 — Create rule usa `resource.data` em operacao CREATE**
- Linha: 126
- `resource` e null em CREATE — esta regra SEMPRE falha, quebrando criacao de empresas
- Correcao: `request.resource.data.auditoria.criadoPor == request.auth.uid`

**22.3 — Logs legiveis por QUALQUER usuario autenticado**
- Linhas: 131-132
```
allow read: if isAuthenticated();
allow create: if isAuthenticated();
```
- Impacto: Vazamento de dados entre tenants
- Correcao: Scoped a empresa

**22.4 — Sem validacao de schema em NENHUMA regra de escrita**
- Campos arbitrarios podem ser escritos em qualquer documento

**22.5 — Collections documentadas sem regras**
- `hospedes`, `dados_empresa`, `configuracoes_hotel`, `fornecedores` — caem no deny-all, ficam INACESSIVEIS

### 🟠 ALTO

**22.6 — Cada read/write faz document read adicional para checar permissoes**
- Linhas: 20, 26, 31, 38 — `get()` em cada operacao
- Correcao: Custom Claims em vez de document reads

---

## 23. package.json

### 🔴 CRITICO

**23.1 — `firebase-admin` em devDependencies**
- SDK SERVER-SIDE em projeto client-side SPA. Se importado acidentalmente, expoe logica de admin

**23.2 — `next-themes` em projeto Vite/React (nao Next.js)**
- Dependencia errada para o framework

### 🟠 ALTO

**23.3 — 17+ dependencias possivelmente nao utilizadas**
- `@radix-ui/react-accordion`, `aspect-ratio`, `context-menu`, `hover-card`, `menubar`, `navigation-menu`, `progress`, `radio-group`, `scroll-area`, `slider`, `toggle`, `toggle-group`
- `cmdk`, `embla-carousel-react`, `input-otp`, `react-resizable-panels`, `vaul`
- Correcao: `npx depcheck` e remover

**23.4 — Sem script de teste, type-check, ou format**
**23.5 — Sem framework de teste (jest, vitest, testing-library)**

---

## 24. eslint.config.js

### 🟡 MEDIO

**24.1 — `no-unused-vars` regex muito permissivo: `'^[A-Z_]'`**
- Ignora TODAS variaveis com uppercase, escondendo componentes genuinamente nao usados

**24.2 — Faltam plugins essenciais**
- Sem `eslint-plugin-jsx-a11y` (acessibilidade)
- Sem `eslint-plugin-react` (boas praticas JSX)
- Sem `eslint-plugin-import` (import order)
- Sem Prettier

---

# DIP — INVERSAO DE DEPENDENCIAS DO FIRESTORE (CRITICO PARA MIGRACAO)

## Diagnostico: Acoplamento Total com Firebase

O projeto inteiro esta **diretamente acoplado ao Firestore e Firebase Auth** em TODAS as camadas. Nao existe nenhuma abstracao, interface, ou camada de indireção. Cada arquivo importa diretamente `firebase/firestore`, `firebase/auth`, ou o singleton `db`/`auth`.

**Isso significa:** trocar o Firestore por PostgreSQL (ou qualquer outro banco) exige reescrever TODOS os arquivos listados abaixo. Sem inversao de dependencias, a migracao e uma reescrita completa.

### Mapa de Acoplamento Direto com Firebase

```
CAMADA 1 — Firebase SDK (config/firebase.js)
  Exporta: db, auth, storage, analytics
  Importa: firebase/app, firebase/auth, firebase/firestore, firebase/storage, firebase/analytics
  Problema: API keys hardcoded, sem env vars, sem abstracao

CAMADA 2 — Service Layer (services/firestoreService.js — 502 linhas)
  Importa DIRETAMENTE: addDoc, updateDoc, deleteDoc, getDocs, onSnapshot,
                        serverTimestamp, writeBatch, collection, doc, query,
                        orderBy, Timestamp, createUserWithEmailAndPassword
  Importa: db, auth de '../config/firebase'
  Problema: 33 funcoes exportadas, TODAS com chamadas Firestore inline.
            Nenhuma interface. Nenhuma abstracao. Impossivel mockar para testes.

CAMADA 3 — Context Layer (context/HotelFirestoreContext.jsx — 290 linhas)
  Importa: 24 funcoes de '../services/firestoreService'
  Problema: Nome do arquivo contem "Firestore". 24 useCallback wrappers
            chamam firestoreService diretamente. Se trocar o service,
            precisa reescrever 24 wrappers.

CAMADA 4 — Context Layer (context/AuthContext.jsx — 387 linhas)
  Importa DIRETAMENTE: createUserWithEmailAndPassword, signInWithEmailAndPassword,
                        signOut, sendPasswordResetEmail, onAuthStateChanged, updateProfile
                        de 'firebase/auth'
  Importa DIRETAMENTE: doc, setDoc, getDoc, getDocs, collection, query,
                        where, updateDoc, serverTimestamp, Timestamp
                        de 'firebase/firestore'
  Importa: auth, db de '../config/firebase'
  Problema: PIOR arquivo. Auth + Firestore misturados. Nenhuma abstracao.
            Logica de negocio (trial, empresa) acoplada a chamadas Firebase.

CAMADA 5 — Pages (12 paginas)
  TODAS importam: useHotel de '../context/HotelFirestoreContext'
  Problema: Nome "HotelFirestoreContext" vaza a implementacao para toda page.
            Se trocar para React Query + API REST, cada page precisa mudar imports.

CAMADA 6 — Configuracoes.jsx (unico page que importa Firebase diretamente)
  Importa: storage de '../config/firebase'
  Importa: ref, uploadBytes, getDownloadURL de 'firebase/storage'
  Problema: Upload de imagem acoplado diretamente ao Firebase Storage.
```

### Resumo: 7 arquivos acoplados ao Firebase, 12 acoplados ao nome "Firestore"

| Arquivo | Imports Firebase Diretos | Impacto na Migracao |
|---------|--------------------------|---------------------|
| `config/firebase.js` | 5 SDKs (app, auth, firestore, storage, analytics) | Reescrever inteiro |
| `services/firestoreService.js` | 14 funcoes Firestore + 1 Auth | Reescrever inteiro (33 funcoes) |
| `context/AuthContext.jsx` | 6 Auth + 10 Firestore | Reescrever inteiro |
| `context/HotelFirestoreContext.jsx` | 24 imports de firestoreService | Reescrever 24 wrappers + renomear |
| `pages/Configuracoes.jsx` | 3 Storage | Reescrever upload |
| `services/firestoreServiceOld.js` | 14 funcoes Firestore | Deletar (dead code) |
| 12 pages (*.jsx) | `useHotel` de `HotelFirestoreContext` | Renomear imports |

---

## Correcoes: Preparar para Migracao (DIP)

### 🔴 CRITICO — C1: Criar camada de abstracao para dados (Repository Pattern)

**Problema:** `firestoreService.js` e o unico ponto de acesso a dados mas esta 100% acoplado ao Firestore SDK. Cada funcao chama `collection()`, `doc()`, `addDoc()`, etc. diretamente.

**Correcao:** Criar interfaces de servico (contratos) que o Context consome, e implementacoes concretas por backend:

```
ANTES:
  Pages → HotelFirestoreContext → firestoreService → Firestore SDK

DEPOIS:
  Pages → HotelContext → ServiceInterface → FirestoreAdapter (agora)
                                          → ApiAdapter (depois, para Postgres)
```

**Estrutura proposta:**

```
src/
├── services/
│   ├── interfaces/              ← NOVO: contratos (o que cada service faz)
│   │   ├── quartos.interface.js
│   │   ├── reservas.interface.js
│   │   ├── despesas.interface.js
│   │   ├── fluxoCaixa.interface.js
│   │   ├── faturas.interface.js
│   │   ├── usuarios.interface.js
│   │   ├── fornecedores.interface.js
│   │   ├── bancos.interface.js
│   │   └── auth.interface.js
│   ├── firestore/               ← NOVO: implementacao Firestore (mover codigo atual)
│   │   ├── quartos.firestore.js
│   │   ├── reservas.firestore.js
│   │   ├── despesas.firestore.js
│   │   ├── fluxoCaixa.firestore.js
│   │   ├── faturas.firestore.js
│   │   ├── usuarios.firestore.js
│   │   ├── fornecedores.firestore.js
│   │   ├── bancos.firestore.js
│   │   └── auth.firestore.js
│   ├── api/                     ← FUTURO: implementacao API REST (para Postgres)
│   │   ├── quartos.api.js
│   │   ├── reservas.api.js
│   │   └── ...
│   └── index.js                 ← Factory: escolhe implementacao por env var
```

**Exemplo concreto — Interface de Quartos:**

```javascript
// services/interfaces/quartos.interface.js
//
// Contrato: QUALQUER implementacao (Firestore, API REST, mock) deve
// expor estas funcoes com estas assinaturas.
//
// listar(empresaId) → Promise<Quarto[]>
// escutar(empresaId, callback) → unsubscribe function
// criar(empresaId, dados) → Promise<string> (id)
// atualizar(empresaId, quartoId, dados) → Promise<void>
// deletar(empresaId, quartoId) → Promise<void>
```

**Implementacao Firestore (mover codigo atual):**

```javascript
// services/firestore/quartos.firestore.js
import { db } from '../../config/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

export const quartosFirestore = {
  async listar(empresaId) {
    const snap = await getDocs(
      query(collection(db, 'empresas', empresaId, 'quartos'), orderBy('numero'))
    );
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  escutar(empresaId, callback) {
    return onSnapshot(
      query(collection(db, 'empresas', empresaId, 'quartos'), orderBy('numero')),
      snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  },

  async criar(empresaId, dados) {
    const ref = await addDoc(collection(db, 'empresas', empresaId, 'quartos'), {
      ...dados, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp()
    });
    return ref.id;
  },

  async atualizar(empresaId, quartoId, dados) {
    await updateDoc(doc(db, 'empresas', empresaId, 'quartos', quartoId), {
      ...dados, atualizadoEm: serverTimestamp()
    });
  },

  async deletar(empresaId, quartoId) {
    await deleteDoc(doc(db, 'empresas', empresaId, 'quartos', quartoId));
  }
};
```

**Futura implementacao API REST (para migracao Postgres):**

```javascript
// services/api/quartos.api.js
import { api } from '../api';

export const quartosApi = {
  async listar(empresaId) {
    const { data } = await api.get(`/empresas/${empresaId}/quartos`);
    return data;
  },

  escutar(empresaId, callback) {
    // WebSocket via Socket.IO — server emite 'quartos:updated'
    // Ou: polling via React Query (invalidateQueries)
    // Retorna funcao de cleanup
  },

  async criar(empresaId, dados) {
    const { data } = await api.post(`/empresas/${empresaId}/quartos`, dados);
    return data.id;
  },

  async atualizar(empresaId, quartoId, dados) {
    await api.put(`/empresas/${empresaId}/quartos/${quartoId}`, dados);
  },

  async deletar(empresaId, quartoId) {
    await api.delete(`/empresas/${empresaId}/quartos/${quartoId}`);
  }
};
```

**Factory que escolhe implementacao:**

```javascript
// services/index.js
import { quartosFirestore } from './firestore/quartos.firestore';
import { reservasFirestore } from './firestore/reservas.firestore';
// ... etc

// FUTURO: import { quartosApi } from './api/quartos.api';

const USE_API = import.meta.env.VITE_USE_API === 'true';

export const quartosService = USE_API ? quartosApi : quartosFirestore;
export const reservasService = USE_API ? reservasApi : reservasFirestore;
// ... etc
```

---

### 🔴 CRITICO — C2: Renomear HotelFirestoreContext → HotelContext

**Problema:** O nome `HotelFirestoreContext` vaza a implementacao (Firestore) para os 12 consumers (pages). Quando migrar para Postgres, o nome fica enganoso.

**Correcao em 2 passos:**

1. Renomear arquivo: `HotelFirestoreContext.jsx` → `HotelContext.jsx`
2. Find/replace em 12 arquivos:
   - `import { useHotel } from '../context/HotelFirestoreContext'` → `import { useHotel } from '../context/HotelContext'`
   - `import { HotelProvider } from './context/HotelFirestoreContext'` → `import { HotelProvider } from './context/HotelContext'`

**Arquivos afetados (13):**
- `src/App.jsx`
- `src/components/Layout.jsx`
- `src/components/Sidebar.jsx` (dead code, deletar)
- `src/pages/Dashboard.jsx`
- `src/pages/Disponibilidade.jsx`
- `src/pages/Quartos.jsx`
- `src/pages/Vendas.jsx`
- `src/pages/Faturas.jsx`
- `src/pages/Despesas.jsx`
- `src/pages/FluxoCaixa.jsx`
- `src/pages/DRE.jsx`
- `src/pages/Usuarios.jsx`
- `src/pages/Fornecedores.jsx`

---

### 🔴 CRITICO — C3: Extrair AuthContext da dependencia direta do Firebase Auth

**Problema:** `AuthContext.jsx` importa 6 funcoes de `firebase/auth` e 10 de `firebase/firestore` diretamente. E o arquivo mais acoplado ao Firebase do projeto inteiro.

**Correcao:** Criar `services/firestore/auth.firestore.js` que encapsula TODAS as chamadas Firebase Auth + Firestore de auth:

```javascript
// services/firestore/auth.firestore.js
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, collection, query, where, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export const authFirestore = {
  async register(email, senha, nome) { /* ... */ },
  async login(email, senha) { /* ... */ },
  async logout() { /* ... */ },
  async resetPassword(email) { /* ... */ },
  onAuthChange(callback) { /* ... */ },
  async loadUserEmpresas(uid) { /* ... */ },
  async loadEmpresa(empresaId) { /* ... */ },
  async checkTrial(empresaId) { /* ... */ },
  async activateEmpresa(empresaId) { /* ... */ },
  async listAllEmpresas() { /* ... */ },
};
```

**Depois:** `AuthContext.jsx` importa APENAS `authFirestore` (ou `authApi` no futuro) — zero imports de `firebase/*`.

---

### 🔴 CRITICO — C4: Isolar Firebase Storage (Configuracoes.jsx)

**Problema:** `Configuracoes.jsx` e a unica page que importa Firebase Storage diretamente:
```javascript
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
```

**Correcao:** Extrair para `services/firestore/storage.firestore.js`:

```javascript
// services/firestore/storage.firestore.js
import { storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const storageFirestore = {
  async uploadImage(path, file) {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }
};

// Configuracoes.jsx importa apenas:
// import { storageService } from '../services';
```

---

### 🟠 ALTO — C5: HotelContext deve consumir services injetados, nao importar diretamente

**Problema atual:**
```javascript
// HotelFirestoreContext.jsx linhas 1-37
import { getQuartos, onQuartos, addQuarto, updateQuarto, deleteQuarto,
         getReservas, onReservas, addReserva, updateReserva, ...
} from '../services/firestoreService';
```
24 imports diretos do firestoreService.

**Correcao:** Importar do factory (`services/index.js`):
```javascript
// HotelContext.jsx
import { quartosService, reservasService, despesasService, ... } from '../services';

// Dentro do provider:
const unsubQuartos = quartosService.escutar(empresaId, setQuartos);
const unsubReservas = reservasService.escutar(empresaId, setReservas);
// ...
```

Quando migrar para API REST, muda APENAS `services/index.js` (a factory) e `VITE_USE_API=true` no .env.

---

### 🟠 ALTO — C6: Deletar firestoreServiceOld.js (dead code)

**Problema:** `src/services/firestoreServiceOld.js` e um arquivo de 340 linhas que nao e importado por nenhum outro arquivo. E uma versao antiga do service com pattern de classe.

**Correcao:** Deletar o arquivo. Zero impacto.

---

> **Tarefas de execucao:** ver Sprint 3 (DIP) no PLANO MESTRE.
> Beneficio: Com DIP aplicado, migracao Postgres = criar `services/api/` (~500 linhas) + trocar 1 env var.
> Sem DIP: reescrever ~3000 linhas em 7 arquivos + 12 pages.

---

# ISSUES CROSS-CUTTING (PROJETO INTEIRO)

## Acessibilidade (a11y)

| Issue | Onde |
|-------|------|
| Botoes icon-only sem `aria-label` | Vendas, Faturas, Usuarios, Despesas, Fornecedores |
| Modais sem focus trap | Vendas, Faturas, Usuarios, Despesas |
| Modais sem `role="dialog"` e `aria-modal` | Todos os modais |
| Modais sem handler de Escape | Todos os modais |
| Labels sem `htmlFor`/`id` | Todos os formularios |
| Selects sem `aria-label` | Filtros em Faturas, Usuarios, Despesas |
| Grid calendario sem ARIA | Disponibilidade |
| Sem `aria-live` em mensagens dinamicas | Login, formularios |

## DRY Violations (Codigo Duplicado)

| Codigo | Duplicado em |
|--------|-------------|
| `fmt()` currency formatter | Vendas, Dashboard, Despesas, FluxoCaixa, DRE, Layout, Quartos |
| `toDate()` function | Dashboard, Despesas, Layout (3 copias locais + 1 em utils) |
| `Modal` component | Vendas (2x), Despesas, FluxoCaixa, Quartos, Faturas, Usuarios, Fornecedores |
| `inputCls` / `selectCls` | Despesas, FluxoCaixa, Quartos, Login |
| Status action buttons | Vendas (mobile + desktop) |
| Filter + reduce pattern | DRE (10x), Dashboard, FluxoCaixa |
| Form reset logic | Faturas (2x), Usuarios (2x) |
| `EMPTY` form object | Despesas, FluxoCaixa |
| Mask functions (CPF/CNPJ) | Vendas, Fornecedores |

---

> **Todas as tarefas de execucao estao consolidadas no PLANO MESTRE (secao final deste documento).**
> Os roadmaps parciais das secoes acima foram integrados nos Sprints 0-7 do Plano Mestre.

---

# ANALISE DE PERFORMANCE (30 issues encontradas)

## Score de Performance: 3.0/10

```
CRITICOS:  6 issues
ALTOS:    10 issues
MEDIOS:    9 issues
BAIXOS:    5 issues
```

---

## P1. CONTEXT VALUES SEM MEMOIZACAO (re-render de toda a app)

### 🔴 P1.1 — HotelFirestoreContext: value recriado a cada render

**Arquivo:** `src/context/HotelFirestoreContext.jsx:234-282`

```js
const value = {
    quartos, reservas, despesas, fluxoCaixa, faturas,
    usuarios, fornecedores, bancos, loading, error,
    empresaId, usuario: currentUser, logout,
    adicionarQuarto, atualizarQuarto, removerQuarto, ...
    // 28 funcoes + 10 estados = 38 propriedades
};
```

- **Impacto:** Objeto recriado em CADA render. 8 listeners onSnapshot disparam setState independentes. Cada setState recria o value object, causando re-render em TODOS os 12 consumers (pages + Layout).
- **Quantificado:** 8 listeners x 12 consumers = **96 re-renders cascata no mount**. Cada update Firestore de qualquer colecao re-renderiza a app inteira.
- **Correcao:**
```js
const value = useMemo(() => ({
    quartos, reservas, despesas, fluxoCaixa, faturas,
    usuarios, fornecedores, bancos, loading, error, empresaId,
    // ... todas as funcoes (ja sao useCallback)
}), [quartos, reservas, despesas, fluxoCaixa, faturas,
     usuarios, fornecedores, bancos, loading, error, empresaId, ...]);
```
- **Melhor ainda:** Separar em 2 contexts: `HotelDataContext` (dados, re-renderiza em updates) e `HotelActionsContext` (funcoes, estavel, nunca re-renderiza).

### 🔴 P1.2 — AuthContext: value recriado + funcoes sem useCallback

**Arquivo:** `src/context/AuthContext.jsx:364-379`

```js
const value = {
    currentUser, empresaAtual, empresasUsuario, trialStatus,
    loading, error, login, criarConta, logout, recuperarSenha,
    selecionarEmpresa, ativarEmpresa, listarTodasEmpresas, isAdmin
};
```

- **Impacto:** `login`, `criarConta`, `logout` etc. NAO sao useCallback — recriadas a cada render. AuthContext envolve a app INTEIRA. Qualquer `setError`, `setLoading`, `setCurrentUser` causa re-render da arvore completa.
- **Correcao:** Envolver TODAS as funcoes em useCallback + envolver value em useMemo.

---

## P2. CARREGAMENTO DE DADOS (13.750+ docs no mount)

### 🔴 P2.1 — 8 colecoes Firestore carregadas simultaneamente sem limit()

**Arquivo:** `src/context/HotelFirestoreContext.jsx:63-87`

```js
const unsubs = [
    onQuartos(empresaId, data => { setQuartos(data); setLoading(false); }),
    onReservas(empresaId, setReservas),          // TODAS as reservas
    onDespesas(empresaId, setDespesas),            // TODAS as despesas
    onFluxoCaixa(empresaId, setFluxoCaixa),        // TODO o fluxo de caixa
    onFaturas(empresaId, setFaturas),
    onUsuarios(empresaId, setUsuarios),
    onFornecedores(empresaId, setFornecedores),
    onBancos(empresaId, setBancos),
];
```

- **Quantificado (hotel com 1 ano):** ~3.650 reservas + ~3.000 despesas + ~7.000 fluxoCaixa + ~50 faturas + ~15 quartos + ~5 usuarios + ~20 fornecedores + ~10 bancos = **~13.750 documentos lidos no cold start**
- **Custo:** $0.06 / 100K reads. Com 50 logins/dia = ~687.500 reads/dia = **$0.41/dia = $12.30/mes so em reads de mount**
- **Latencia:** 2-5s em 3G, 8 state updates cascata (vide P1.1)
- **Correcao:**
  1. Adicionar `limit()` em todos listeners (exceto quartos/usuarios/bancos que sao pequenos)
  2. Lazy-load: so ativar listener quando page especifica montar
  3. Paginacao com `startAfter()` para historico

### 🟠 P2.2 — onSnapshot listeners sem limit() no firestoreService

**Arquivo:** `src/services/firestoreService.js` — linhas 29, 74, 188, 242, 281, 330, 428, 455

NENHUM dos 8 listeners tem `limit()`. Exemplo:

```js
export function onReservas(empresaId, callback) {
    return onSnapshot(
        query(collection(db, 'empresas', empresaId, 'reservas'), orderBy('criadoEm', 'desc')),
        // SEM limit() — busca TODAS as reservas de todos os tempos
```

- **Correcao:** Adicionar `limit(200)` ou `limit(500)` dependendo da colecao.

### 🟠 P2.3 �� seedDadosIniciais e seedBancosIniciais executam em CADA troca de empresa

**Arquivo:** `src/context/HotelFirestoreContext.jsx:72-73`

```js
seedDadosIniciais(empresaId).catch(console.error);
seedBancosIniciais(empresaId).catch(console.error);
```

- **Impacto:** 2 reads Firestore extras por login/troca. Deveria ser one-time.
- **Correcao:** Guard com `localStorage.getItem('seeded_' + empresaId)`

---

## P3. COMPLEXIDADE COMPUTACIONAL

### 🔴 P3.1 — O(Quartos x Dias x Reservas) em Disponibilidade = 161.200 iteracoes/render

**Arquivo:** `src/pages/Disponibilidade.jsx:41-87, 177-203`

```js
{diasDoMes.map(dia => {
    const status = getStatusDia(quarto, dia);    // reservas.filter() por celula
    const reserva = getReservaDia(quarto, dia);  // reservas.find() por celula
```

- **Quantificado:** 13 quartos x 31 dias = 403 celulas. Cada celula chama 2 funcoes que iteram TODAS as reservas. 403 x 2 x 200 = **161.200 iteracoes por render**.
- **Agravante:** `getStatusDia` e `getReservaDia` duplicam 90% da logica de filtro.
- **Correcao:** Pre-computar Map `quartoId:dateStr → reserva` em useMemo unico:

```js
const reservaMap = useMemo(() => {
    const map = new Map();
    reservas.forEach(r => {
        if (r.status === 'cancelada') return;
        const ci = toDate(r.dataCheckIn), co = toDate(r.dataCheckOut);
        if (!ci || !co) return;
        for (let d = new Date(ci); d < co; d.setDate(d.getDate() + 1)) {
            map.set(`${r.quartoId}:${d.toISOString().split('T')[0]}`, r);
        }
    });
    return map;
}, [reservas]);
// Lookup O(1): reservaMap.get(`${quarto.id}:${dateStr}`)
```

### 🔴 P3.2 — O(n^2) em DRE: 120.000 iteracoes para dados mensais

**Arquivo:** `src/pages/DRE.jsx:174-185`

```js
const dadosMensais = Array.from({ length: 12 }, (_, m) => {
    const recM = fluxoCaixa.filter(f => { /* full scan por mes */ }).reduce(...);
    const despM = despesas.filter(d => { /* full scan por mes */ }).reduce(...);
```

- **Quantificado:** 12 meses x (7.000 fluxoCaixa + 3.000 despesas) = **120.000 iteracoes**, cada uma chamando `toDate()` (cria Date objects)
- **Correcao:** Single-pass com arrays indexados por mes:

```js
const receitaPorMes = new Array(12).fill(0);
const despesaPorMes = new Array(12).fill(0);
fluxoCaixa.forEach(f => {
    const d = toDate(f.data);
    if (d && f.tipo === 'entrada' && getYear(d) === anoSel)
        receitaPorMes[getMonth(d)] += f.valor || 0;
});
despesas.forEach(d => {
    const dt = toDate(d.data);
    if (dt && getYear(dt) === anoSel && d.status !== 'cancelado')
        despesaPorMes[getMonth(dt)] += d.valor || 0;
});
```

### 🟠 P3.3 — O(n^2) em Dashboard: 10 filter passes sobre mesmos arrays

**Arquivo:** `src/pages/Dashboard.jsx:63-157`

10 chamadas `.filter()` separadas sobre `quartos`, `reservas` e `despesas` no mesmo useMemo. Cada pass percorre o array inteiro.

- **Quantificado:** ~200 reservas x 4 passes + ~300 despesas x 3 passes + quartos = **~1.700 iteracoes** que poderiam ser 1 pass.
- **Correcao:** Single-pass acumulando todos os contadores simultaneamente.

### 🟠 P3.4 — O(n^2) em Dashboard: ultimos7dias x reservas

**Arquivo:** `src/pages/Dashboard.jsx:99-109`

```js
const ultimos7 = Array.from({ length: 7 }, (_, i) => {
    const rec = reservas.filter(r => { /* full scan por dia */ }).reduce(...);
```

- **Quantificado:** 7 x 200 = 1.400 iteracoes + 7 x `toISOString()` por reserva
- **Correcao:** Pre-computar Map `dateStr → receita` em single pass

### 🟠 P3.5 — O(dias x transacoes) em FluxoCaixa chart

**Arquivo:** `src/pages/FluxoCaixa.jsx:60-68`

```js
const dadosGrafico = dias.map(dia => {
    const e = doMes.filter(f => f.tipo === 'entrada' && ...).reduce(...);
    const s = doMes.filter(f => f.tipo === 'saida' && ...).reduce(...);
```

- **Quantificado:** 31 dias x 2 passes x 500 transacoes/mes = **31.000 iteracoes**
- **Correcao:** Map indexado por data em single pass

### 🟠 P3.6 — getDisponibilidade no Context: O(quartos x reservas)

**Arquivo:** `src/context/HotelFirestoreContext.jsx:218-232`

```js
quartos.forEach(q => {
    const reservaAtiva = reservas.find(r => { ... }); // O(reservas) por quarto
```

- **Quantificado:** 13 x 200 = 2.600 iteracoes por chamada

---

## P4. INTL/FORMATTER RECRIADO A CADA RENDER

### 🟠 P4.1 — `new Intl.NumberFormat()` criado em cada chamada de fmt()

**Arquivos:** Dashboard:13, Vendas:9, Despesas:7, FluxoCaixa:9, DRE:15, Layout:22

```js
const fmt = (v) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v||0);
```

- **Quantificado:** ~300-500 chamadas por render cycle (1 por linha de tabela/card). Constructor ~0.1-0.5ms cada = **30-250ms desperdicados**
- **Correcao:** Criar formatter uma vez no module level:

```js
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const fmt = (v) => currencyFormatter.format(v || 0);
```

### 🟡 P4.2 — Intl.NumberFormat inline no JSX em Quartos

**Arquivo:** `src/pages/Quartos.jsx:179`

```js
{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(q.precoDiaria || 0)}
```

Criado 13x por render (1 por quarto card).

---

## P5. BUNDLE E CODE SPLITTING

### 🔴 P5.1 — ZERO code splitting — 11 pages importadas estaticamente

**Arquivo:** `src/App.jsx:1-16`

```js
import Dashboard from './pages/Dashboard';
import Disponibilidade from './pages/Disponibilidade';
import Quartos from './pages/Quartos';
import Vendas from './pages/Vendas';
// ... etc
```

- **Impacto:** Bundle inclui TODAS as 11 pages + Recharts (~250KB, so usado em 3 pages). Usuario que acessa so Quartos paga custo de DRE, FluxoCaixa, etc.
- **Quantificado:** ~6.400 linhas de JSX + Recharts = estimado **1-2MB desnecessarios no first load**
- **Correcao:**

```js
import { lazy, Suspense } from 'react';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vendas = lazy(() => import('./pages/Vendas'));
// ... etc
```

### 🟠 P5.2 — 17+ dependencias Radix/npm nao utilizadas

**Arquivo:** `package.json`

accordion, aspect-ratio, context-menu, hover-card, menubar, navigation-menu, progress, radio-group, scroll-area, slider, toggle, toggle-group, cmdk, embla-carousel, input-otp, react-resizable-panels, vaul, next-themes, framer-motion

- **Quantificado:** Estimado **500KB-1MB** de JS nao utilizado no bundle
- **Correcao:** `npx depcheck` e remover

### 🟡 P5.3 — Firebase Analytics carregado incondicionalmente

**Arquivo:** `src/config/firebase.js:27`

```js
export const analytics = getAnalytics(app);
```

- **Correcao:** Lazy import apos render inicial

---

## P6. OPERACOES SEM MEMOIZACAO

### 🟠 P6.1 — quartosFiltrados em Quartos sem useMemo

**Arquivo:** `src/pages/Quartos.jsx:81-85`

```js
const quartosFiltrados = quartos.filter(q => { ... });
```

Recalcula em CADA render (inclusive quando outros estados mudam, tipo `form`).

### 🟠 P6.2 — filteredFaturas em Faturas sem useMemo

**Arquivo:** `src/pages/Faturas.jsx:189-199`

### 🟠 P6.3 — filteredUsuarios em Usuarios sem useMemo

**Arquivo:** `src/pages/Usuarios.jsx:266-273`

### 🟠 P6.4 — filteredReservas em Vendas sem useMemo

**Arquivo:** `src/pages/Vendas.jsx` — busca + filtroStatus

### 🟡 P6.5 — countStatus em Quartos chamado 5x inline

**Arquivo:** `src/pages/Quartos.jsx:87, 108-126`

```js
const countStatus = (s) => quartos.filter(q => q.status === s).length;
// Chamado 5x no JSX
```

5 x 13 quartos = 65 iteracoes desnecessarias. Pre-computar com reduce.

### 🟡 P6.6 — estatisticas em Faturas/Usuarios sem useMemo

**Arquivo:** `src/pages/Faturas.jsx:273-278`, `src/pages/Usuarios.jsx:349-354`

Stats (totalContratos, contratosAtivos, etc.) recalculados em cada render.

### 🟡 P6.7 — estado derivado como useState+useEffect em Faturas

**Arquivo:** `src/pages/Faturas.jsx:98-104`

```js
useEffect(() => {
  setFormData(prev => ({ ...prev, valorTotal: calcularValorTotal(), proximaFatura: calcularProximaFatura() }));
}, [formData.valorMensal, formData.tipoContrato, ...]);
```

`valorTotal` e `proximaFatura` sao valores DERIVADOS ��� devem ser `useMemo`, nao state.

---

## P7. MEMORY E DEAD CODE

### 🟡 P7.1 — 14 console.log em AuthContext retendo referencias

**Arquivo:** `src/context/AuthContext.jsx` — 14 chamadas

Em producao, `console.log` com objetos grandes (arrays Firestore, Timestamps) impede garbage collection. Pode acumular **10-50MB** em sessao longa.

### 🟡 P7.2 — 7 arquivos dead code (~1.200+ linhas)

- `context/HotelContext.jsx` (221 linhas)
- `context/HybridHotelContext.jsx` (324 linhas)
- `context/MockAuthContext.jsx`
- `services/firestoreServiceOld.js` (374 linhas)
- `data/mockData.js`
- `components/Sidebar.jsx` (136 linhas)
- `components/TopBar.jsx` (132 linhas)

### 🟡 P7.3 — `await setTimeout(1000)` + `window.location.reload()` em account creation

**Arquivo:** `src/context/AuthContext.jsx:147`

Delay artificial de 1s + full page reload. Anti-pattern de performance.

---

> **Tarefas de execucao:** ver Sprint 5 (Performance) no PLANO MESTRE.

---

# DESIGN SYSTEM — EXTRACAO COMPLETA DE COMPONENTES

## Diagnostico: 5 Variantes de Modal, 4 Variantes de Input, Zero Reutilizacao

O projeto tem **ZERO componentes compartilhados** alem do shadcn/ui (que nao e usado pelas pages). Cada page reinventa Modal, FormField, StatusBadge, StatCard, SearchInput, LoadingSpinner, EmptyState, etc. do zero, com estilos ligeiramente diferentes.

### Mapa de Duplicacoes

| Componente | Copias | Arquivos | Linhas desperdicadas |
|------------|--------|----------|---------------------|
| Modal | 5 variantes | Quartos, Despesas, FluxoCaixa, Fornecedores, Vendas, Faturas, Usuarios, Dashboard | ~200 linhas |
| inputCls/selectCls | 4 identicas + 4 variantes | Quartos, Despesas, Vendas, FluxoCaixa, Fornecedores, Usuarios, Faturas, Configuracoes | ~50 linhas |
| StatCard | 7 implementacoes | Dashboard, DRE, FluxoCaixa, Despesas, Usuarios, Faturas, AdminPanel (~25 instancias) | ~300 linhas |
| fmt() formatter | 5 copias identicas | Dashboard, Despesas, Vendas, FluxoCaixa, DRE, Layout, Quartos | ~35 linhas |
| LoadingSpinner | 7 variantes | Quartos, Despesas, Vendas, Disponibilidade, DRE, Dashboard, AdminPanel | ~50 linhas |
| EmptyState | 10+ instancias | Quase todas as pages | ~100 linhas |
| SearchInput | 6 implementacoes | Quartos, Vendas, Despesas, Fornecedores, Usuarios, Faturas | ~60 linhas |
| FilterPills (status) | 4 implementacoes | Quartos, Vendas, Despesas, AdminPanel | ~80 linhas |
| PageHeader | 12 implementacoes | Todas as pages | ~120 linhas |
| maskCPF/CNPJ/Phone | 2 copias | Fornecedores, Vendas | ~30 linhas |
| **TOTAL** | | | **~1.000+ linhas duplicadas** |

### Inconsistencia de Design Tokens

| Token | Pages slate-* (6) | Pages gray-* (4) | Inconsistente |
|-------|-------------------|-------------------|---------------|
| Cores | `slate-50/100/200/500/900` | `gray-50/100/200/600/800` | SIM |
| Border radius | `rounded-xl`, `rounded-2xl` | `rounded-lg` | SIM |
| Padding | `p-5`, `px-3.5 py-2.5` | `p-6`, `px-3 py-2` | SIM |
| Font sizes | `text-xs`, `text-sm` | `text-sm`, `text-base` | SIM |
| Shadow | `shadow-sm` | `shadow` | SIM |

---

## Estrutura Proposta: `src/components/ds/`

```
src/components/ds/
├── Modal.jsx              — Modal unificado (5 variantes → 1)
├── FormField.jsx          — Label + children wrapper
├── SearchInput.jsx        — Input com icone de busca
├── StatCard.jsx           — Card de KPI/metrica
├── LoadingSpinner.jsx     — Spinner animado
├── EmptyState.jsx         — Estado vazio com icone/mensagem
├── ConfirmDialog.jsx      — Dialogo de confirmacao (substitui alert/confirm)
├── StatusBadge.jsx        — Badge colorido de status
├── FilterPills.jsx        — Grupo de botoes toggle de filtro
├── PageHeader.jsx         — Cabecalho de pagina (titulo + subtitulo + acoes)
├── DataTable.jsx          — Tabela responsiva com header padrao
├── ModalFooter.jsx        — Botoes de acao do modal (cancelar/confirmar)
├── Card.jsx               — Card wrapper base
├── ActionButton.jsx       — Botao de acao (edit/delete/view)
├── SectionTitle.jsx       — Titulo de secao dentro de forms
└── index.js               — Re-export barrel

src/styles/
└── formClasses.js         — inputCls, selectCls, textareaCls

src/utils/
├── formatters.js          — fmt() / formatCurrency()
└── masks.js               — maskCPF, maskCNPJ, maskPhone, maskCEP
```

---

## Especificacao de Cada Componente

### DS-1. `<Modal>` — Prioridade 1

**Substitui:** 5 variantes em 12+ paginas

```jsx
// src/components/ds/Modal.jsx
//
// Props:
//   open: boolean           — controla visibilidade
//   onClose: () => void     — callback de fechamento
//   title: string           — titulo do modal
//   children: ReactNode     — conteudo
//   maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl'  (default: 'lg')
//
// Features:
//   - Backdrop com bg-black/50
//   - z-50
//   - rounded-2xl, slate colors
//   - Botao X sempre presente
//   - Escape key fecha
//   - Focus trap (react-focus-lock ou manual)
//   - Portal em document.body
//   - Scroll no body, header fixo
//   - Animacao fade-in/scale (opcional)
//
// Exemplo de uso:
//   <Modal open={showModal} onClose={() => setShowModal(false)} title="Nova Reserva" maxWidth="xl">
//     <form>...</form>
//   </Modal>
```

**Arquivos a atualizar:** Quartos, Despesas, FluxoCaixa, Fornecedores, Vendas, Faturas, Usuarios, Dashboard, Configuracoes, AdminPanel

---

### DS-2. `<FormField>` — Prioridade 1

**Substitui:** ~50+ labels inline em 10 paginas

```jsx
// Props:
//   label: string
//   required?: boolean      — mostra * vermelho
//   htmlFor?: string        — associa label ao input
//   children: ReactNode
//
// Renderiza:
//   <div>
//     <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
//       {label} {required && <span className="text-red-500">*</span>}
//     </label>
//     {children}
//   </div>
```

---

### DS-3. `formClasses.js` — Prioridade 1

**Substitui:** 8 definicoes de inputCls/selectCls

```js
// src/styles/formClasses.js
export const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
export const selectCls = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
export const textareaCls = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none";
```

**Arquivos a atualizar:** Quartos, Despesas, Vendas, FluxoCaixa, Fornecedores, Usuarios, Faturas, Configuracoes

---

### DS-4. `<SearchInput>` — Prioridade 1

**Substitui:** 6 implementacoes

```jsx
// Props:
//   value: string
//   onChange: (value: string) => void
//   placeholder?: string (default: "Buscar...")
//
// Renderiza: Input com icone Search a esquerda
```

**Arquivos a atualizar:** Quartos, Vendas, Despesas, Fornecedores, Usuarios, Faturas

---

### DS-5. `<StatCard>` — Prioridade 1

**Substitui:** ~25 instancias em 7 paginas

```jsx
// Props:
//   title: string           — label superior (uppercase)
//   value: string | number  — valor principal (grande)
//   sub?: string            — texto secundario abaixo
//   icon?: LucideIcon       — icone do lado direito
//   iconBg?: string         — classe bg do icone (ex: 'bg-blue-500')
//   color?: string          — variante de cor do valor (default: 'slate-900')
//   trend?: 'up' | 'down'   — indicador de tendencia
```

**Arquivos a atualizar:** Dashboard, DRE, FluxoCaixa, Despesas, Usuarios, Faturas, AdminPanel

---

### DS-6. `<LoadingSpinner>` — Prioridade 1

**Substitui:** 7 variantes

```jsx
// Props:
//   size?: 'sm' | 'md' | 'lg' (default: 'md')
//   message?: string         — texto abaixo do spinner
//
// Tamanhos: sm=w-6 h-6, md=w-8 h-8, lg=w-16 h-16
```

**Arquivos a atualizar:** Quartos, Despesas, Vendas, Disponibilidade, DRE, Dashboard, AdminPanel

---

### DS-7. `<EmptyState>` — Prioridade 1

**Substitui:** 10+ instancias

```jsx
// Props:
//   icon: LucideIcon
//   message: string
//   subMessage?: string
//   action?: { label: string, onClick: () => void }
```

---

### DS-8. `formatCurrency()` + `toDate()` em utils — Prioridade 1

**Substitui:** 5 copias de fmt() + 3 copias de toDate()

```js
// src/utils/formatters.js
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatCurrency = (v) => currencyFormatter.format(v || 0);
```

---

### DS-9. `masks.js` — Prioridade 1

**Substitui:** 2 copias identicas de maskCPF/maskCNPJ/maskPhone

```js
// src/utils/masks.js
export function maskCPF(v) { ... }
export function maskCNPJ(v) { ... }
export function maskPhone(v) { ... }
export function maskCEP(v) { ... }
```

---

### DS-10. `<ConfirmDialog>` — Prioridade 2

**Substitui:** window.confirm() + modais de confirmacao manuais

```jsx
// Props:
//   open: boolean
//   onClose: () => void
//   onConfirm: () => void
//   title: string
//   message: string
//   confirmLabel?: string (default: "Confirmar")
//   variant?: 'danger' | 'warning' (default: 'danger')
//   loading?: boolean
```

**Arquivos a atualizar:** Quartos, Despesas, Fornecedores, Usuarios, Faturas

---

### DS-11. `<StatusBadge>` — Prioridade 2

**Substitui:** STATUS_CFG + rendering inline em 8+ paginas

```jsx
// Props:
//   status: string
//   config: Record<string, { label: string, cls: string }>
//   showDot?: boolean
```

---

### DS-12. `<FilterPills>` — Prioridade 2

**Substitui:** 4 implementacoes

```jsx
// Props:
//   options: { key: string, label: string, count?: number }[]
//   value: string
//   onChange: (key: string) => void
```

---

### DS-13. `<PageHeader>` — Prioridade 2

**Substitui:** 12 headers de pagina

```jsx
// Props:
//   title: string
//   subtitle?: string
//   actions?: ReactNode     — botoes a direita
```

---

### DS-14. `<DataTable>` — Prioridade 2

```jsx
// Props:
//   columns: { key: string, label: string, className?: string, render?: (row) => ReactNode }[]
//   data: any[]
//   loading?: boolean
//   emptyIcon?: LucideIcon
//   emptyMessage?: string
//   onRowClick?: (row) => void
```

---

### DS-15. `<ModalFooter>` — Prioridade 2

```jsx
// Props:
//   onCancel: () => void
//   onConfirm: () => void
//   confirmLabel?: string (default: "Salvar")
//   cancelLabel?: string (default: "Cancelar")
//   loading?: boolean
//   variant?: 'primary' | 'danger'
```

---

### DS-16 a DS-20. Prioridade 3

- `<Card>` — wrapper base (`bg-white rounded-2xl shadow-sm border border-slate-100`)
- `<ActionButton>` — botao de acao em tabelas (edit/delete)
- `<SectionTitle>` — titulo de secao em forms
- Normalizacao de tokens (tudo slate-*, tudo rounded-xl)

---

> **Tarefas de execucao:** ver Sprint 2 (Design System) no PLANO MESTRE.

---

# LIMPEZA: ARQUIVOS PARA DELETAR

## Diagnostico: 65+ arquivos mortos, ~4.500 linhas de lixo

O projeto acumulou documentacao tecnica antiga, arquivos de especificacao Firebase, componentes shadcn/ui nunca importados, contextos mock abandonados, e arquivos soltos na raiz que nao pertencem ao projeto.

---

## RAIZ: 17 arquivos para deletar

### Documentacao tecnica antiga (Firebase-specific — substituida por correcoes.md e PLANO_MIGRACAO)

| Arquivo | Linhas | Motivo |
|---------|--------|--------|
| `CORRECOES_FINALIZADAS.md` | 110 | Historico de correcoes anteriores — superada pelo novo correcoes.md |
| `DOCUMENTACAO_FIREBASE_COMPLETA.md` | 85 | Documentacao Firebase — sera substituida pela API REST |
| `ESTRUTURA_DATABASE.md` | 185 | Schema Firestore antigo — substituido pelo PLANO_MIGRACAO_POSTGRES.md |
| `FIREBASE_DATABASE_STRUCTURE.json` | 324 | Export de schema Firestore V1 — obsoleto |
| `FIREBASE_SETUP_GUIDE.md` | 253 | Guia de configuracao Firebase — nao necessario pos-migracao |
| `FIRESTORE_DATABASE_STRUCTURE.json` | 685 | Export de schema Firestore — obsoleto |
| `FIRESTORE_DATABASE_STRUCTURE_V2.json` | 264 | Export de schema Firestore V2 — obsoleto |
| `FIRESTORE_RULES.rules` | 103 | Versao antiga das rules (existe firestore.rules ativo) |
| `FIRESTORE_SECURITY_RULES.rules` | 159 | Outra copia das rules — duplicada |
| `FIRESTORE_SECURITY_RULES_V2.rules` | 156 | Outra copia das rules V2 — duplicada |
| `GUIA_CONFIGURACAO_FIREBASE.md` | 86 | Guia Firebase — nao necessario pos-migracao |
| `MELHORIAS_FINALIZADAS.md` | 104 | Historico de melhorias passadas — valor zero para o futuro |
| `MELHORIAS_LAYOUT_IMPLEMENTADAS.md` | 99 | Historico de melhorias de layout — ja aplicadas |
| `REGRAS_DE_SEGURANCA.md` | 94 | Documentacao das Firestore Rules — sera refeita para backend |
| `SISTEMA_COMPLETO_FINAL.md` | 215 | Especificacao do "sistema completo" — desatualizada |
| `SISTEMA_FIREBASE_COMPLETO.md` | 201 | Documentacao Firebase completa — substituida |
| `TESTES_MELHORIAS.md` | 145 | Plano de testes manual antigo — sera substituido por testes automatizados |

**Subtotal raiz:** 17 arquivos, **~3.268 linhas**

### Outros arquivos da raiz para deletar

| Arquivo | Motivo |
|---------|--------|
| `Layout.jsx` | Componente solto na raiz (copia antiga de src/components/Layout.jsx), 52 linhas |
| `Sidebar.jsx` | Componente solto na raiz (copia antiga de src/components/Sidebar.jsx), 129 linhas |
| `.manus-template-version` | Arquivo de template vazio, 0 linhas |
| `firebaserc` | Duplicata de `.firebaserc` (sem ponto), 4 linhas |
| `memory.md` | Memory file antigo, 9 linhas — usar o sistema de memoria do CLAUDE |

**Subtotal outros raiz:** 5 arquivos, **~194 linhas**

---

## SRC: Arquivos mortos para deletar

### Contextos e services mortos

| Arquivo | Linhas | Motivo |
|---------|--------|--------|
| `src/context/HotelContext.jsx` | 221 | Context mock original — substituido por HotelFirestoreContext |
| `src/context/HybridHotelContext.jsx` | 324 | Context hibrido mock/firestore — nunca importado |
| `src/context/MockAuthContext.jsx` | ~50 | Mock auth — nunca importado |
| `src/services/firestoreServiceOld.js` | 374 | Versao antiga do service (pattern de classe) — dead code |
| `src/data/mockData.js` | 200 | Dados mock — so importado por contexts mortos |
| `src/types/index.js` | 56 | JSDoc types — nunca importado, projeto e JS nao TS |

### Componentes mortos

| Arquivo | Linhas | Motivo |
|---------|--------|--------|
| `src/components/Sidebar.jsx` | 136 | Nunca importado — Layout.jsx tem sidebar inline |
| `src/components/TopBar.jsx` | 132 | Nunca importado — Layout.jsx tem header inline |
| `src/components/ProtectedRoute.jsx` | 35 | Nunca importado — App.jsx faz auth inline |
| `src/components/EmpresaSelector.jsx` | 147 | So importado por ProtectedRoute (dead) |

### CSS morto

| Arquivo | Linhas | Motivo |
|---------|--------|--------|
| `src/App.css` | 120 | CSS customizado — projeto usa Tailwind. Verificar se `index.css` ja importa Tailwind |
| `src/components/Layout.css` | 179 | CSS customizado para Layout — nao importado pelo Layout.jsx atual |

### shadcn/ui nao utilizados (37 componentes!)

**NENHUMA page do projeto importa estes componentes.** Apenas 9 componentes sao usados internamente:

**USADOS (manter):** `button`, `dialog`, `input`, `label`, `separator`, `sheet`, `skeleton`, `toggle`, `tooltip`

**NAO USADOS (deletar):**

| Arquivo | Motivo |
|---------|--------|
| `src/components/ui/accordion.jsx` | 0 imports |
| `src/components/ui/alert-dialog.jsx` | 0 imports |
| `src/components/ui/alert.jsx` | 0 imports |
| `src/components/ui/aspect-ratio.jsx` | 0 imports |
| `src/components/ui/avatar.jsx` | 0 imports |
| `src/components/ui/badge.jsx` | 0 imports |
| `src/components/ui/breadcrumb.jsx` | 0 imports |
| `src/components/ui/calendar.jsx` | 0 imports |
| `src/components/ui/card.jsx` | 0 imports |
| `src/components/ui/carousel.jsx` | 0 imports |
| `src/components/ui/chart.jsx` | 0 imports |
| `src/components/ui/checkbox.jsx` | 0 imports |
| `src/components/ui/collapsible.jsx` | 0 imports |
| `src/components/ui/command.jsx` | 0 imports |
| `src/components/ui/context-menu.jsx` | 0 imports |
| `src/components/ui/drawer.jsx` | 0 imports |
| `src/components/ui/dropdown-menu.jsx` | 0 imports |
| `src/components/ui/form.jsx` | 0 imports |
| `src/components/ui/hover-card.jsx` | 0 imports |
| `src/components/ui/input-otp.jsx` | 0 imports |
| `src/components/ui/menubar.jsx` | 0 imports |
| `src/components/ui/navigation-menu.jsx` | 0 imports |
| `src/components/ui/pagination.jsx` | 0 imports |
| `src/components/ui/popover.jsx` | 0 imports |
| `src/components/ui/progress.jsx` | 0 imports |
| `src/components/ui/radio-group.jsx` | 0 imports |
| `src/components/ui/resizable.jsx` | 0 imports |
| `src/components/ui/scroll-area.jsx` | 0 imports |
| `src/components/ui/select.jsx` | 0 imports |
| `src/components/ui/sidebar.jsx` | 0 imports |
| `src/components/ui/slider.jsx` | 0 imports |
| `src/components/ui/sonner.jsx` | 0 imports |
| `src/components/ui/switch.jsx` | 0 imports |
| `src/components/ui/table.jsx` | 0 imports |
| `src/components/ui/tabs.jsx` | 0 imports |
| `src/components/ui/textarea.jsx` | 0 imports |
| `src/components/ui/toggle-group.jsx` | 0 imports |

**Subtotal shadcn/ui nao usados:** 37 arquivos

**Subtotal src dead code:** 10 arquivos + 2 CSS + 37 shadcn = **49 arquivos, ~2.000+ linhas**

---

## RESUMO DE LIMPEZA

```
Raiz — docs Firebase antigos:     17 arquivos  (~3.268 linhas)
Raiz — arquivos soltos:            5 arquivos  (~194 linhas)
Src — contextos/services mortos:   6 arquivos  (~1.225 linhas)
Src — componentes mortos:          4 arquivos  (~450 linhas)
Src — CSS morto:                   2 arquivos  (~299 linhas)
Src — shadcn/ui nao usados:       37 arquivos
────────────────────────────────────────────────
TOTAL:                            71 arquivos  (~5.400+ linhas de lixo)
```

### Arquivos para MANTER na raiz

| Arquivo | Motivo |
|---------|--------|
| `CLAUDE.md` | Instrucoes do projeto — MANTER e atualizar |
| `README.md` | Documentacao publica — MANTER e atualizar |
| `GUIA_USUARIO.md` | Guia do usuario final — MANTER |
| `TESTES_SISTEMA.md` | Casos de teste manuais — MANTER ate ter testes automatizados |
| `correcoes.md` | Este documento — MANTER |
| `PLANO_MIGRACAO_POSTGRES.md` | Plano de migracao — MANTER |
| `package.json`, `pnpm-lock.yaml` | Dependencias — MANTER |
| `vite.config.js`, `eslint.config.js`, `postcss.config.js`, `tailwind.config.js` | Build config — MANTER |
| `jsconfig.json`, `components.json` | Path aliases e shadcn config — MANTER |
| `index.html` | Entry point Vite — MANTER |
| `.firebaserc`, `firebase.json`, `firestore.rules`, `firestore.indexes.json` | Firebase deploy (manter ate migracao concluida) — MANTER TEMPORARIO |
| `.gitignore` | Git config — MANTER |
| `package-lock.json` | Manter junto do pnpm-lock — pode deletar se usar so pnpm |

---

# REORGANIZACAO: ESTRUTURA POR FEATURE (MONOREPO)

## Diagnostico: Projeto Flat Sem Separacao Frontend/Backend

Atualmente o projeto e um SPA puro (sem backend). Com a migracao para Postgres, nasce um backend NestJS. A estrutura deve ser reorganizada como **monorepo com 2 workspaces**: `frontend/` e `backend/`.

---

## Estrutura Atual (flat)

```
hotelfacil/
├── src/                           ← Tudo misturado
│   ├── components/
│   │   ├── ui/                    ← 50+ shadcn (37 nao usados)
│   │   ├── Layout.jsx             ← God component (sidebar+header+alertas)
│   │   ├── Sidebar.jsx            ← Dead code
│   │   ├── TopBar.jsx             ← Dead code
│   │   ├── ProtectedRoute.jsx     ← Dead code
│   │   ├── EmpresaSelector.jsx    ← Dead code
│   │   ├── TrialBanner.jsx
│   │   └── TrialExpired.jsx
│   ├── pages/                     ← 12 God pages (5 acima de 300 linhas)
│   ├── context/                   ← 5 contexts (3 dead)
│   ├── services/                  ← 2 services (1 dead)
│   ├── config/                    ← Firebase config (hardcoded keys)
│   ├── utils/                     ← 1 util (dateUtils)
│   ├── hooks/                     ← 1 hook (use-mobile)
│   ├── lib/                       ← 1 util (cn)
│   ├── data/                      ← Mock data (dead)
│   └── types/                     ← JSDoc types (dead, nunca importado)
├── 17 docs Firebase antigos na raiz
├── 2 componentes soltos na raiz
└── build configs
```

---

## Estrutura Proposta: Monorepo por Feature

```
hotelfacil/
├── frontend/                              ← React SPA
│   ├── public/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   │
│   │   ├── components/
│   │   │   ├── ds/                        ← DESIGN SYSTEM (novos, compartilhados)
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── FormField.jsx
│   │   │   │   ├── SearchInput.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── ConfirmDialog.jsx
│   │   │   │   ├── StatusBadge.jsx
│   │   │   │   ├── FilterPills.jsx
│   │   │   │   ├── PageHeader.jsx
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── ModalFooter.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   └── index.js              ← barrel export
│   │   │   ├── ui/                        ← shadcn/ui (so os 9 usados)
│   │   │   │   ├── button.jsx
│   │   │   │   ├── dialog.jsx
│   │   │   │   ├── input.jsx
│   │   │   │   ├── label.jsx
│   │   │   │   ├── separator.jsx
│   │   │   │   ├── sheet.jsx
│   │   │   │   ├── skeleton.jsx
│   │   │   │   ├── toggle.jsx
│   │   │   │   └── tooltip.jsx
│   │   │   ├── layout/                    ← Layout quebrado em partes
│   │   │   │   ├── Layout.jsx             ← Shell (sidebar + header + content)
│   │   │   │   ├── Sidebar.jsx            ← Extraido de Layout
│   │   │   │   ├── Header.jsx             ← Extraido de Layout
│   │   │   │   └── NotificationBell.jsx   ← Extraido de Layout
│   │   │   ├── auth/                      ← Componentes de auth
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── TrialBanner.jsx
│   │   │   │   └── TrialExpired.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── features/                      ← ORGANIZADO POR FEATURE
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx          ← Page principal
│   │   │   │   ├── components/
│   │   │   │   │   ├── RevenueChart.jsx
│   │   │   │   │   ├── RoomStatusCard.jsx
│   │   │   │   │   ├── BillsTable.jsx
│   │   │   │   │   └── ReminderModal.jsx
│   │   │   │   └── hooks/
│   │   │   │       └── useDashboardStats.js
│   │   │   │
│   │   │   ├── reservas/                  ← Vendas page quebrada
│   │   │   │   ├── Reservas.jsx           ← Page principal (era Vendas.jsx)
│   │   │   │   ├── components/
│   │   │   │   │   ├── ReservaFormModal.jsx
│   │   │   │   │   ├── PagamentoModal.jsx
│   │   │   │   │   ├── CancelamentoModal.jsx
│   │   │   │   │   ├── ReciboModal.jsx
│   │   │   │   │   ├── BancoModal.jsx
│   │   │   │   │   ├── ReservaMobileCard.jsx
│   │   │   │   │   └── ReservaDesktopTable.jsx
│   │   │   │   └── hooks/
│   │   │   │       └── useReservaForm.js
│   │   │   │
│   │   │   ├── quartos/
│   │   │   │   ├── Quartos.jsx
│   │   │   │   └── components/
│   │   │   │       └── QuartoCard.jsx
│   │   │   │
│   │   │   ├── disponibilidade/
│   │   │   │   ├── Disponibilidade.jsx
│   │   │   │   └── hooks/
│   │   │   │       └── useReservaMap.js   ← lookup O(1) pre-computado
│   │   │   │
│   │   │   ├── despesas/
│   │   │   │   ├── Despesas.jsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── DespesaFormModal.jsx
│   │   │   │   │   └── DespesaPrintReport.jsx
│   │   │   │   └── hooks/
│   │   │   │       └── useDespesaForm.js
│   │   │   │
│   │   │   ├── financeiro/
│   │   │   │   ├── FluxoCaixa.jsx
│   │   │   │   ├── DRE.jsx
│   │   │   │   └── hooks/
│   │   │   │       └── useDREData.js      ← single-pass computation
│   │   │   │
│   │   │   ├── faturas/
│   │   │   │   ├── Faturas.jsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── FaturaFormModal.jsx
│   │   │   │   │   ├── FaturaCard.jsx
│   │   │   │   │   └── FaturaStats.jsx
│   │   │   │   └── hooks/
│   │   │   │       └── useFaturaForm.js
│   │   │   │
│   │   │   ├── usuarios/
│   │   │   │   ├── Usuarios.jsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── UsuarioFormModal.jsx
│   │   │   │   │   └── UsuarioCard.jsx
│   │   │   │   └── constants/
│   │   │   │       └── permissions.js
│   │   │   │
│   │   │   ├── fornecedores/
│   │   │   │   ├── Fornecedores.jsx
│   │   │   │   └── components/
│   │   │   │       └── FornecedorFormModal.jsx
│   │   │   │
│   │   │   ├── configuracoes/
│   │   │   │   ├── Configuracoes.jsx
│   │   │   │   └── components/
│   │   │   │       └── LogoUploader.jsx
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── AdminPanel.jsx
│   │   │       └── components/
│   │   │           └── EmpresaCard.jsx
│   │   │
│   │   ├── services/                      ← CAMADA DE SERVICOS (DIP)
│   │   │   ├── interfaces/               ← Contratos abstratos
│   │   │   │   ├── quartos.interface.js
│   │   │   │   ├── reservas.interface.js
│   │   │   │   ├── despesas.interface.js
│   │   │   │   ├── fluxoCaixa.interface.js
│   │   │   │   ├── faturas.interface.js
│   │   │   │   ├── usuarios.interface.js
│   │   │   │   ├── fornecedores.interface.js
│   │   │   │   ├── bancos.interface.js
│   │   │   │   └── auth.interface.js
│   │   │   ├── firestore/                ← Implementacao Firestore (atual)
│   │   │   │   ├── quartos.firestore.js
│   │   │   │   ├── reservas.firestore.js
│   │   │   │   ├── despesas.firestore.js
│   │   │   │   ├── fluxoCaixa.firestore.js
│   │   │   │   ├── faturas.firestore.js
│   │   │   │   ├── usuarios.firestore.js
│   │   │   │   ├── fornecedores.firestore.js
│   │   │   │   ├── bancos.firestore.js
│   │   │   │   ├── auth.firestore.js
│   │   │   │   └── seed.firestore.js
│   │   │   ├── api/                      ← FUTURO: Implementacao API REST
│   │   │   │   └── (criado na migracao Postgres)
│   │   │   ├── api.js                    ← Axios instance
│   │   │   └── index.js                  ← Factory: escolhe Firestore ou API
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx            ← Simplificado (so auth)
│   │   │   └── HotelContext.jsx           ← Renomeado (sem "Firestore")
│   │   │
│   │   ├── hooks/
│   │   │   ├── useRealTime.js            ← FUTURO: Socket.IO
│   │   │   └── useMobile.js
│   │   │
│   │   ├── utils/
│   │   │   ├── dateUtils.js              ← UNICA fonte de toDate()
│   │   │   ├── formatters.js             ← UNICA fonte de formatCurrency()
│   │   │   └── masks.js                  ← UNICA fonte de maskCPF/CNPJ/Phone
│   │   │
│   │   ├── styles/
│   │   │   └── formClasses.js            ← inputCls, selectCls
│   │   │
│   │   ├── config/
│   │   │   └── firebase.js               ← Temporario ate migracao
│   │   │
│   │   └── lib/
│   │       └── utils.js                  ← cn() shadcn utility
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── jsconfig.json
│   ├── components.json
│   └── package.json
│
├── backend/                               ← FUTURO: NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── empresas/
│   │   │   ├── quartos/
│   │   │   ├── reservas/
│   │   │   ├── despesas/
│   │   │   ├── fluxo-caixa/
│   │   │   ├── faturas/
│   │   │   ├── usuarios/
│   │   │   ├── fornecedores/
│   │   │   ├── bancos/
│   │   │   ├── dashboard/
│   │   │   ├── relatorios/
│   │   │   └── websocket/
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   ├── decorators/
│   │   │   └── interceptors/
│   │   └── database/
│   │       ├── migrations/
│   │       └── seeds/
│   ├── test/
│   ├── Dockerfile
│   └── package.json
│
├── .firebaserc                            ← Temporario ate migracao
├── firebase.json                          ← Temporario ate migracao
├── firestore.rules                        ← Temporario ate migracao
├── firestore.indexes.json                 ← Temporario ate migracao
├── docker-compose.yml                     ← NOVO: dev environment
├── CLAUDE.md
├── README.md
├── GUIA_USUARIO.md
├── correcoes.md
├── PLANO_MIGRACAO_POSTGRES.md
└── .gitignore
```

---

> **Tarefas de execucao:** ver Sprints 0 e 7 no PLANO MESTRE.

---

# PLANO MESTRE — ADEQUACAO AS BOAS PRATICAS (agents/tech/)

> Cada tarefa segue TDD: escrever teste ANTES da implementacao.
> Lembrete: `*.spec.js` PRIMEIRO, `*.js` DEPOIS. Sem excecoes.

---

## MAPEAMENTO: AGENTE → VIOLACOES NO PROJETO

### 01-SOLID — 35 violacoes

| Principio | Violacoes | Arquivos |
|-----------|-----------|----------|
| **SRP** | 11 arquivos com multiplas responsabilidades | Vendas(10 resp), Usuarios(6), Faturas(5), Dashboard(5), AuthContext(5), firestoreService(8), DRE(4), Despesas(4), HotelContext(3), Fornecedores(3), Layout(4) |
| **OCP** | Status configs hardcoded em 5+ paginas | Vendas:11, Despesas:11, Dashboard:27, Usuarios:61, Quartos:46 |
| **ISP** | 1 fat interface (38 props) | HotelFirestoreContext:234-282 |
| **DIP** | 7 arquivos com imports diretos Firebase | firebase.js, firestoreService, AuthContext, HotelFirestoreContext, Configuracoes, firestoreServiceOld, Sidebar |

### 02-Clean Code — 85 violacoes

| Regra | Violacoes | Detalhes |
|-------|-----------|---------|
| Arquivos >300 linhas | 8 | Vendas(1227), Usuarios(790), Faturas(786), Dashboard(600), Despesas(509), firestoreService(501), DRE(447), AuthContext(387) |
| Funcoes >30 linhas | 27 | Vendas(5), Usuarios(3), Faturas(3), Dashboard(2), Despesas(2), DRE(1), Disponibilidade(1), etc. |
| Magic strings | 50+ | Status values, roles, emails, precos hardcoded |
| Codigo duplicado | 15+ blocos | fmt(6x), toDate(4x), Modal(5x), masks(2x), inputCls(4x), etc. |
| DRY violations | ~1000 linhas | Estimativa de codigo duplicado eliminavel |
| YAGNI | 37 shadcn/ui + 7 dead files | Componentes nunca importados, contextos abandonados |

### 03-Clean Architecture — Ausente

| Regra | Status | Problema |
|-------|--------|---------|
| Camada Domain (entities) | ❌ AUSENTE | Nenhuma entity, value object, ou domain service |
| Camada Application (use cases) | ❌ AUSENTE | Logica de negocio espalhada em pages e contexts |
| Camada Interface Adapters | ❌ PARCIAL | firestoreService e um adapter, mas sem interface |
| Regra de dependencia | ❌ VIOLADA | Pages importam Firebase diretamente |

### 04-Hexagonal — Ausente

| Regra | Status | Problema |
|-------|--------|---------|
| Domain core isolado | ❌ | Nenhum dominio definido |
| Primary Ports (input) | ❌ | Sem interfaces de entrada |
| Secondary Ports (output) | ❌ | Sem interfaces de saida (repositorio) |
| Adapters intercambiaveis | ❌ | Firebase hardcoded, impossivel trocar |
| Testes com fakes/in-memory | ❌ | Zero testes |

### 05-Security — 22 violacoes

| Regra OWASP | Violacoes | Detalhes |
|-------------|-----------|---------|
| A01 Broken Access Control | 4 | Client-only admin check, no route auth, IDOR possivel, self-privilege escalation |
| A02 Cryptographic Failures | 2 | Firebase keys hardcoded, no env vars |
| A03 Injection | 3 | XSS via innerHTML (Vendas, Despesas), path injection potencial |
| A07 Auth Failures | 3 | Hardcoded admin email, no rate limiting, password min 6 chars |
| A05 Security Misconfig | 3 | firebase-admin no frontend, next-themes errado, debug console.logs |
| Input Validation | 33 | ZERO validacao em 33 funcoes Firestore |
| Firestore Rules | 3 | Privilege escalation, create broken, multi-tenant leak |

### 06-Performance — 30 violacoes

| Regra | Violacoes | Detalhes |
|-------|-----------|---------|
| Zero code splitting | 1 | 11 pages importadas estaticamente |
| Context sem useMemo | 2 | HotelContext + AuthContext |
| Intl.NumberFormat recriado | 6 | 300-500 constructors/render |
| O(n^2) algorithms | 4 | Disponibilidade(161K iter), DRE(120K), Dashboard(1.7K), FluxoCaixa(31K) |
| Sem paginacao | 8 | Todas queries sem limit() |
| Sem useMemo em filtros | 6 | Quartos, Faturas, Usuarios, Vendas, Despesas, DRE |
| 17+ deps nao usadas | 1 | ~500KB-1MB bundle desperdicado |

### 07-Testing — Ausente (0%)

| Regra | Status |
|-------|--------|
| Testes unitarios | ❌ ZERO |
| Testes integracao | ❌ ZERO |
| Testes E2E | ❌ ZERO |
| Framework de teste | ❌ Nao configurado |
| Coverage > 80% | ❌ 0% |

### 10-TDD — Ausente (0%)

| Regra | Status |
|-------|--------|
| Spec antes do codigo | ❌ Nunca aplicado |
| Red-Green-Refactor | ❌ Nunca aplicado |
| Bug fix com teste regressao | ❌ Nunca aplicado |

---

## ROADMAP DE EXECUCAO — 8 SPRINTS

> **Lembrete TDD:** Em cada tarefa, escrever teste PRIMEIRO, ver FALHAR, implementar, ver PASSAR.

---

### SPRINT 0 — LIMPEZA + SETUP DE TESTES (~4h)

> **Pré-requisito para todo o resto.** Limpar dead code e configurar testes.

```
SETUP DE TESTES (Agente: 07-Testing, 10-TDD)
[ ] T0.1  Instalar Vitest + React Testing Library + jsdom                         ~30min
[ ] T0.2  Configurar vitest.config.js com aliases (@/), jsdom, coverage           ~30min
[ ] T0.3  Adicionar scripts no package.json: test, test:watch, test:coverage      ~5min
[ ] T0.4  Criar primeiro teste smoke: src/__tests__/setup.test.js                 ~15min
[ ] T0.5  Verificar: `pnpm test` roda e passa                                    ~5min

LIMPEZA (Agente: 02-Clean Code — YAGNI)
[ ] T0.6  Deletar 17 docs Firebase antigos da raiz                                ~5min
[ ] T0.7  Deletar Layout.jsx, Sidebar.jsx, .manus-template-version da raiz        ~2min
[ ] T0.8  Deletar firebaserc, memory.md da raiz                                   ~1min
[ ] T0.9  Deletar src/context/HotelContext.jsx (221 linhas dead)                  ~1min
[ ] T0.10 Deletar src/context/HybridHotelContext.jsx (324 linhas dead)            ~1min
[ ] T0.11 Deletar src/context/MockAuthContext.jsx (dead)                          ~1min
[ ] T0.12 Deletar src/services/firestoreServiceOld.js (374 linhas dead)           ~1min
[ ] T0.13 Deletar src/data/mockData.js (200 linhas dead)                          ~1min
[ ] T0.14 Deletar src/types/index.js (56 linhas dead, nunca importado)            ~1min
[ ] T0.15 Deletar src/components/Sidebar.jsx (136 linhas dead)                    ~1min
[ ] T0.16 Deletar src/components/TopBar.jsx (132 linhas dead)                     ~1min
[ ] T0.17 Deletar src/components/ProtectedRoute.jsx (35 linhas dead)              ~1min
[ ] T0.18 Deletar src/components/EmpresaSelector.jsx (147 linhas dead)            ~1min
[ ] T0.19 Deletar src/App.css (120 linhas, Tailwind ja usado)                     ~1min
[ ] T0.20 Deletar src/components/Layout.css (179 linhas, nao importado)           ~1min
[ ] T0.21 Deletar 37 shadcn/ui nao utilizados (manter 9 usados)                  ~5min
[ ] T0.22 Remover dependencias npm nao usadas (npx depcheck + pnpm remove)        ~15min
[ ] T0.23 Remover firebase-admin e next-themes do package.json                    ~2min
[ ] T0.24 Verificar build: pnpm build                                             ~5min
[ ] T0.25 Commit: "chore: remove 71 dead files, setup vitest"                     ~5min
```

---

### SPRINT 1 — SEGURANCA CRITICA (~18h)

> **Bloqueia producao.** Corrigir vulnerabilidades antes de qualquer refactoring.

```
FIREBASE CONFIG (Agente: 05-Security — A02)
[ ] T1.1  TEST: config retorna valores de env vars                                ~15min
[ ] T1.2  Mover firebase config para env vars (.env.local + .env.example)         ~30min
[ ] T1.3  Atualizar .gitignore para excluir .env.local                            ~5min

FIRESTORE RULES (Agente: 05-Security — A01)
[ ] T1.4  Fix self-update: resource.data → request.resource.data (rules:108-110)  ~30min
[ ] T1.5  Fix create rule: resource → request.resource (rules:126)                ~15min
[ ] T1.6  Scope logs para empresa (rules:131)                                     ~15min
[ ] T1.7  Adicionar regras para collections ausentes (hospedes, fornecedores)     ~1h
[ ] T1.8  Adicionar validacao de schema nas regras de escrita                     ~2h

INPUT VALIDATION (Agente: 05-Security — A03)
[ ] T1.9  TEST: validateId throws para null, '', '/', undefined                   ~30min
[ ] T1.10 Criar src/utils/validators.js com validateId, validateRequired          ~30min
[ ] T1.11 TEST: cada funcao do firestoreService rejeita input invalido            ~2h
[ ] T1.12 Adicionar validacao em TODAS 33 funcoes do firestoreService             ~3h
[ ] T1.13 TEST: addReserva rejeita checkout < checkin                             ~15min
[ ] T1.14 Implementar validacao de datas em addReserva                            ~15min

XSS (Agente: 05-Security — A03)
[ ] T1.15 TEST: escapeHtml escapa <script>, <img onerror>                         ~15min
[ ] T1.16 Criar src/utils/sanitize.js com escapeHtml()                            ~15min
[ ] T1.17 Aplicar escapeHtml em Vendas.jsx print (line 1148)                      ~15min
[ ] T1.18 Aplicar escapeHtml em Despesas.jsx print (line 131)                     ~15min

AUTH (Agente: 05-Security — A07)
[ ] T1.19 Remover ADMIN_EMAIL hardcoded do AuthContext                            ~15min
[ ] T1.20 Remover mock data hardcoded de Faturas.jsx e Usuarios.jsx               ~30min
[ ] T1.21 Remover senha plain text do Usuarios.jsx (usar Firebase Auth only)      ~1h
[ ] T1.22 Remover 14 console.log do AuthContext                                   ~15min
[ ] T1.23 Remover email pessoal de TopBar.jsx e TrialExpired.jsx                  ~15min
[ ] T1.24 Adicionar controle de acesso por role nas rotas (App.jsx)               ~2h
[ ] T1.25 Commit: "fix: critical security vulnerabilities"                        ~5min
```

---

### SPRINT 2 — DESIGN SYSTEM + UTILS COMPARTILHADOS (~12h)

> **Elimina ~1000 linhas duplicadas.** Cria fundacao para refactoring posterior.

```
UTILS (Agente: 02-Clean Code — DRY)
[ ] T2.1  TEST: formatCurrency formata BRL corretamente                           ~15min
[ ] T2.2  Criar src/utils/formatters.js (formatCurrency com Intl cacheado)        ~15min
[ ] T2.3  Substituir fmt() em 7 arquivos                                          ~30min
[ ] T2.4  TEST: maskCPF, maskCNPJ, maskPhone formatam corretamente               ~15min
[ ] T2.5  Criar src/utils/masks.js                                                ~15min
[ ] T2.6  Substituir masks em Vendas.jsx e Fornecedores.jsx                       ~15min
[ ] T2.7  Remover toDate() local de Dashboard, Despesas, Layout                   ~15min
[ ] T2.8  Criar src/styles/formClasses.js (inputCls, selectCls, textareaCls)      ~15min
[ ] T2.9  Substituir inputCls/selectCls em 8 arquivos                             ~30min

DESIGN SYSTEM (Agente: 02-Clean Code — DRY, 09-Code Review — Design System)
[ ] T2.10 Criar src/components/ds/ (pasta)                                         ~1min
[ ] T2.11 TEST: Modal renderiza, fecha com X, fecha com Escape                    ~30min
[ ] T2.12 Criar ds/Modal.jsx (backdrop, focus trap, portal, Escape)               ~2h
[ ] T2.13 Substituir 5 variantes de Modal nos 12 pages                            ~2h
[ ] T2.14 TEST: FormField renderiza label + children                              ~10min
[ ] T2.15 Criar ds/FormField.jsx                                                  ~15min
[ ] T2.16 TEST: SearchInput renderiza, dispara onChange                            ~10min
[ ] T2.17 Criar ds/SearchInput.jsx                                                ~15min
[ ] T2.18 TEST: StatCard renderiza titulo, valor, icone                           ~10min
[ ] T2.19 Criar ds/StatCard.jsx                                                   ~15min
[ ] T2.20 TEST: LoadingSpinner renderiza em 3 tamanhos                            ~10min
[ ] T2.21 Criar ds/LoadingSpinner.jsx                                             ~15min
[ ] T2.22 TEST: EmptyState renderiza icone, mensagem, acao                        ~10min
[ ] T2.23 Criar ds/EmptyState.jsx                                                 ~15min
[ ] T2.24 TEST: ConfirmDialog exibe, confirma, cancela                            ~15min
[ ] T2.25 Criar ds/ConfirmDialog.jsx (substitui window.confirm)                   ~30min
[ ] T2.26 TEST: StatusBadge renderiza com config                                  ~10min
[ ] T2.27 Criar ds/StatusBadge.jsx                                                ~15min
[ ] T2.28 TEST: FilterPills seleciona, mostra count                               ~10min
[ ] T2.29 Criar ds/FilterPills.jsx                                                ~15min
[ ] T2.30 TEST: PageHeader renderiza titulo, subtitulo, acoes                     ~10min
[ ] T2.31 Criar ds/PageHeader.jsx                                                 ~15min
[ ] T2.32 Criar ds/index.js (barrel export)                                       ~5min
[ ] T2.33 Substituir todos os componentes inline nos 12 pages pelos do DS         ~3h
[ ] T2.34 Substituir window.confirm() por ConfirmDialog em 5 arquivos             ~30min
[ ] T2.35 Normalizar cores: gray-* → slate-* em Fornecedores, Usuarios, Faturas   ~1h
[ ] T2.36 Commit: "refactor: extract design system, eliminate ~1000 lines"        ~5min
```

---

### SPRINT 3 — DIP / INVERSAO DE DEPENDENCIAS (~16h)

> **Desacopla do Firebase.** Prepara para migracao Postgres.

```
INTERFACES (Agente: 01-SOLID — DIP, 04-Hexagonal — Ports)
[ ] T3.1  TEST: quartosService.listar retorna array de quartos                    ~15min
[ ] T3.2  Criar src/services/interfaces/ com contrato para cada dominio           ~1h
         (quartos, reservas, despesas, fluxoCaixa, faturas, usuarios,
          fornecedores, bancos, auth, storage)

ADAPTERS FIRESTORE (Agente: 04-Hexagonal — Adapters)
[ ] T3.3  TEST: quartosFirestore.listar busca do Firestore                        ~30min
[ ] T3.4  Criar src/services/firestore/quartos.firestore.js                       ~30min
[ ] T3.5  TEST: reservasFirestore.criar executa batch atomico                     ~30min
[ ] T3.6  Criar src/services/firestore/reservas.firestore.js                      ~1h
[ ] T3.7  Criar src/services/firestore/despesas.firestore.js                      ~30min
[ ] T3.8  Criar src/services/firestore/fluxoCaixa.firestore.js                    ~30min
[ ] T3.9  Criar src/services/firestore/faturas.firestore.js                       ~30min
[ ] T3.10 Criar src/services/firestore/usuarios.firestore.js                      ~30min
[ ] T3.11 Criar src/services/firestore/fornecedores.firestore.js                  ~15min
[ ] T3.12 Criar src/services/firestore/bancos.firestore.js                        ~15min
[ ] T3.13 Criar src/services/firestore/auth.firestore.js                          ~1h
[ ] T3.14 Criar src/services/firestore/storage.firestore.js                       ~15min
[ ] T3.15 Criar src/services/firestore/seed.firestore.js                          ~15min

FACTORY (Agente: 04-Hexagonal — Adapter Selection)
[ ] T3.16 Criar src/services/index.js (factory: VITE_USE_API → api ou firestore) ~30min

CONTEXT REFACTOR (Agente: 01-SOLID — SRP, ISP)
[ ] T3.17 Renomear HotelFirestoreContext.jsx → HotelContext.jsx (13 imports)      ~30min
[ ] T3.18 HotelContext importar de services/index.js (nao firestoreService)       ~1h
[ ] T3.19 AuthContext importar de services/index.js (nao firebase/* direto)       ~2h
[ ] T3.20 Configuracoes.jsx importar storage de services (nao firebase/storage)   ~30min

DELETAR ANTIGO
[ ] T3.21 Deletar src/services/firestoreService.js (substituido por adapters)     ~5min
[ ] T3.22 Verificar build + rodar testes                                          ~15min
[ ] T3.23 Commit: "refactor: DIP — services abstracted via interfaces"            ~5min
```

---

### SPRINT 4 — QUEBRA DE GOD COMPONENTS (~20h)

> **Cada arquivo <= 300 linhas, cada funcao <= 30 linhas.**

```
VENDAS (1227 → 9 arquivos) (Agente: 01-SOLID — SRP, 02-Clean Code)
[ ] T4.1  TEST: ReservaFormModal renderiza, submete dados validos                 ~30min
[ ] T4.2  Extrair src/features/reservas/components/ReservaFormModal.jsx           ~1h
[ ] T4.3  TEST: PagamentoModal processa pagamento                                ~30min
[ ] T4.4  Extrair PagamentoModal.jsx                                              ~1h
[ ] T4.5  Extrair CancelamentoModal.jsx                                           ~30min
[ ] T4.6  Extrair ReciboModal.jsx (com escapeHtml)                                ~30min
[ ] T4.7  Extrair BancoModal.jsx                                                  ~30min
[ ] T4.8  Extrair ReservaMobileCard.jsx + ReservaDesktopTable.jsx                 ~1h
[ ] T4.9  TEST: useReservaForm gerencia state do formulario                       ~30min
[ ] T4.10 Extrair hooks/useReservaForm.js                                         ~1h
[ ] T4.11 Verificar Vendas.jsx < 300 linhas                                       ~15min

FATURAS (786 → 4 arquivos) (Agente: 01-SOLID — SRP)
[ ] T4.12 TEST: FaturaFormModal renderiza, calcula valorTotal                     ~30min
[ ] T4.13 Extrair FaturaFormModal.jsx, FaturaCard.jsx, FaturaStats.jsx            ~2h
[ ] T4.14 Extrair hooks/useFaturaForm.js (converter useState+useEffect → useMemo) ~1h

USUARIOS (790 → 4 arquivos) (Agente: 01-SOLID — SRP)
[ ] T4.15 TEST: UsuarioFormModal renderiza, valida senha                          ~30min
[ ] T4.16 Extrair UsuarioFormModal.jsx, UsuarioCard.jsx                           ~1h
[ ] T4.17 Extrair constants/permissions.js (getPermissoesPorRole)                 ~30min

DASHBOARD (600 → 6 arquivos) (Agente: 01-SOLID — SRP)
[ ] T4.18 TEST: useDashboardStats calcula stats corretos                          ~30min
[ ] T4.19 Extrair hooks/useDashboardStats.js                                      ~1h
[ ] T4.20 Extrair RevenueChart, RoomStatusCard, BillsTable, ReminderModal         ~2h

DESPESAS (509 → 3 arquivos) (Agente: 01-SOLID — SRP)
[ ] T4.21 Extrair DespesaFormModal.jsx, DespesaPrintReport.jsx                    ~1h

DRE (447 → 2 arquivos) (Agente: 01-SOLID — SRP)
[ ] T4.22 TEST: useDREData calcula receita, despesa, lucro, margem               ~30min
[ ] T4.23 Extrair hooks/useDREData.js (single-pass computation)                   ~1h

AUTH CONTEXT (387 → 3 arquivos) (Agente: 01-SOLID — SRP)
[ ] T4.24 Extrair TrialContext (verificarStatusTrial, ativarEmpresa)              ~1h
[ ] T4.25 Extrair EmpresaContext (carregarEmpresas, selecionarEmpresa)            ~1h
[ ] T4.26 AuthContext fica com: login, logout, criarConta, recuperarSenha         ~30min

HOTEL CONTEXT (289 → contextos por dominio) (Agente: 01-SOLID — ISP)
[ ] T4.27 Separar HotelDataContext (estados) de HotelActionsContext (funcoes)     ~2h
     Ou: separar por dominio (QuartosContext, ReservasContext, FinanceiroContext)

LAYOUT (308 → 4 arquivos) (Agente: 01-SOLID — SRP)
[ ] T4.28 Extrair components/layout/Sidebar.jsx                                   ~30min
[ ] T4.29 Extrair components/layout/Header.jsx                                    ~30min
[ ] T4.30 Extrair components/layout/NotificationBell.jsx                          ~30min
[ ] T4.31 Verificar TODOS arquivos < 300 linhas                                   ~15min
[ ] T4.32 Commit: "refactor: split god components, all files <300 lines"          ~5min
```

---

### SPRINT 5 — PERFORMANCE (~14h)

> **Eliminar re-renders, O(n^2), bundle bloat.**

```
CONTEXT MEMOIZATION (Agente: 06-Performance)
[ ] T5.1  TEST: HotelContext value e estavel entre renders sem mudanca de dados    ~30min
[ ] T5.2  Adicionar useMemo ao value do HotelContext                              ~30min
[ ] T5.3  Adicionar useCallback + useMemo ao value do AuthContext                 ~1h

CODE SPLITTING (Agente: 06-Performance — Bundle)
[ ] T5.4  Converter 11 imports estaticos para React.lazy() em App.jsx             ~1h
[ ] T5.5  Adicionar <Suspense fallback={<LoadingSpinner />}>                      ~15min

ALGORITMOS O(n^2) (Agente: 06-Performance)
[ ] T5.6  TEST: useReservaMap retorna Map correto para lookup O(1)                ~30min
[ ] T5.7  Criar hooks/useReservaMap.js para Disponibilidade                       ~1h
[ ] T5.8  TEST: useDREData computa dados mensais em single-pass                   ~30min
[ ] T5.9  Implementar single-pass no useDREData (elimina 120K iteracoes)          ~1h
[ ] T5.10 TEST: useDashboardStats computa em single-pass                          ~30min
[ ] T5.11 Implementar single-pass no useDashboardStats                            ~1h
[ ] T5.12 Implementar single-pass no FluxoCaixa chart data                        ~30min

MEMOIZACAO DE FILTROS (Agente: 06-Performance)
[ ] T5.13 Adicionar useMemo em quartosFiltrados (Quartos.jsx)                     ~15min
[ ] T5.14 Adicionar useMemo em filteredFaturas (Faturas.jsx)                      ~15min
[ ] T5.15 Adicionar useMemo em filteredUsuarios (Usuarios.jsx)                    ~15min
[ ] T5.16 Adicionar useMemo em filteredReservas (Vendas.jsx)                      ~15min
[ ] T5.17 Adicionar useMemo em despesasFiltradas (Despesas.jsx)                   ~15min
[ ] T5.18 Converter valorTotal/proximaFatura de state → useMemo (Faturas)         ~30min

FIRESTORE QUERIES (Agente: 06-Performance — Paginacao)
[ ] T5.19 Adicionar limit() em todos os onSnapshot listeners                      ~1h
[ ] T5.20 Guard seed functions com localStorage                                   ~15min

INTL CACHEADO (Agente: 06-Performance)
[ ] T5.21 (Ja feito em T2.2 — formatCurrency com Intl cacheado)                  ~0min

BUNDLE (Agente: 06-Performance)
[ ] T5.22 Rodar npx depcheck, remover deps nao usadas restantes                  ~30min
[ ] T5.23 Lazy-load Firebase Analytics                                            ~15min
[ ] T5.24 Commit: "perf: memoize, code split, eliminate O(n²)"                   ~5min
```

---

### SPRINT 6 — TESTES COMPLETOS (~20h)

> **Coverage > 80%.** Agora que o codigo esta limpo, testavel, e desacoplado.

```
TESTES DE UTILS (Agente: 07-Testing, 10-TDD)
[ ] T6.1  TEST: dateUtils — toDate com Timestamp, Date, string, null, invalid     ~30min
[ ] T6.2  TEST: formatters — formatCurrency com 0, negativo, grande, null         ~15min
[ ] T6.3  TEST: masks — CPF, CNPJ, Phone com valores validos e invalidos          ~30min
[ ] T6.4  TEST: validators — validateId, validateRequired, escapeHtml             ~30min

TESTES DE SERVICES (Agente: 07-Testing — Integracao)
[ ] T6.5  TEST: quartosService — listar, criar, atualizar, deletar (com mock)    ~1h
[ ] T6.6  TEST: reservasService — criar (batch atomico), checkout, cancelar       ~1h
[ ] T6.7  TEST: despesasService — criar (com fluxoCaixa), deletar (com cascade)  ~1h
[ ] T6.8  TEST: authService — login, register, checkTrial, loadEmpresas          ~1h

TESTES DE HOOKS (Agente: 07-Testing — Unitario)
[ ] T6.9  TEST: useReservaForm — state management, calculo de valor               ~1h
[ ] T6.10 TEST: useDashboardStats — stats computation, edge cases                 ~1h
[ ] T6.11 TEST: useDREData — receita, despesa, lucro, margem, tendencia          ~1h
[ ] T6.12 TEST: useReservaMap — lookup correto, reservas sobrepostas             ~30min

TESTES DE COMPONENTES DS (Agente: 07-Testing — Unitario)
[ ] T6.13 TEST: Modal — open/close, Escape, focus trap, portal                   ~30min
[ ] T6.14 TEST: FormField — label, required, htmlFor                             ~15min
[ ] T6.15 TEST: ConfirmDialog — confirm, cancel, loading, variant                ~30min
[ ] T6.16 TEST: StatusBadge — renderiza com diferentes configs                   ~15min
[ ] T6.17 TEST: FilterPills — selecao, count                                     ~15min
[ ] T6.18 TEST: PageHeader — titulo, subtitulo, acoes                            ~15min
[ ] T6.19 TEST: StatCard — valor, icone, trend                                   ~15min
[ ] T6.20 TEST: EmptyState — icone, mensagem, acao                               ~15min

TESTES DE PAGES (Agente: 07-Testing — Integracao)
[ ] T6.21 TEST: Dashboard — renderiza stats, charts, alertas                     ~1h
[ ] T6.22 TEST: Quartos — CRUD completo, filtros, unicidade de numero            ~1h
[ ] T6.23 TEST: Reservas — criar, pagar, cancelar, imprimir                      ~1h
[ ] T6.24 TEST: Despesas — criar com fluxoCaixa, filtrar, imprimir               ~1h
[ ] T6.25 TEST: Login — login, cadastro, recuperar, validacao                    ~1h

VERIFICACAO FINAL
[ ] T6.26 Rodar pnpm test:coverage                                               ~5min
[ ] T6.27 Verificar: coverage > 80% statements, > 70% branches                   ~15min
[ ] T6.28 Commit: "test: comprehensive test suite, >80% coverage"                ~5min
```

---

### SPRINT 7 — REORGANIZACAO POR FEATURE (~6h)

> **Estrutura final.** Mover tudo para features/.

```
REORGANIZAR (Agente: 03-Clean Architecture — Estrutura)
[ ] T7.1  Criar src/features/ com pastas por dominio                              ~30min
         (dashboard, reservas, quartos, disponibilidade, despesas,
          financeiro, faturas, usuarios, fornecedores, configuracoes, admin)
[ ] T7.2  Mover pages e sub-componentes para features/                            ~1h
[ ] T7.3  Mover hooks especificos para features/*/hooks/                          ~30min
[ ] T7.4  Mover constants especificos para features/*/constants/                  ~15min
[ ] T7.5  Mover auth components para components/auth/                             ~15min
[ ] T7.6  Mover Layout para components/layout/ (Sidebar, Header, Bell)            ~15min
[ ] T7.7  Atualizar imports no App.jsx (rotas)                                    ~30min
[ ] T7.8  Atualizar imports nos testes                                            ~30min
[ ] T7.9  Mover tudo para frontend/ (preparar monorepo)                           ~1h
[ ] T7.10 Atualizar vite.config.js e jsconfig.json paths                          ~15min
[ ] T7.11 Verificar build + rodar todos testes                                    ~15min
[ ] T7.12 Commit: "refactor: feature-based architecture, monorepo ready"          ~5min
```

---

## CHECKLIST FINAL DE CONFORMIDADE (pos-execucao)

### 00-Tech-Orchestrator

```
[ ] TDD antes de codigo? (Verificar ordem de commits: spec antes de implementacao)
[ ] Interfaces antes de implementacoes?
[ ] Dependencias injetadas via construtor/factory?
[ ] TODOS inputs validados?
[ ] Erros tratados com contexto?
[ ] Codigo testavel?
[ ] NUNCA God Classes? (Verificar: nenhum arquivo >300 linhas)
[ ] NUNCA funcoes >30 linhas?
[ ] NUNCA secrets hardcoded?
[ ] NUNCA codigo duplicado? (fmt, toDate, Modal, masks, inputCls eliminados)
[ ] Coverage > 80% statements, > 70% branches?
```

### 01-SOLID

```
[ ] SRP: cada arquivo tem UMA razao para mudar?
[ ] OCP: status configs em constants compartilhados (nao hardcoded por page)?
[ ] ISP: contexts segregados (data vs actions, ou por dominio)?
[ ] DIP: pages importam de services/index.js (nao firebase/* direto)?
```

### 02-Clean Code

```
[ ] Todos arquivos < 300 linhas?
[ ] Todas funcoes < 30 linhas?
[ ] Zero magic strings (status, roles em constants)?
[ ] Zero codigo duplicado (DRY: utils compartilhados)?
[ ] Zero dead code (YAGNI: 71 arquivos deletados)?
[ ] Nomes descritivos que revelam intencao?
```

### 03-Clean Architecture

```
[ ] Camada de services com interfaces?
[ ] Logica de negocio fora de pages (em hooks/services)?
[ ] Framework (Firebase) isolado em adapters?
[ ] Regra de dependencia respeitada (pages → hooks → services → adapters)?
```

### 04-Hexagonal

```
[ ] Ports definidos como interfaces (services/interfaces/)?
[ ] Adapters Firestore implementam ports (services/firestore/)?
[ ] Factory seleciona adapter por env var (services/index.js)?
[ ] Testes usam mocks/fakes (nao Firebase real)?
```

### 05-Security

```
[ ] Firebase config em env vars?
[ ] Firestore rules corrigidas (privilege escalation, create, logs)?
[ ] Input validado em TODAS funcoes de escrita?
[ ] XSS eliminado (escapeHtml em prints)?
[ ] Admin check server-side (nao apenas client)?
[ ] Senha min 8 chars com complexidade?
[ ] Zero console.log em producao?
[ ] Zero emails/precos hardcoded?
```

### 06-Performance

```
[ ] Context values memoizados (useMemo)?
[ ] Code splitting com React.lazy?
[ ] Zero O(n^2) (Map lookup O(1) em Disponibilidade/DRE/Dashboard)?
[ ] Todos filtros com useMemo?
[ ] Intl.NumberFormat cacheado no module level?
[ ] Queries com limit()?
[ ] Deps nao usadas removidas?
```

### 07-Testing

```
[ ] Framework configurado (Vitest)?
[ ] Testes unitarios para utils, hooks, services?
[ ] Testes de componentes para DS?
[ ] Testes de integracao para pages?
[ ] Coverage > 80% statements?
[ ] Coverage > 70% branches?
[ ] Zero testes flaky?
```

### 10-TDD

```
[ ] Spec antes do codigo em TODA nova feature?
[ ] Bug fix com teste de regressao?
[ ] Red-Green-Refactor respeitado?
[ ] Ciclos < 5min?
```

---

## METRICAS ESPERADAS POS-EXECUCAO

| Metrica | Antes | Depois |
|---------|-------|--------|
| Score geral | 3.5/10 | 8.0+/10 |
| Arquivos >300 linhas | 8 | 0 |
| Funcoes >30 linhas | 27 | 0 |
| Linhas duplicadas | ~1000 | 0 |
| Dead code (arquivos) | 71 | 0 |
| Test coverage | 0% | >80% |
| Testes unitarios | 0 | 50+ |
| Magic strings | 50+ | 0 (constants) |
| Firebase imports diretos | 7 arquivos | 0 (via factory) |
| Componentes DS | 0 | 15 |
| Code splitting | Nenhum | 11 lazy routes |
| O(n^2) algorithms | 4 | 0 |
| Dependencias nao usadas | 17+ | 0 |
| Security vulnerabilities | 22 | 0 |

---

## ESTIMATIVA TOTAL

```
Sprint 0: Limpeza + Setup Testes      ~4h
Sprint 1: Seguranca Critica           ~18h
Sprint 2: Design System + Utils       ~12h
Sprint 3: DIP / Inversao Dependencias ~16h
Sprint 4: Quebra God Components       ~20h
Sprint 5: Performance                 ~14h
Sprint 6: Testes Completos            ~20h
Sprint 7: Reorganizacao por Feature   ~6h
──────────────────────────────────────
TOTAL:                                ~110h (~14 dias uteis / ~3 semanas)
```
