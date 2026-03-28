export enum StatusPagamentoEmpresa {
  TRIAL = 'trial',
  EXPIRADO = 'expirado',
  PAGO = 'pago',
}

export enum RoleUsuario {
  ADMIN = 'Admin',
  GERENTE = 'Gerente',
  RECEPCIONISTA = 'Recepcionista',
  FINANCEIRO = 'Financeiro',
  MANUTENCAO = 'Manutencao',
}

export enum StatusUsuario {
  ATIVO = 'Ativo',
  INATIVO = 'Inativo',
  SUSPENSO = 'Suspenso',
}

export enum TipoQuarto {
  STANDARD = 'standard',
  DELUXE = 'deluxe',
  SUITE = 'suite',
  TRIPLO = 'triplo',
}

export enum StatusQuarto {
  DISPONIVEL = 'disponivel',
  OCUPADO = 'ocupado',
  LIMPEZA = 'limpeza',
  MANUTENCAO = 'manutencao',
}

export enum FormaPagamento {
  A_DEFINIR = 'a_definir',
  DINHEIRO = 'dinheiro',
  PIX = 'pix',
  CARTAO_CREDITO = 'cartao_credito',
  CARTAO_DEBITO = 'cartao_debito',
  TRANSFERENCIA = 'transferencia',
  CHEQUE = 'cheque',
  FATURADO = 'faturado',
}

export enum StatusReserva {
  CONFIRMADA = 'confirmada',
  CHECKIN = 'checkin',
  CHECKOUT = 'checkout',
  CONCLUIDA = 'concluida',
  CANCELADA = 'cancelada',
}

export enum CategoriaDespesa {
  ALIMENTACAO = 'Alimentacao',
  LIMPEZA = 'Limpeza',
  MANUTENCAO = 'Manutencao',
  PESSOAL = 'Pessoal',
  MARKETING = 'Marketing',
  UTILIDADES = 'Utilidades',
  ADMINISTRATIVO = 'Administrativo',
  OUTROS = 'Outros',
}

export enum StatusDespesa {
  PENDENTE = 'pendente',
  PAGO = 'pago',
  CANCELADO = 'cancelado',
}

export enum TipoFluxoCaixa {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
}

export enum TipoContrato {
  MENSAL = 'Mensal',
  TRIMESTRAL = 'Trimestral',
  SEMESTRAL = 'Semestral',
  ANUAL = 'Anual',
}

export enum PeriodicidadeFatura {
  QUINZENAL = 'Quinzenal',
  MENSAL = 'Mensal',
  BIMESTRAL = 'Bimestral',
  TRIMESTRAL = 'Trimestral',
}

export enum StatusFatura {
  ATIVO = 'Ativo',
  SUSPENSO = 'Suspenso',
  CANCELADO = 'Cancelado',
  VENCIDO = 'Vencido',
}
