export const STATUS_CFG = {
  confirmada:   { label: 'Confirmada',  cls: 'bg-blue-100 text-blue-700' },
  'check-in':   { label: 'Check-in',   cls: 'bg-emerald-100 text-emerald-700' },
  checkin:      { label: 'Check-in',   cls: 'bg-emerald-100 text-emerald-700' },
  checkout:     { label: 'Check-out',  cls: 'bg-slate-100 text-slate-600' },
  'check-out':  { label: 'Check-out',  cls: 'bg-slate-100 text-slate-600' },
  cancelada:    { label: 'Cancelada',  cls: 'bg-red-100 text-red-700' },
};

/** Maps status keys to DS Badge variant names */
export const STATUS_BADGE_MAP = {
  confirmada:   { label: 'Confirmada',  variant: 'brand' },
  'check-in':   { label: 'Check-in',   variant: 'success' },
  checkin:      { label: 'Check-in',   variant: 'success' },
  checkout:     { label: 'Check-out',  variant: 'default' },
  'check-out':  { label: 'Check-out',  variant: 'default' },
  cancelada:    { label: 'Cancelada',  variant: 'danger' },
};

export const FORMAS_PAGAMENTO = [
  { value: 'a_definir',       label: 'A Definir' },
  { value: 'dinheiro',        label: 'Dinheiro' },
  { value: 'pix',             label: 'PIX' },
  { value: 'cartao_credito',  label: 'Cartao de Credito' },
  { value: 'cartao_debito',   label: 'Cartao de Debito' },
  { value: 'transferencia',   label: 'Transferencia Bancaria' },
  { value: 'cheque',          label: 'Cheque' },
  { value: 'faturado',        label: 'Faturado (Empresa)' },
];

export const EMPTY_FORM = {
  nomeHospede: '', email: '', telefone: '', cpf: '',
  quartoId: '', numeroQuarto: '',
  dataCheckIn: '', dataCheckOut: '',
  adultos: 1, criancas: 0,
  valorTotal: '', formaPagamento: 'a_definir',
  observacoes: '', status: 'confirmada',
  faturadoCnpj: '', faturadoEmpresa: '', faturadoContato: '', faturadoEndereco: '',
  valorExtra: '', desconto: '', parcelas: '1',
  dataPagamento: '',
  bancoId: '',
};

export const STATUS_FILTROS = [
  { key: 'todos', label: 'Todos' },
  { key: 'confirmada', label: 'Confirmada' },
  { key: 'check-in', label: 'Check-in' },
  { key: 'checkout', label: 'Check-out' },
  { key: 'cancelada', label: 'Cancelada' },
];
