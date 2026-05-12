// Static fixtures used by the demo seed generator.
// Names, addresses, hotel-themed content for realistic Brazilian demo data.

export const NOMES_HOSPEDES = [
  'Joao Pereira', 'Maria Silva', 'Carlos Oliveira', 'Ana Costa',
  'Pedro Souza', 'Beatriz Almeida', 'Rafael Santos', 'Juliana Lima',
  'Fernando Carvalho', 'Camila Rodrigues', 'Bruno Martins', 'Larissa Ferreira',
  'Andre Ribeiro', 'Tatiana Gomes', 'Marcelo Barbosa', 'Renata Cardoso',
  'Eduardo Lima', 'Patricia Mendes', 'Gustavo Araujo', 'Sandra Pinto',
  'Ricardo Tavares', 'Vanessa Rocha', 'Felipe Moura', 'Carolina Dias',
  'Leonardo Cunha', 'Aline Freitas', 'Diego Cavalcanti', 'Bianca Nogueira',
  'Roberto Macedo', 'Daniela Vieira', 'Thiago Monteiro', 'Mariana Costa',
  'Henrique Antunes', 'Priscila Borges', 'Vinicius Andrade', 'Cristina Reis',
  'Lucas Magalhaes', 'Fernanda Salgado', 'Igor Teixeira', 'Roberta Coelho',
  'Otavio Bezerra', 'Simone Castro', 'Daniel Aguiar', 'Natalia Brito',
  'Murilo Pacheco', 'Adriana Siqueira', 'Caio Vasconcelos', 'Helena Maia',
  'Rodrigo Camargo', 'Luciana Marinho', 'Alexandre Pessoa', 'Isabela Duarte',
  'Mateus Lopes', 'Carla Negri', 'Sergio Bittencourt', 'Vivian Prado',
  'Joao Vitor Aleixo', 'Amanda Fontes', 'Pedro Henrique Romanini', 'Gabriela Iturra',
];

export const EMPRESAS_CORPORATIVAS = [
  { nome: 'Logistica Sul Express LTDA', cnpj: '12.345.678/0001-90' },
  { nome: 'TechBR Consultoria SA', cnpj: '23.456.789/0001-12' },
  { nome: 'Construtora Marinheiros LTDA', cnpj: '34.567.890/0001-34' },
  { nome: 'Petroquimica Vale Verde', cnpj: '45.678.901/0001-56' },
  { nome: 'Cooperativa Agro Sao Pedro', cnpj: '56.789.012/0001-78' },
  { nome: 'Grupo Hospitalar Esperanca', cnpj: '67.890.123/0001-90' },
  { nome: 'Industria Metalurgica Andrade', cnpj: '78.901.234/0001-12' },
  { nome: 'Banco Regional Cooperativo', cnpj: '89.012.345/0001-34' },
];

export const FORNECEDORES_HOTEL = [
  { nome: 'Lavanderia Brilho Total', cnpj: '11.222.333/0001-44', tipo: 'PJ', cidade: 'Porto Alegre', estado: 'RS' },
  { nome: 'Padaria Manha Cedo', cnpj: '22.333.444/0001-55', tipo: 'PJ', cidade: 'Porto Alegre', estado: 'RS' },
  { nome: 'Distribuidora de Bebidas Centro', cnpj: '33.444.555/0001-66', tipo: 'PJ', cidade: 'Canoas', estado: 'RS' },
  { nome: 'Hortifruti Boa Safra', cnpj: '44.555.666/0001-77', tipo: 'PJ', cidade: 'Caxias do Sul', estado: 'RS' },
  { nome: 'Manutencao Predial Silva', cpf: '123.456.789-00', tipo: 'PF', cidade: 'Porto Alegre', estado: 'RS' },
  { nome: 'Net Cabo Comunicacoes', cnpj: '55.666.777/0001-88', tipo: 'PJ', cidade: 'Sao Paulo', estado: 'SP' },
  { nome: 'Limpeza Total Servicos', cnpj: '66.777.888/0001-99', tipo: 'PJ', cidade: 'Porto Alegre', estado: 'RS' },
  { nome: 'Frigorifico Bom Boi LTDA', cnpj: '77.888.999/0001-00', tipo: 'PJ', cidade: 'Pelotas', estado: 'RS' },
];

