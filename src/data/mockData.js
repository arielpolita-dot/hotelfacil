// Dados mock para desenvolvimento do sistema hoteleiro

// Quartos do hotel
export const quartos = [
  { id: '101', numero: '101', tipo: 'standard', caracteristicas: ['Ar condicionado'], status: 'disponivel', preco: 150 },
  { id: '102', numero: '102', tipo: 'standard', caracteristicas: ['Ar condicionado'], status: 'disponivel', preco: 150 },
  { id: '103', numero: '103', tipo: 'standard', caracteristicas: ['Ar condicionado'], status: 'ocupado', preco: 150 },
  { id: '104', numero: '104', tipo: 'standard', caracteristicas: ['Ar condicionado'], status: 'disponivel', preco: 150 },
  { id: '105', numero: '105', tipo: 'standard', caracteristicas: ['Ar condicionado'], status: 'disponivel', preco: 150 },
  { id: '106', numero: '106', tipo: 'standard', caracteristicas: ['Ar condicionado'], status: 'disponivel', preco: 150 },
  { id: '107', numero: '107', tipo: 'standard', caracteristicas: ['Ar condicionado'], status: 'disponivel', preco: 150 },
  { id: '108', numero: '108', tipo: 'standard', caracteristicas: ['Ar condicionado'], status: 'ocupado', preco: 150 },
  { id: '109', numero: '109', tipo: 'standard', caracteristicas: ['Ar condicionado'], status: 'disponivel', preco: 150 },
  { id: '110', numero: '110', tipo: 'standard', caracteristicas: ['Ventilador'], status: 'disponivel', preco: 120 },
  
  { id: '201', numero: '201', tipo: 'deluxe', caracteristicas: ['Ar condicionado'], status: 'ocupado', preco: 250 },
  { id: '202', numero: '202', tipo: 'deluxe', caracteristicas: ['Ar condicionado'], status: 'ocupado', preco: 250 },
  { id: '203', numero: '203', tipo: 'deluxe', caracteristicas: ['Ar condicionado'], status: 'ocupado', preco: 250 },
  { id: '204', numero: '204', tipo: 'deluxe', caracteristicas: ['Ar condicionado'], status: 'disponivel', preco: 250 },
  { id: '205', numero: '205', tipo: 'deluxe', caracteristicas: ['Ar condicionado'], status: 'ocupado', preco: 250 },
  { id: '206', numero: '206', tipo: 'deluxe', caracteristicas: ['Ar condicionado'], status: 'ocupado', preco: 250 },
  { id: '207', numero: '207', tipo: 'deluxe', caracteristicas: ['Ar condicionado'], status: 'ocupado', preco: 250 },
  { id: '208', numero: '208', tipo: 'standard', caracteristicas: ['Ar condicionado'], status: 'ocupado', preco: 150 },
  { id: '209', numero: '209', tipo: 'standard', caracteristicas: ['Ar condicionado'], status: 'ocupado', preco: 150 },
  { id: '210', numero: '210', tipo: 'standard', caracteristicas: ['Ar condicionado'], status: 'disponivel', preco: 150 },
  { id: '211', numero: '211', tipo: 'triplo', caracteristicas: ['Ar condicionado'], status: 'ocupado', preco: 300 },
];

// Gerar dados de disponibilidade para os próximos 30 dias
export const gerarDisponibilidade = () => {
  const hoje = new Date();
  const disponibilidade = {};
  
  for (let i = 0; i < 30; i++) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() + i);
    const dataStr = data.toISOString().split('T')[0];
    
    disponibilidade[dataStr] = {};
    
    quartos.forEach(quarto => {
      // Simular ocupação aleatória baseada no status atual
      let status = 'disponivel';
      
      if (quarto.status === 'ocupado') {
        // Quartos ocupados têm 70% de chance de continuar ocupados
        status = Math.random() > 0.3 ? 'ocupado' : 'disponivel';
      } else {
        // Quartos disponíveis têm 20% de chance de ficarem ocupados
        status = Math.random() > 0.8 ? 'ocupado' : 'disponivel';
      }
      
      // Adicionar algumas reservas duplas aleatoriamente
      if (status === 'ocupado' && Math.random() > 0.9) {
        status = 'reserva_dupla';
      }
      
      disponibilidade[dataStr][quarto.id] = status;
    });
  }
  
  return disponibilidade;
};

