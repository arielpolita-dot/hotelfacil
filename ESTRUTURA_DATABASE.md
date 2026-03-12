# Estrutura do Banco de Dados Firestore para o Sistema Hotel Fácil

Este documento detalha a arquitetura do banco de dados NoSQL utilizado no sistema Hotel Fácil, implementado com o Google Firebase Firestore. A estrutura foi projetada para ser escalável, segura e eficiente, suportando a arquitetura multi-tenant do sistema, onde cada empresa (hotel) possui seus dados isolados.

## Visão Geral

A estrutura de dados é organizada em torno de uma coleção principal chamada `empresas`. Cada documento nesta coleção representa uma empresa hoteleira distinta e contém todas as informações e sub-coleções relacionadas a essa empresa.



### Coleção `empresas`

- **Caminho:** `/empresas/{empresaId}`
- **Descrição:** Coleção raiz que armazena todas as empresas cadastradas no sistema. Cada documento representa uma empresa e serve como um contêiner para todos os dados específicos daquele hotel.

#### Sub-coleções de `empresas`

Dentro de cada documento de empresa, as seguintes sub-coleções são utilizadas para organizar os dados:

- `dados_empresa`: Informações cadastrais da empresa.
- `quartos`: Detalhes sobre os quartos do hotel.
- `hospedes`: Cadastro de hóspedes.
- `reservas`: Registros de todas as reservas.
- `contratos_corporativos`: Contratos com empresas para hospedagem de longo prazo.
- `faturas`: Faturas geradas para os contratos corporativos.
- `despesas`: Controle de despesas do hotel.
- `fluxo_caixa`: Histórico de entradas e saídas financeiras.
- `usuarios`: Contas de usuários que podem acessar o sistema para aquela empresa.
- `configuracoes_hotel`: Configurações específicas do hotel.



### Detalhamento das Sub-coleções

A seguir, uma descrição detalhada de cada sub-coleção e os campos que a compõem.

#### 1. `dados_empresa`

- **Caminho:** `/empresas/{empresaId}/dados_empresa/{docId}`
- **Descrição:** Armazena as informações cadastrais e de configuração da empresa hoteleira. Geralmente, haverá um único documento nesta sub-coleção.

| Campo | Tipo de Dados | Descrição |
|---|---|---|
| `nome` | `string` | O nome comercial do hotel. |
| `cnpj` | `string` | O Cadastro Nacional da Pessoa Jurídica (CNPJ) do hotel. |
| `endereco` | `map` | Um objeto contendo os detalhes do endereço do hotel. |
| `contato` | `map` | Um objeto com as informações de contato, como telefone e e-mail. |
| `configuracoes` | `map` | Configurações gerais da empresa, como moeda e fuso horário. |
| `auditoria` | `map` | Campos de controle para rastrear a criação e atualização do registro. |

#### 2. `quartos`

- **Caminho:** `/empresas/{empresaId}/quartos/{quartoId}`
- **Descrição:** Cada documento nesta coleção representa um quarto do hotel, com todas as suas características, status e informações de preço.

| Campo | Tipo de Dados | Descrição |
|---|---|---|
| `numero` | `number` | O número de identificação do quarto. |
| `tipo` | `string` | A categoria do quarto (e.g., Standard, Deluxe, Suíte). |
| `status` | `string` | O estado atual do quarto (e.g., Disponível, Ocupado, Em Limpeza). |
| `preco_diaria` | `number` | O valor da diária para o quarto. |
| `caracteristicas` | `map` | Um objeto booleano que lista as comodidades do quarto. |
| `imagens` | `array` | Uma lista de URLs para as fotos do quarto. |
| `auditoria` | `map` | Campos de controle para rastrear a criação e atualização do registro. |



#### 3. `hospedes`

- **Caminho:** `/empresas/{empresaId}/hospedes/{hospedeId}`
- **Descrição:** Mantém um registro de todos os hóspedes que já se hospedaram no hotel, permitindo um acesso rápido ao seu histórico e preferências.

| Campo | Tipo de Dados | Descrição |
|---|---|---|
| `nome` | `string` | O nome completo do hóspede. |
| `email` | `string` | O endereço de e-mail do hóspede. |
| `documento` | `string` | O número do documento de identificação do hóspede. |
| `historico_reservas` | `array` | Uma lista de IDs de reservas anteriores do hóspede. |
| `auditoria` | `map` | Campos de controle para rastrear a criação e atualização do registro. |

#### 4. `reservas`

- **Caminho:** `/empresas/{empresaId}/reservas/{reservaId}`
- **Descrição:** Contém todas as informações sobre as reservas de quartos, incluindo detalhes do hóspede, datas, valores e status do pagamento.

| Campo | Tipo de Dados | Descrição |
|---|---|---|
| `hospedeId` | `string` | A referência ao documento do hóspede na coleção `hospedes`. |
| `quartoId` | `string` | A referência ao quarto reservado na coleção `quartos`. |
| `data_checkin` | `timestamp` | A data e hora de início da reserva. |
| `data_checkout` | `timestamp` | A data e hora de término da reserva. |
| `valor_total` | `number` | O custo total da estadia. |
| `status` | `string` | O estado atual da reserva (e.g., Confirmada, Em Andamento, Finalizada, Cancelada). |
| `pagamento` | `map` | Um objeto com os detalhes do pagamento da reserva. |
| `auditoria` | `map` | Campos de controle para rastrear a criação e atualização do registro. |