export const QUARTOS_HOTEL = [
  { numero: 101, tipo: 'standard', andar: 1, capacidade: 2, preco: 180, status: 'disponivel', descricao: 'Quarto standard com cama de casal, ar condicionado e frigobar', caracteristicas: ['ar_condicionado', 'wifi', 'tv', 'frigobar'] },
  { numero: 102, tipo: 'standard', andar: 1, capacidade: 2, preco: 180, status: 'ocupado', descricao: 'Quarto standard com cama de casal, ar condicionado e frigobar', caracteristicas: ['ar_condicionado', 'wifi', 'tv', 'frigobar'] },
  { numero: 103, tipo: 'standard', andar: 1, capacidade: 2, preco: 180, status: 'limpeza', descricao: 'Quarto standard com cama de casal, ar condicionado e frigobar', caracteristicas: ['ar_condicionado', 'wifi', 'tv', 'frigobar'] },
  { numero: 104, tipo: 'standard', andar: 1, capacidade: 2, preco: 180, status: 'disponivel', descricao: 'Quarto standard com cama de casal, ar condicionado e frigobar', caracteristicas: ['ar_condicionado', 'wifi', 'tv', 'frigobar'] },
  { numero: 105, tipo: 'triplo', andar: 1, capacidade: 3, preco: 230, status: 'ocupado', descricao: 'Quarto triplo com cama de casal e sofa-cama, vista jardim', caracteristicas: ['ar_condicionado', 'wifi', 'tv', 'frigobar', 'vista_jardim'] },
  { numero: 201, tipo: 'deluxe', andar: 2, capacidade: 2, preco: 280, status: 'disponivel', descricao: 'Quarto deluxe com cama queen, varanda privativa e cofre', caracteristicas: ['ar_condicionado', 'wifi', 'tv', 'frigobar', 'varanda', 'cofre'] },
  { numero: 202, tipo: 'deluxe', andar: 2, capacidade: 2, preco: 280, status: 'ocupado', descricao: 'Quarto deluxe com cama queen, varanda privativa e cofre', caracteristicas: ['ar_condicionado', 'wifi', 'tv', 'frigobar', 'varanda', 'cofre'] },
  { numero: 203, tipo: 'deluxe', andar: 2, capacidade: 2, preco: 280, status: 'disponivel', descricao: 'Quarto deluxe com cama queen, varanda privativa e cofre', caracteristicas: ['ar_condicionado', 'wifi', 'tv', 'frigobar', 'varanda', 'cofre'] },
  { numero: 204, tipo: 'deluxe', andar: 2, capacidade: 2, preco: 280, status: 'ocupado', descricao: 'Quarto deluxe com cama queen, varanda privativa e cofre', caracteristicas: ['ar_condicionado', 'wifi', 'tv', 'frigobar', 'varanda', 'cofre'] },
  { numero: 301, tipo: 'suite', andar: 3, capacidade: 4, preco: 420, status: 'disponivel', descricao: 'Suite com sala de estar, cama king-size e hidromassagem', caracteristicas: ['ar_condicionado', 'wifi', 'tv', 'frigobar', 'hidromassagem', 'sala_estar'] },
  { numero: 302, tipo: 'suite', andar: 3, capacidade: 4, preco: 420, status: 'manutencao', descricao: 'Suite em reforma - retorno previsto em 7 dias', caracteristicas: ['ar_condicionado', 'wifi', 'tv', 'frigobar', 'hidromassagem', 'sala_estar'] },
  { numero: 303, tipo: 'suite', andar: 3, capacidade: 4, preco: 580, status: 'ocupado', descricao: 'Suite presidencial com vista panoramica, cozinha e living', caracteristicas: ['ar_condicionado', 'wifi', 'tv', 'frigobar', 'hidromassagem', 'cozinha', 'living', 'vista_panoramica'] },
];

