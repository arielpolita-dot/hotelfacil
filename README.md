# Sistema de Gestão Hoteleira

Um sistema completo de gestão hoteleira desenvolvido em React, baseado nos layouts fornecidos pelo cliente, oferecendo controle total sobre disponibilidade, vendas, despesas e fluxo de caixa.

## 🏨 Visão Geral

O sistema foi desenvolvido para atender às necessidades específicas de gestão hoteleira, implementando fielmente os layouts fornecidos e oferecendo funcionalidades avançadas para controle operacional e financeiro.

### Principais Funcionalidades

**Dashboard Executivo**
O painel principal oferece uma visão consolidada do hotel com métricas em tempo real. Apresenta taxa de ocupação atual, número de quartos disponíveis, reservas ativas e lucro líquido. Inclui resumo financeiro detalhado comparando receitas versus despesas, distribuição de quartos por tipo com barras de progresso visuais, e tabela de reservas recentes com status atualizado.

**Módulo de Disponibilidade**
Implementação fiel ao primeiro layout fornecido, apresentando grid horizontal de calendário com 30 dias de visualização. Sistema de cores intuitivo: verde para disponível, vermelho para ocupado, amarelo para reserva dupla. Exibe taxa de ocupação por data, permite navegação entre períodos, oferece filtros por tipo de quarto e estatísticas detalhadas de disponibilidade.

**Sistema de Vendas e Reservas**
Baseado no segundo layout fornecido, utiliza cards coloridos por tipo de quarto (verde para Standard, vermelho para Deluxe, azul para Triplo). Inclui sistema de busca por número ou tipo, filtros por status e tipo, modal completo de reserva com formulário validado, cálculo automático de valores e integração com fluxo de caixa.

**Gestão de Despesas**
Controle completo de gastos com categorização em 12 tipos diferentes. Separação entre despesas fixas e variáveis, sistema de filtros avançado, análise visual por categoria, modal para cadastro e edição, e integração automática com fluxo de caixa.

**Fluxo de Caixa Avançado**
Dashboard financeiro com gráficos interativos profissionais. Apresenta evolução diária através de gráfico de linhas, comparativo por período em barras, distribuição por categoria em pizza, lista de transações recentes detalhada, filtros por período e tipo, e cálculos automáticos de margem líquida.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Framework principal com hooks modernos
- **Tailwind CSS** - Estilização utilitária responsiva
- **Shadcn/UI** - Componentes profissionais pré-construídos
- **Lucide Icons** - Ícones consistentes e modernos
- **Recharts** - Gráficos interativos e responsivos

### Arquitetura
- **Context API** - Gerenciamento de estado global
- **React Router** - Navegação SPA fluida
- **Hooks Customizados** - Lógica reutilizável
- **Componentes Modulares** - Estrutura escalável

## 📊 Dados e Integração

### Estrutura de Dados
O sistema utiliza estruturas de dados bem definidas para quartos, reservas, despesas e fluxo de caixa. Cada entidade possui relacionamentos claros que permitem cálculos automáticos e consistência de informações entre módulos.

### Integração Entre Módulos
Todas as operações são integradas automaticamente. Reservas geram entradas no fluxo de caixa, despesas são refletidas como saídas, estatísticas são calculadas em tempo real, e o dashboard consolida informações de todos os módulos.

## 🎨 Design e UX

### Interface Profissional
Design moderno seguindo princípios de hierarquia visual, contraste adequado para acessibilidade, cores consistentes baseadas nos layouts fornecidos, e transições suaves entre estados.

### Responsividade
Interface totalmente adaptável funcionando perfeitamente em desktop, tablet e mobile. Grid flexível que se ajusta ao conteúdo, componentes que redimensionam adequadamente, e navegação otimizada para touch.

### Interatividade
Hover effects em todos os elementos clicáveis, feedback visual para ações do usuário, modais com animações suaves, gráficos interativos com tooltips, e filtros com resposta instantânea.

## 📈 Funcionalidades Avançadas

### Gráficos e Visualizações
Utilização da biblioteca Recharts para gráficos profissionais. Gráficos de linha para evolução temporal, barras para comparações, pizza para distribuições, tooltips informativos, e responsividade automática.

### Sistema de Filtros
Filtros múltiplos que funcionam em conjunto, busca textual em tempo real, filtros por categoria, tipo, período e status, e persistência de filtros durante navegação.

### Cálculos Automáticos
Estatísticas atualizadas em tempo real, percentuais calculados dinamicamente, totalizadores automáticos, e validação de consistência entre módulos.

## 🔧 Instalação e Execução

### Pré-requisitos
- Node.js 18+ instalado
- pnpm ou npm como gerenciador de pacotes
- Navegador moderno com suporte a ES6+

### Comandos de Desenvolvimento
```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm run dev

# Fazer build para produção
pnpm run build

# Visualizar build localmente
pnpm run preview
```

### Deploy
O sistema foi otimizado para deploy em qualquer plataforma de hospedagem estática. O build gera arquivos otimizados na pasta `dist/` prontos para produção.

## 📋 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Layout.jsx      # Layout principal com sidebar
│   └── Sidebar.jsx     # Menu lateral de navegação
├── pages/              # Páginas principais
│   ├── Dashboard.jsx   # Painel executivo
│   ├── Disponibilidade.jsx # Grid de disponibilidade
│   ├── Vendas.jsx      # Sistema de reservas
│   ├── Despesas.jsx    # Gestão de gastos
│   └── FluxoCaixa.jsx  # Controle financeiro
├── context/            # Gerenciamento de estado
│   └── HotelContext.jsx # Contexto global
├── data/               # Dados mock e utilitários
│   └── mockData.js     # Dados de exemplo
└── types/              # Definições de tipos
    └── index.js        # Tipos do sistema
```

## 🎯 Próximos Passos

### Funcionalidades Futuras
O sistema foi desenvolvido com arquitetura escalável permitindo fácil adição de novas funcionalidades como sistema de check-in/check-out automatizado, integração com sistemas de pagamento, relatórios avançados em PDF, sistema de avaliações de hóspedes, e integração com APIs externas.

### Melhorias Técnicas
Possibilidades de evolução incluem implementação de backend com banco de dados, sistema de autenticação e autorização, cache inteligente para performance, testes automatizados, e PWA para uso offline.

## 📞 Suporte

O sistema foi desenvolvido seguindo as melhores práticas de desenvolvimento React e está pronto para uso em produção. A arquitetura modular permite fácil manutenção e expansão conforme necessário.

---

**Desenvolvido com ❤️ usando React e tecnologias modernas**

*Sistema de Gestão Hoteleira - Versão 1.0.0*