#### 5. `contratos_corporativos`

- **Caminho:** `/empresas/{empresaId}/contratos_corporativos/{contratoId}`
- **Descrição:** Armazena os contratos de longo prazo com empresas, detalhando os quartos alocados, valores e condições de faturamento.

| Campo | Tipo de Dados | Descrição |
|---|---|---|
| `empresa_cliente` | `map` | Um objeto com os dados da empresa cliente. |
| `data_inicio` | `timestamp` | A data de início do contrato. |
| `data_fim` | `timestamp` | A data de término do contrato. |
| `valor_mensal` | `number` | O valor a ser pago mensalmente pela empresa. |
| `quartos_alocados` | `array` | Uma lista de IDs dos quartos que fazem parte do contrato. |
| `status` | `string` | O estado atual do contrato (e.g., Ativo, Inativo, Finalizado). |
| `auditoria` | `map` | Campos de controle para rastrear a criação e atualização do registro. |



#### 6. `faturas`

- **Caminho:** `/empresas/{empresaId}/faturas/{faturaId}`
- **Descrição:** Registra as faturas geradas a partir dos contratos corporativos, incluindo seus itens, valores e status de pagamento.

| Campo | Tipo de Dados | Descrição |
|---|---|---|
| `contratoId` | `string` | A referência ao contrato na coleção `contratos_corporativos`. |
| `numero_fatura` | `string` | O número de identificação único da fatura. |
| `valor` | `number` | O valor total da fatura. |
| `data_vencimento` | `timestamp` | A data limite para o pagamento da fatura. |
| `status` | `string` | O estado atual da fatura (e.g., Pendente, Paga, Vencida). |
| `itens` | `array` | Uma lista de objetos, cada um descrevendo um item da fatura. |
| `auditoria` | `map` | Campos de controle para rastrear a criação e atualização do registro. |

#### 7. `despesas`

- **Caminho:** `/empresas/{empresaId}/despesas/{despesaId}`
- **Descrição:** Permite o registro e controle de todas as despesas do hotel, sejam elas fixas ou variáveis.

| Campo | Tipo de Dados | Descrição |
|---|---|---|
| `categoria` | `string` | A categoria da despesa (e.g., Salários, Manutenção, Marketing). |
| `descricao` | `string` | Uma breve descrição da despesa. |
| `valor` | `number` | O montante da despesa. |
| `data_despesa` | `timestamp` | A data em que a despesa ocorreu. |
| `tipo` | `string` | O tipo de despesa (e.g., Fixa, Variável). |
| `status` | `string` | O estado do pagamento da despesa (e.g., Paga, Pendente). |
| `auditoria` | `map` | Campos de controle para rastrear a criação e atualização do registro. |

#### 8. `fluxo_caixa`

- **Caminho:** `/empresas/{empresaId}/fluxo_caixa/{transacaoId}`
- **Descrição:** Consolida todas as transações financeiras, tanto entradas (receitas de reservas) quanto saídas (pagamento de despesas), para fornecer uma visão clara da saúde financeira do hotel.

| Campo | Tipo de Dados | Descrição |
|---|---|---|
| `tipo` | `string` | O tipo de transação ('Entrada' ou 'Saída'). |
| `categoria` | `string` | A categoria da transação (e.g., Hospedagem, Alimentação, Salários). |
| `descricao` | `string` | Uma descrição detalhada da transação. |
| `valor` | `number` | O valor da transação. |
| `data_transacao` | `timestamp` | A data em que a transação foi registrada. |
| `origem_id` | `string` | O ID do documento de origem (e.g., `reservaId` ou `despesaId`). |
| `auditoria` | `map` | Campos de controle para rastrear a criação e atualização do registro. |



#### 9. `usuarios`

- **Caminho:** `/empresas/{empresaId}/usuarios/{userId}`
- **Descrição:** Gerencia os usuários que têm acesso ao sistema para uma determinada empresa. O `userId` corresponde ao UID fornecido pelo Firebase Authentication.

| Campo | Tipo de Dados | Descrição |
|---|---|---|
| `dados_pessoais` | `map` | Um objeto com as informações pessoais do usuário. |
| `acesso` | `map` | Detalhes sobre a função, status e último login do usuário. |
| `permissoes` | `map` | Um objeto booleano que define o acesso do usuário a cada módulo do sistema. |
| `auditoria` | `map` | Campos de controle para rastrear a criação e atualização do registro. |

#### 10. `configuracoes_hotel`

- **Caminho:** `/empresas/{empresaId}/configuracoes_hotel/{configId}`
- **Descrição:** Armazena configurações operacionais específicas do hotel, como horários de check-in/check-out e políticas de cancelamento.

| Campo | Tipo de Dados | Descrição |
|---|---|---|
| `checkin_horario` | `string` | O horário padrão para o check-in dos hóspedes. |
| `checkout_horario` | `string` | O horário padrão para o check-out dos hóspedes. |
| `politica_cancelamento` | `string` | O texto que descreve a política de cancelamento do hotel. |
| `taxas_servico` | `number` | A porcentagem da taxa de serviço cobrada pelo hotel. |
| `taxas_turismo` | `number` | O valor da taxa de turismo, se aplicável. |