export const USUARIOS_EQUIPE = [
  { nome: 'Mariana Recepcao', email: 'recepcao@efixconsultoria.demo', telefone: '(51) 99100-2001', role: 'Recepcionista', perms: { dashboard: true, disponibilidade: true, quartos: false, vendas: true, faturas: false, despesas: false, fluxo_caixa: false, usuarios: false, configuracoes: false } },
  { nome: 'Felipe Recepcao', email: 'recepcao2@efixconsultoria.demo', telefone: '(51) 99100-2002', role: 'Recepcionista', perms: { dashboard: true, disponibilidade: true, quartos: false, vendas: true, faturas: false, despesas: false, fluxo_caixa: false, usuarios: false, configuracoes: false } },
  { nome: 'Carla Gerencia', email: 'gerencia@efixconsultoria.demo', telefone: '(51) 99100-2003', role: 'Gerente', perms: { dashboard: true, disponibilidade: true, quartos: true, vendas: true, faturas: true, despesas: true, fluxo_caixa: true, usuarios: false, configuracoes: false } },
  { nome: 'Roberto Financeiro', email: 'financeiro@efixconsultoria.demo', telefone: '(51) 99100-2004', role: 'Financeiro', perms: { dashboard: true, disponibilidade: false, quartos: false, vendas: false, faturas: true, despesas: true, fluxo_caixa: true, usuarios: false, configuracoes: false } },
  { nome: 'Lucia Camareira', email: 'camareira@efixconsultoria.demo', telefone: '(51) 99100-2005', role: 'Recepcionista', perms: { dashboard: true, disponibilidade: true, quartos: false, vendas: false, faturas: false, despesas: false, fluxo_caixa: false, usuarios: false, configuracoes: false } },
  { nome: 'Joao Manutencao', email: 'manutencao@efixconsultoria.demo', telefone: '(51) 99100-2006', role: 'Manutencao', perms: { dashboard: true, disponibilidade: true, quartos: true, vendas: false, faturas: false, despesas: false, fluxo_caixa: false, usuarios: false, configuracoes: false } },
];

export const CATEGORIAS_DESPESA = [
  'Alimentacao', 'Limpeza', 'Manutencao', 'Pessoal',
  'Marketing', 'Utilidades', 'Administrativo', 'Outros',
];

export const DESCRICOES_DESPESA: Record<string, string[]> = {
  Alimentacao: ['Compra de hortifruti semanal', 'Reposicao de cafe da manha', 'Frigorifico - carnes e frios', 'Padaria - paes e bolos', 'Bebidas para frigobar'],
  Limpeza: ['Lavanderia semanal de enxoval', 'Produtos de limpeza geral', 'Servico de limpeza terceirizada', 'Compra de toalhas novas', 'Higienizacao de piscina'],
  Manutencao: ['Reparo de ar condicionado quarto 201', 'Pintura corredor 2o andar', 'Troca de chuveiro suite 301', 'Manutencao predial mensal', 'Servico de jardinagem'],
  Pessoal: ['Folha de pagamento - recepcao', 'Folha de pagamento - camareiras', 'Pagamento INSS', 'Pagamento FGTS', 'Vale alimentacao funcionarios'],
  Marketing: ['Anuncios Booking.com', 'Anuncios Google', 'Material grafico (cartoes)', 'Sessao fotografica do hotel', 'Investimento em site'],
  Utilidades: ['Conta de energia eletrica', 'Conta de agua e esgoto', 'Conta de telefone', 'Internet banda larga', 'Gas para cozinha'],
  Administrativo: ['Honorarios contabeis', 'Taxa de licenca municipal', 'Software de gestao mensalidade', 'Material de escritorio', 'Cartorio - reconhecimento'],
  Outros: ['Comissao agencia de viagem', 'Pagamento de fornecedor avulso', 'Reposicao de itens diversos', 'Pagamento de impostos diversos', 'Despesa nao categorizada'],
};

export const METODOS_PAGAMENTO = ['pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'transferencia'];
export const FORMAS_PAGAMENTO_RESERVA = ['pix', 'cartao_credito', 'cartao_debito', 'dinheiro', 'faturado', 'a_definir'];
