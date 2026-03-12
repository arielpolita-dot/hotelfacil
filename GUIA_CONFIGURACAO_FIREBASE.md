# Guia de Configuração do Firebase para o Sistema Hotel Fácil

Este guia fornece um passo a passo detalhado para configurar o ambiente do Firebase necessário para a execução do sistema Hotel Fácil. A configuração correta é crucial para garantir a funcionalidade, segurança e escalabilidade da aplicação.



## Passo 1: Criar um Projeto no Firebase

1.  Acesse o [Console do Firebase](https://console.firebase.google.com/).
2.  Clique em **"Adicionar projeto"**.
3.  Dê um nome ao seu projeto (e.g., "hotel-facil-app") e aceite os termos.
4.  Decida se deseja habilitar o Google Analytics para o projeto (recomendado) e clique em **"Criar projeto"**.

## Passo 2: Configurar o Firestore Database

1.  No menu lateral do seu projeto no Firebase, vá para **Build > Firestore Database**.
2.  Clique em **"Criar banco de dados"**.
3.  Inicie no **modo de produção**. Isso garante que, por padrão, seus dados não sejam publicamente acessíveis.
4.  Escolha a localização do seu banco de dados. A escolha deve ser baseada na localização geográfica dos seus usuários para minimizar a latência. Clique em **"Ativar"**.

## Passo 3: Habilitar a Autenticação

1.  No menu lateral, vá para **Build > Authentication**.
2.  Clique em **"Primeiros passos"**.
3.  Na aba **"Sign-in method"**, selecione **"E-mail/senha"** na lista de provedores.
4.  Habilite o provedor e clique em **"Salvar"**.



## Passo 4: Aplicar as Regras de Segurança

As regras de segurança são fundamentais para proteger os dados da sua aplicação. O arquivo `FIRESTORE_SECURITY_RULES_V2.rules` contém as regras necessárias para o sistema.

1.  No menu do Firestore, vá para a aba **"Regras"**.
2.  Copie todo o conteúdo do arquivo `FIRESTORE_SECURITY_RULES_V2.rules` fornecido com o projeto.
3.  Cole o conteúdo no editor de regras do Firebase, substituindo as regras existentes.
4.  Clique em **"Publicar"** para salvar e aplicar as novas regras.



## Passo 5: Configurar o Aplicativo Web

Para que a sua aplicação React possa se conectar ao Firebase, você precisa das credenciais de configuração do projeto.

1.  Na página principal do seu projeto no Firebase, clique no ícone de engrenagem ao lado de **"Visão geral do projeto"** e selecione **"Configurações do projeto"**.
2.  Na aba **"Geral"**, role para baixo até a seção **"Seus apps"**.
3.  Clique no ícone **</>** para registrar um novo aplicativo da Web.
4.  Dê um apelido para o seu aplicativo (e.g., "Hotel Fácil Web") e clique em **"Registrar app"**.
5.  O Firebase irá gerar um objeto de configuração (`firebaseConfig`). Copie este objeto.
6.  No seu projeto React, cole este objeto no arquivo de configuração do Firebase (geralmente em `src/config/firebase.js` ou similar), para inicializar a conexão com o Firebase.

## Passo 6: Configurar Custom Claims para Multi-Tenancy

Para que as regras de segurança de multi-tenancy funcionem, é essencial que o `empresaId` seja adicionado como um "custom claim" ao token de autenticação do usuário no momento do login. Isso deve ser feito no seu backend ou usando o Firebase Cloud Functions.

Quando um usuário faz login, após validar suas credenciais, você deve usar o Admin SDK do Firebase para definir o `empresaId` no token dele. Exemplo de como fazer isso com uma Cloud Function:

```javascript
// Exemplo de uma Cloud Function para definir o custom claim após o login

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.setEmpresaClaim = functions.https.onCall(async (data, context) => {
  // Verifica se o usuário que chama a função é autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'A função só pode ser chamada por um usuário autenticado.');
  }

  const userId = context.auth.uid;
  const { empresaId } = data;

  try {
    // Define o custom claim no token do usuário
    await admin.auth().setCustomUserClaims(userId, { empresaId: empresaId });
    return { result: `Claim 'empresaId: ${empresaId}' adicionado para o usuário ${userId}.` };
  } catch (error) {
    console.error('Erro ao definir custom claim:', error);
    throw new functions.https.HttpsError('internal', 'Não foi possível definir o custom claim.');
  }
});
```

Este `empresaId` no token será então usado pelas regras de segurança do Firestore para garantir que o usuário só possa acessar os dados da empresa à qual ele pertence.

