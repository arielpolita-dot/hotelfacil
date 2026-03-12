# Guia do Usuário - Sistema de Gestão Hoteleira

## Introdução

Este guia apresenta como utilizar todas as funcionalidades do sistema de gestão hoteleira de forma eficiente e prática.

## Navegação Principal

### Menu Lateral
O sistema utiliza um menu lateral escuro com ícones intuitivos para navegação entre os módulos principais.

**Dashboard** - Visão geral com estatísticas consolidadas do hotel
**Disponibilidade** - Grid de calendário mostrando ocupação dos quartos
**Vendas** - Sistema de reservas com cards coloridos por tipo de quarto
**Despesas** - Controle de gastos com categorização detalhada
**Fluxo de Caixa** - Análise financeira com gráficos interativos

## Dashboard - Visão Geral

### Métricas Principais
O dashboard apresenta quatro cards principais com as métricas mais importantes do hotel.

**Taxa de Ocupação** mostra o percentual atual de quartos ocupados com indicador visual de tendência. **Quartos Disponíveis** exibe quantos quartos estão prontos para reserva. **Reservas Ativas** indica o número de hóspedes atualmente no hotel. **Lucro Líquido** apresenta o resultado financeiro atual com indicação de positivo ou negativo.

### Resumo Financeiro
A seção financeira compara receitas totais versus despesas totais, calculando automaticamente o lucro líquido. Os valores são atualizados em tempo real conforme novas reservas e despesas são registradas.

### Distribuição de Quartos
Gráfico de barras mostra a ocupação por tipo de quarto (Standard, Deluxe, Triplo) com percentuais visuais. Permite identificar rapidamente quais tipos estão mais ou menos ocupados.

### Reservas Recentes
Tabela com as reservas mais recentes mostrando hóspede, quarto, datas de check-in e check-out, status atual e valor. Status são identificados por cores: verde para "EM ANDAMENTO".

## Disponibilidade - Grid de Quartos

### Visualização do Calendário
O módulo apresenta um grid horizontal com 30 dias de visualização, idêntico ao layout fornecido. Cada célula representa um dia específico para cada quarto.

### Sistema de Cores
**Verde** indica quarto disponível para reserva. **Vermelho** mostra quarto ocupado. **Amarelo** representa reserva dupla ou situação especial.

### Navegação Temporal
Setas laterais permitem navegar entre diferentes períodos de 30 dias. O período atual é sempre exibido no cabeçalho.

### Estatísticas de Ocupação
Cards superiores mostram taxa de ocupação geral, número de quartos disponíveis, ocupados e reservas duplas. Taxa de ocupação por data é exibida na parte inferior do grid.

### Filtros Disponíveis
Filtro por tipo de quarto permite visualizar apenas Standard, Deluxe ou Triplo. Filtros são aplicados instantaneamente sem recarregar a página.

### Interatividade
Células do grid são clicáveis para demonstração. Em implementação futura, permitirão alterar status diretamente no calendário.

## Vendas - Sistema de Reservas

### Layout de Cards
Quartos são apresentados em cards coloridos baseados no segundo layout fornecido. **Verde** para quartos Standard, **Vermelho** para Deluxe, **Azul** para Triplo.

### Informações dos Quartos
Cada card mostra número do quarto, tipo, status atual, características (ar condicionado/ventilador), preço por diária e avaliação com estrelas.

### Sistema de Busca
Campo de busca permite encontrar quartos por número ou tipo. Busca funciona em tempo real conforme digitação.

### Filtros Avançados
**Filtro por Status** - Todos, Disponível, Ocupado, Manutenção
**Filtro por Tipo** - Todos, Standard, Deluxe, Triplo
Filtros podem ser combinados para busca mais específica.

### Processo de Reserva
Botão "Reservar" abre modal completo com formulário de reserva. Modal inclui informações do quarto selecionado, campos para dados do hóspede (nome, email, telefone, documento), seleção de datas com validação, campo de observações e cálculo automático do valor total.

### Validação de Dados
Formulário valida campos obrigatórios antes de permitir confirmação. Datas são validadas para evitar conflitos. Cálculo de valor é feito automaticamente baseado no número de diárias.

### Estatísticas de Vendas
Parte inferior mostra estatísticas atualizadas: quartos disponíveis, ocupados, reservas confirmadas e receita total.

## Despesas - Controle de Gastos

### Dashboard de Despesas
Quatro cards principais mostram total de despesas, despesas fixas, variáveis e despesas do mês atual. Percentuais são calculados automaticamente.

### Análise por Categoria
Gráfico visual mostra distribuição das despesas por categoria com percentuais. Permite identificar onde o hotel gasta mais recursos.

### Sistema de Filtros
**Busca Textual** - Por descrição, categoria ou responsável
**Filtro por Categoria** - 12 categorias disponíveis (Limpeza, Energia, Manutenção, etc.)
**Filtro por Tipo** - Fixa ou Variável

### Tabela de Despesas
Lista todas as despesas com data, categoria, descrição, tipo, responsável e valor. Badges coloridos identificam categorias e tipos. Botões de ação permitem editar ou excluir despesas.

### Cadastro de Despesas
Botão "Nova Despesa" abre modal com formulário completo. Campos incluem categoria (seleção), descrição, valor, data, tipo (fixa/variável) e responsável. Validação impede cadastro com campos obrigatórios vazios.

### Integração Automática
Despesas cadastradas são automaticamente incluídas no fluxo de caixa como saídas. Estatísticas são recalculadas em tempo real.

## Fluxo de Caixa - Controle Financeiro

### Métricas Financeiras
Quatro cards principais apresentam total de entradas, saídas, saldo líquido e margem líquida. Cores indicam situação: verde para positivo, vermelho para negativo.

### Gráficos Interativos
**Evolução Diária** - Gráfico de linha mostra entradas (verde), saídas (vermelho) e saldo (azul) ao longo do tempo
**Comparativo por Período** - Gráfico de barras compara entradas versus saídas por mês
**Distribuição por Categoria** - Gráfico de pizza mostra percentual por categoria

### Filtros de Análise
**Período** - Semana, Mês, Trimestre, Ano
**Tipo** - Todos, Entradas, Saídas
Filtros atualizam todos os gráficos e estatísticas simultaneamente.

### Transações Recentes
Lista detalhada das últimas transações com ícones coloridos (verde para entradas, vermelho para saídas). Cada transação mostra descrição, categoria, data, valor e tipo.

### Análise por Categoria
Seções separadas mostram entradas e saídas por categoria com valores totais. Permite identificar principais fontes de receita e maiores gastos.

### Exportação de Relatórios
Botão "Exportar" permite gerar relatórios dos dados filtrados. Funcionalidade preparada para implementação futura.

## Dicas de Uso

### Navegação Eficiente
Use o menu lateral para alternar rapidamente entre módulos. Estados de filtros são mantidos durante navegação. Volte ao dashboard para visão geral consolidada.

### Aproveitamento dos Filtros
Combine múltiplos filtros para análises específicas. Use busca textual para encontrar informações rapidamente. Filtros por período no fluxo de caixa permitem análises temporais detalhadas.

### Interpretação de Dados
Cores consistentes facilitam interpretação visual. Verde sempre indica positivo/disponível, vermelho indica negativo/ocupado. Gráficos incluem tooltips informativos ao passar o mouse.

### Melhores Práticas
Mantenha dados atualizados para estatísticas precisas. Use categorização consistente nas despesas. Monitore regularmente o fluxo de caixa para controle financeiro. Aproveite filtros para análises específicas por período ou categoria.

---

**Sistema de Gestão Hoteleira - Guia do Usuário v1.0**
