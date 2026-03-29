import { Badge } from '../atoms/Badge';

const VARIANT_MAP = {
  /* Reservas */
  confirmada:  { label: 'Confirmada',  variant: 'brand' },
  pendente:    { label: 'Pendente',    variant: 'warning' },
  checkin:     { label: 'Check-in',    variant: 'success' },
  checkout:    { label: 'Check-out',   variant: 'info' },
  cancelada:   { label: 'Cancelada',   variant: 'danger' },
  noshow:      { label: 'No-show',     variant: 'danger' },

  /* Faturas / Despesas */
  pago:        { label: 'Pago',        variant: 'success' },
  paga:        { label: 'Paga',        variant: 'success' },
  aberta:      { label: 'Aberta',      variant: 'warning' },
  vencida:     { label: 'Vencida',     variant: 'danger' },
  parcial:     { label: 'Parcial',     variant: 'info' },

  /* Quartos */
  disponivel:  { label: 'Disponivel',  variant: 'success' },
  ocupado:     { label: 'Ocupado',     variant: 'brand' },
  reservado:   { label: 'Reservado',   variant: 'accent' },
  manutencao:  { label: 'Manutencao',  variant: 'warning' },
  limpeza:     { label: 'Limpeza',     variant: 'info' },

  /* Usuarios */
  ativo:       { label: 'Ativo',       variant: 'success' },
  inativo:     { label: 'Inativo',     variant: 'danger' },

  /* Fluxo de caixa */
  entrada:     { label: 'Entrada',     variant: 'success' },
  saida:       { label: 'Saida',       variant: 'danger' },
};

export function StatusBadge({ status, config, label: customLabel, className }) {
  const fromConfig = config?.[status];
  const fromMap = VARIANT_MAP[status];

  if (fromConfig) {
    return (
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center ${fromConfig.cls} ${className || ''}`}>
        {fromConfig.label}
      </span>
    );
  }

  const mapped = fromMap || { label: status, variant: 'default' };

  return (
    <Badge variant={mapped.variant} className={className}>
      {customLabel || mapped.label}
    </Badge>
  );
}
