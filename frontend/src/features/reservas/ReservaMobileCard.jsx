import { toDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { STATUS_BADGE_MAP } from './constants';
import { BedDouble, Pencil, ShoppingCart, LogIn, LogOut, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, Badge, IconButton } from '../../components/ds';

export function ReservaMobileCard({ r, onEdit, onPagamento, onUpdateStatus }) {
  const ci = toDate(r.dataCheckIn);
  const co = toDate(r.dataCheckOut);
  const statusKey = r.status?.toLowerCase();
  const badge = STATUS_BADGE_MAP[statusKey] || STATUS_BADGE_MAP.confirmada;

  return (
    <Card padding="sm">
      {/* Header do card */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <BedDouble className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">{r.nomeHospede || r.hospede?.nome || '\u2014'}</p>
            <p className="text-xs text-slate-400 mt-0.5">{r.telefone || r.hospede?.telefone || ''}</p>
          </div>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-50 rounded-xl p-2 text-center">
          <p className="text-xs text-slate-400 mb-0.5">Quarto</p>
          <p className="font-bold text-slate-800 text-sm">{r.numeroQuarto || r.quartoNumero || r.quartoId || '\u2014'}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2 text-center">
          <p className="text-xs text-slate-400 mb-0.5">Check-in</p>
          <p className="font-semibold text-slate-700 text-xs">{ci && !isNaN(ci) ? format(ci, 'dd/MM/yy', { locale: ptBR }) : '\u2014'}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2 text-center">
          <p className="text-xs text-slate-400 mb-0.5">Check-out</p>
          <p className="font-semibold text-slate-700 text-xs">{co && !isNaN(co) ? format(co, 'dd/MM/yy', { locale: ptBR }) : '\u2014'}</p>
        </div>
      </div>

      {/* Footer: valor + acoes */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <p className="font-bold text-slate-900 text-base">{formatCurrency(r.valorTotal || r.valor)}</p>
        <div className="flex items-center gap-1">
          <IconButton icon={Pencil} variant="brand" size="lg" label="Editar" title="Editar" onClick={() => onEdit(r)} className="bg-blue-50 hover:bg-blue-100 rounded-xl" />
          <IconButton icon={ShoppingCart} variant="ghost" size="lg" label="Pagamento" title="Pagamento" onClick={() => onPagamento(r)} className="text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-xl" />
          {r.status === 'confirmada' && (
            <IconButton icon={LogIn} variant="success" size="lg" label="Check-in" title="Check-in" onClick={() => onUpdateStatus(r.id, 'check-in')} className="bg-emerald-50 hover:bg-emerald-100 rounded-xl" />
          )}
          {(r.status === 'check-in' || r.status === 'checkin') && (
            <IconButton icon={LogOut} variant="ghost" size="lg" label="Check-out" title="Check-out" onClick={() => onUpdateStatus(r.id, 'checkout')} className="text-orange-500 bg-orange-50 hover:bg-orange-100 rounded-xl" />
          )}
          {(r.status === 'confirmada' || r.status === 'check-in' || r.status === 'checkin') && (
            <IconButton icon={Ban} variant="danger" size="lg" label="Cancelar" title="Cancelar" onClick={() => onUpdateStatus(r.id, 'cancelada')} className="bg-red-50 hover:bg-red-100 rounded-xl" />
          )}
        </div>
      </div>
    </Card>
  );
}