// Reservas de exemplo
export const reservas = [
  {
    id: 'res001',
    quartoId: '103',
    hospede: {
      id: 'hosp001',
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      documento: '123.456.789-00'
    },
    dataCheckIn: new Date('2025-10-11'),
    dataCheckOut: new Date('2025-10-15'),
    status: 'em_andamento',
    valor: 600,
    dataCriacao: new Date('2025-10-08')
  },
  {
    id: 'res002',
    quartoId: '201',
    hospede: {
      id: 'hosp002',
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '(11) 88888-8888',
      documento: '987.654.321-00'
    },
    dataCheckIn: new Date('2025-10-10'),
    dataCheckOut: new Date('2025-10-14'),
    status: 'em_andamento',
    valor: 1000,
    dataCriacao: new Date('2025-10-07')
  }
];

// Despesas de exemplo
export const despesas = [
  {
    id: 'desp001',
    categoria: 'Limpeza',
    descricao: 'Produtos de limpeza e higiene',
    valor: 450.00,
    data: new Date('2025-10-01'),
    tipo: 'variavel',
    responsavel: 'Administração'
  },
  {
    id: 'desp002',
    categoria: 'Energia',
    descricao: 'Conta de energia elétrica',
    valor: 1200.00,
    data: new Date('2025-10-05'),
    tipo: 'fixa',
    responsavel: 'Administração'
  },
  {
    id: 'desp003',
    categoria: 'Manutenção',
    descricao: 'Reparo ar condicionado quarto 205',
    valor: 350.00,
    data: new Date('2025-10-08'),
    tipo: 'variavel',
    responsavel: 'Manutenção'
  }
];

// Dados de fluxo de caixa
export const fluxoCaixa = [
  {
    id: 'fc001',
    tipo: 'entrada',
    valor: 600.00,
    descricao: 'Reserva quarto 103 - João Silva',
    data: new Date('2025-10-11'),
    categoria: 'Hospedagem',
    origem: 'res001'
  },
  {
    id: 'fc002',
    tipo: 'entrada',
    valor: 1000.00,
    descricao: 'Reserva quarto 201 - Maria Santos',
    data: new Date('2025-10-10'),
    categoria: 'Hospedagem',
    origem: 'res002'
  },
  {
    id: 'fc003',
    tipo: 'saida',
    valor: 450.00,
    descricao: 'Produtos de limpeza e higiene',
    data: new Date('2025-10-01'),
    categoria: 'Limpeza',
    origem: 'desp001'
  },
  {
    id: 'fc004',
    tipo: 'saida',
    valor: 1200.00,
    descricao: 'Conta de energia elétrica',
    data: new Date('2025-10-05'),
    categoria: 'Energia',
    origem: 'desp002'
  }
];

// Função para calcular taxa de ocupação por data
export const calcularTaxaOcupacao = (data, disponibilidadeData) => {
  const dataStr = data.toISOString().split('T')[0];
  const statusQuartos = disponibilidadeData[dataStr];
  
  if (!statusQuartos) return 0;
  
  const totalQuartos = Object.keys(statusQuartos).length;
  const quartosOcupados = Object.values(statusQuartos).filter(
    status => status === 'ocupado' || status === 'reserva_dupla'
  ).length;
  
  return Math.round((quartosOcupados / totalQuartos) * 100);
};

// Cores para os tipos de quarto (baseado no layout)
export const coresQuartos = {
  standard: '#10b981', // Verde
  deluxe: '#ef4444',   // Vermelho
  triplo: '#3b82f6'    // Azul
};

// Cores para status de disponibilidade
export const coresStatus = {
  disponivel: '#10b981',      // Verde
  ocupado: '#ef4444',         // Vermelho
  reserva_dupla: '#eab308',   // Amarelo
  manutencao: '#6b7280'       // Cinza
};
