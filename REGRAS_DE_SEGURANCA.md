# Regras de Segurança do Firestore para o Sistema Hotel Fácil

Este documento descreve as regras de segurança implementadas no Firebase Firestore para proteger os dados do sistema Hotel Fácil. As regras são projetadas para garantir que apenas usuários autenticados e autorizados possam acessar e modificar os dados, em conformidade com a arquitetura multi-tenant e o controle de acesso baseado em funções (RBAC).

## Estratégia de Segurança

A estratégia de segurança se baseia em três pilares principais:

1.  **Autenticação Obrigatória:** O acesso a qualquer dado do sistema (com exceção de possíveis dados públicos) exige que o usuário esteja autenticado via Firebase Authentication.
2.  **Isolamento de Dados por Empresa (Multi-tenancy):** As regras garantem que um usuário só possa acessar os dados pertencentes à empresa (`empresaId`) à qual ele está associado. Esse `empresaId` é incorporado ao token de autenticação do usuário no momento do login.
3.  **Controle de Acesso Baseado em Funções e Permissões (RBAC):** Dentro de uma empresa, o acesso a diferentes módulos (coleções) é controlado pela função do usuário (e.g., Administrador, Gerente) e por um conjunto de permissões booleanas associadas ao seu perfil.



## Funções de Apoio (Helpers)

Para simplificar e reutilizar a lógica de validação, foram criadas várias funções de apoio dentro do arquivo de regras:

| Função | Descrição |
|---|---|
| `isAuthenticated()` | Retorna `true` se o usuário que faz a requisição está autenticado. |
| `isOwner(userId)` | Verifica se o `uid` do usuário autenticado é o mesmo que o `userId` do documento que está sendo acessado. |
| `getUserData(empresaId)` | Uma função utilitária para obter o documento do usuário que está fazendo a requisição, para verificar suas permissões e função. |
| `belongsToCompany(empresaId)` | Garante que o usuário pertence à empresa cujos dados ele está tentando acessar, comparando o `empresaId` da URL com o `empresaId` no token de autenticação. |
| `hasRole(empresaId, role)` | Verifica se o usuário tem uma função específica (e.g., 'Administrador'). |
| `hasPermission(empresaId, permission)` | Verifica se o usuário tem uma permissão específica para um módulo (e.g., 'vendas'). |
| `isAdmin(empresaId)` | Uma abreviação para `hasRole(empresaId, 'Administrador')`. |
| `isManager(empresaId)` | Uma abreviação para `hasRole(empresaId, 'Gerente')`. |
| `isNotUpdatingAuditFields()` | Impede a modificação dos campos de auditoria `criado_em` e `criado_por` após a criação do documento. |
| `isUpdatingTimestamp()` | Garante que o campo `atualizado_em` seja sempre atualizado com o carimbo de data/hora do servidor. |



## Regras de Acesso por Coleção

A seguir, um detalhamento das regras de acesso para cada uma das principais coleções do sistema. Todas as regras estão contidas dentro do `match /empresas/{empresaId}` para garantir o isolamento dos dados.

### `dados_empresa`

- **Leitura (`read`):** Permitida para qualquer usuário que pertença à empresa.
- **Escrita (`write`):** Permitida apenas para usuários com a função de **Administrador**.

### `quartos`

- **Leitura (`read`):** Permitida para usuários com a permissão `disponibilidade` ou `quartos`.
- **Criação (`create`) e Atualização (`update`):** Permitida apenas para usuários com a permissão `quartos`.
- **Exclusão (`delete`):** Permitida apenas para **Administradores**.

### `hospedes`

- **Leitura, Criação e Atualização (`read`, `create`, `update`):** Permitidas para usuários com a permissão `vendas`.
- **Exclusão (`delete`):** Permitida para **Gerentes** e **Administradores**.

### `reservas`

- **Leitura (`read`):** Permitida para usuários com a permissão `vendas` ou `dashboard`.
- **Criação e Atualização (`create`, `update`):** Permitidas para usuários com a permissão `vendas`.
- **Exclusão (`delete`):** Permitida para **Gerentes** e **Administradores**.

### `contratos_corporativos`

- **Leitura, Criação e Atualização (`read`, `create`, `update`):** Permitidas para usuários com a permissão `faturas`.
- **Exclusão (`delete`):** Permitida apenas para **Administradores**.

### `faturas`

- **Leitura (`read`):** Permitida para usuários com a permissão `faturas` ou `fluxo_caixa`.
- **Criação e Atualização (`create`, `update`):** Permitidas para usuários com a permissão `faturas`.
- **Exclusão (`delete`):** Permitida apenas para **Administradores**.

### `despesas`

- **Leitura (`read`):** Permitida para usuários com a permissão `despesas` ou `fluxo_caixa`.
- **Criação e Atualização (`create`, `update`):** Permitidas para usuários com a permissão `despesas`.
- **Exclusão (`delete`):** Permitida para **Gerentes** e **Administradores**.

### `fluxo_caixa`

- **Leitura (`read`):** Permitida para usuários com a permissão `fluxo_caixa` ou `dashboard`.
- **Criação (`create`):** Permitida para usuários com a permissão `fluxo_caixa`.
- **Atualização (`update`) e Exclusão (`delete`):** Permitidas apenas para **Administradores**.

### `usuarios`

- **Leitura (`read`):** Um usuário pode ler seus próprios dados. Usuários com a permissão `usuarios` podem ler os dados de qualquer usuário da empresa.
- **Criação (`create`):** Permitida apenas para usuários com a permissão `usuarios`.
- **Atualização (`update`):** Um usuário pode atualizar seus próprios dados, exceto sua função e permissões. Usuários com a permissão `usuarios` podem atualizar qualquer campo de qualquer usuário.
- **Exclusão (`delete`):** Permitida apenas para **Administradores**, que não podem excluir a si mesmos.

### `configuracoes_hotel`

- **Leitura (`read`):** Permitida para qualquer usuário que pertença à empresa.
- **Escrita (`write`):** Permitida apenas para **Administradores**.

