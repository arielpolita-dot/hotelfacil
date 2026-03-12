# Guia de Configuração Firebase - Hotel Fácil

## 📋 Pré-requisitos

- Conta Google/Firebase
- Projeto Firebase criado (`hotelfacil-850d1`)
- Node.js instalado
- Sistema Hotel Fácil funcionando

## 🔧 Configuração Passo a Passo

### 1. Configurar Authentication

1. Acesse o [Console Firebase](https://console.firebase.google.com)
2. Selecione o projeto `hotelfacil-850d1`
3. Vá para **Authentication** → **Get started**
4. Na aba **Sign-in method**, habilite:
   - ✅ **Email/Password**
   - ✅ **Google** (opcional)

### 2. Configurar Firestore Database

1. Vá para **Firestore Database** → **Create database**
2. Escolha **Start in test mode** (temporário)
3. Selecione a localização: **southamerica-east1 (São Paulo)**
4. Clique em **Done**

### 3. Aplicar Regras de Segurança

1. No Firestore, vá para **Rules**
2. Substitua o conteúdo pelo arquivo `FIRESTORE_SECURITY_RULES.rules`
3. Clique em **Publish**

### 4. Importar Estrutura de Dados

#### Opção A: Via Console (Recomendado para teste)
1. Use o arquivo `FIREBASE_DATABASE_STRUCTURE.json`
2. No Firestore, crie manualmente as coleções principais:
   - `empresas`
   - Dentro de cada empresa: `dados`, `quartos`, `reservas`, etc.

#### Opção B: Via Script (Produção)
```javascript
// Usar o Firebase Admin SDK para importar dados em lote
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const data = require('./FIREBASE_DATABASE_STRUCTURE.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Script de importação...
```

### 5. Configurar Custom Claims (Importante)

Para que as regras de segurança funcionem, é necessário configurar custom claims:

```javascript
// Função Cloud Function para definir claims
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.setUserClaims = functions.https.onCall(async (data, context) => {
  // Verificar se o usuário tem permissão para definir claims
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Apenas admins podem definir claims');
  }

  const { uid, empresaId, funcao } = data;
  
  await admin.auth().setCustomUserClaims(uid, {
    empresaId: empresaId,
    funcao: funcao
  });

  return { success: true };
});
```

### 6. Configurar Índices Compostos

No Firestore, vá para **Indexes** e crie os seguintes índices:

```
Collection: empresas/{empresaId}/reservas
Fields: status (Ascending), dataCriacao (Descending)

Collection: empresas/{empresaId}/despesas  
Fields: categoria (Ascending), data (Descending)

Collection: empresas/{empresaId}/fluxoCaixa
Fields: tipo (Ascending), data (Descending)

Collection: empresas/{empresaId}/quartos
Fields: status (Ascending), tipo (Ascending)
```

### 7. Configurar Storage (Opcional)

Para upload de imagens:

1. Vá para **Storage** → **Get started**
2. Escolha **Start in test mode**
3. Selecione a localização: **southamerica-east1**
4. Aplique as regras de Storage (comentadas no arquivo de regras)

## 🔐 Configuração de Segurança

### Variáveis de Ambiente

Crie um arquivo `.env` no projeto:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyB-vb8B3g-g_b7XRTt8Zh1DNWEoZ8GKVAE
REACT_APP_FIREBASE_AUTH_DOMAIN=hotelfacil-850d1.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=hotelfacil-850d1
REACT_APP_FIREBASE_STORAGE_BUCKET=hotelfacil-850d1.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=653289515883
REACT_APP_FIREBASE_APP_ID=1:653289515883:web:652cb9f1957f456214fa2e
REACT_APP_FIREBASE_MEASUREMENT_ID=G-JFZ48BJERZ
```

### Configuração de Produção

Para produção, altere as regras para **modo de produção**:

```javascript
// Em vez de "Start in test mode", use regras restritivas
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Aplicar as regras do arquivo FIRESTORE_SECURITY_RULES.rules
  }
}
```

## 🚀 Ativação no Sistema

### 1. Atualizar Configuração Firebase

No arquivo `src/config/firebase.js`, certifique-se de que está usando as credenciais corretas.

### 2. Ativar Modo Firebase

No arquivo `src/context/HybridHotelContext.jsx`, altere:

```javascript
const USE_FIREBASE = true; // Alterar de false para true
```

### 3. Primeiro Usuário Admin

Para criar o primeiro usuário administrador:

1. Registre-se normalmente no sistema
2. No Console Firebase → Authentication, copie o UID do usuário
3. No Firestore, crie manualmente o documento do usuário com permissões de admin
4. Use uma Cloud Function para definir custom claims

## 📊 Estrutura de Dados

### Hierarquia Principal

```
empresas/
├── {empresaId}/
│   ├── dados/                 # Informações da empresa
│   ├── quartos/              # Quartos do hotel
│   ├── reservas/             # Reservas e hospedagens
│   ├── contratos/            # Contratos corporativos
│   ├── faturas/              # Faturas dos contratos
│   ├── despesas/             # Despesas operacionais
│   ├── fluxoCaixa/           # Transações financeiras
│   ├── usuarios/             # Usuários da empresa
│   ├── configuracoes/        # Configurações do sistema
│   └── auditoria/            # Logs de auditoria
```

### Tipos de Usuário e Permissões

| Função | Dashboard | Quartos | Vendas | Faturas | Despesas | Fluxo | Usuários | Config |
|--------|-----------|---------|--------|---------|----------|-------|----------|--------|
| **Administrador** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Gerente** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Recepcionista** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Financeiro** | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Manutenção** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

## 🔍 Monitoramento

### Métricas Importantes

- **Usage**: Leituras/escritas por dia
- **Performance**: Latência das consultas
- **Security**: Tentativas de acesso negadas
- **Billing**: Custos por operação

### Alertas Recomendados

- Limite de leituras/escritas por dia
- Tentativas de acesso não autorizado
- Falhas de autenticação
- Uso excessivo de storage

## 🆘 Troubleshooting

### Problemas Comuns

1. **"Permission denied"**
   - Verificar regras de segurança
   - Confirmar custom claims do usuário
   - Validar estrutura de permissões

2. **"User not found"**
   - Verificar se o usuário existe no Authentication
   - Confirmar documento do usuário no Firestore
   - Validar empresaId nos custom claims

3. **"Index required"**
   - Criar índices compostos necessários
   - Aguardar propagação dos índices (pode levar alguns minutos)

4. **Dados não carregam**
   - Verificar conexão com Firebase
   - Validar configuração de rede
   - Confirmar regras de leitura

### Logs Úteis

```javascript
// Habilitar logs detalhados do Firebase
import { connectFirestoreEmulator } from 'firebase/firestore';

if (process.env.NODE_ENV === 'development') {
  // Logs detalhados apenas em desenvolvimento
  firebase.firestore.setLogLevel('debug');
}
```

## 📞 Suporte

- **Documentação Firebase**: https://firebase.google.com/docs
- **Console Firebase**: https://console.firebase.google.com
- **Status Firebase**: https://status.firebase.google.com
- **Comunidade**: https://stackoverflow.com/questions/tagged/firebase

---

**⚠️ Importante**: Sempre teste as configurações em ambiente de desenvolvimento antes de aplicar em produção. Mantenha backups regulares dos dados e monitore o uso para evitar custos inesperados.
