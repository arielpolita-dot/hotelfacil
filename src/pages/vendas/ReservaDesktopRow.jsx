import { toDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { STATUS_CFG } from './constants';
import { BedDouble, Pencil, ShoppingCart, LogIn, LogOut, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ReservaDesktopRow({ r, onEdit, onPagamento, onUpdateStatus }) {
  const ci = toDate(r.dataCheckIn);
  const co = toDate(r.dataCheckOut);
  const statusKey = r.status?.toLowerCase();
  const cfg = STATUS_CFG[statusKey] || STATUS_CFG.confirmada;

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
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
      </td>
      <td className="py-3 px-4 text-right font-bold text-slate-900">
        {formatCurrency(r.valorTotal || r.valor)}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => onEdit(r)} title="Editar reserva" className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => onPagamento(r)} title="Registrar pagamento" className="w-8 h-8 flex items-center justify-center rounded-lg text-violet-600 hover:bg-violet-50 transition">
            <ShoppingCart className="h-4 w-4" />
          </button>
          {r.status === 'confirmada' && (
            <button onClick={() => onUpdateStatus(r.id, 'check-in')} title="Fazer Check-in" className="w-8 h-8 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition">
              <LogIn className="h-4 w-4" />
            </button>
          )}
          {(r.status === 'check-in' || r.status === 'checkin') && (
            <button onClick={() => onUpdateStatus(r.id, 'checkout')} title="Fazer Check-out" className="w-8 h-8 flex items-center justify-center rounded-lg text-orange-500 hover:bg-orange-50 transition">
              <LogOut className="h-4 w-4" />
            </button>
          )}
          {(r.status === 'confirmada' || r.status === 'check-in' || r.status === 'checkin') && (
            <button onClick={() => onUpdateStatus(r.id, 'cancelada')} title="Cancelar reserva" className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition">
              <Ban className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
