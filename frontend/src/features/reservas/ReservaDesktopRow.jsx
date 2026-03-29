import { toDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { STATUS_BADGE_MAP } from './constants';
import { BedDouble, Pencil, ShoppingCart, LogIn, LogOut, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { IconButton, Badge } from '../../components/ds';

export function ReservaDesktopRow({ r, onEdit, onPagamento, onUpdateStatus }) {
  const ci = toDate(r.dataCheckIn);
  const co = toDate(r.dataCheckOut);
  const statusKey = r.status?.toLowerCase();
  const badge = STATUS_BADGE_MAP[statusKey] || STATUS_BADGE_MAP.confirmada;

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4">
        <p className="font-semibold text-slate-900">{r.nomeHospede || r.hospede?.nome || '\u2014'}</p>
        <p className="text-xs text-slate-400 mt-0.5">{r.telefone || r.hospede?.telefone || ''}</p>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
            <BedDouble className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="font-medium text-slate-700">{r.numeroQuarto || r.quartoNumero || r.quartoId}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-slate-600">
        {ci && !isNaN(ci) ? format(ci, 'dd/MM/yyyy', { locale: ptBR }) : '\u2014'}
      </td>
      <td className="py-3 px-4 text-slate-600">
        {co && !isNaN(co) ? format(co, 'dd/MM/yyyy', { locale: ptBR }) : '\u2014'}
      </td>
      <td className="py-3 px-4">
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </td>
      <td className="py-3 px-4 text-right font-bold text-slate-900">
        {formatCurrency(r.valorTotal || r.valor)}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-center gap-1">
          <IconButton icon={Pencil} variant="brand" label="Editar" title="Editar reserva" onClick={() => onEdit(r)} />
          <IconButton icon={ShoppingCart} variant="ghost" label="Pagamento" title="Registrar pagamento" onClick={() => onPagamento(r)} className="text-violet-600 hover:bg-violet-50" />
          {r.status === 'confirmada' && (
            <IconButton icon={LogIn} variant="success" label="Check-in" title="Fazer Check-in" onClick={() => onUpdateStatus(r.id, 'check-in')} />
          )}
          {(r.status === 'check-in' || r.status === 'checkin') && (
            <IconButton icon={LogOut} variant="ghost" label="Check-out" title="Fazer Check-out" onClick={() => onUpdateStatus(r.id, 'checkout')} className="text-orange-500 hover:bg-orange-50" />
          )}
          {(r.status === 'confirmada' || r.status === 'check-in' || r.status === 'checkin') && (
            <IconButton icon={Ban} variant="danger" label="Cancelar" title="Cancelar reserva" onClick={() => onUpdateStatus(r.id, 'cancelada')} />
          )}
        </div>
      </td>
    </tr>
  );
}
