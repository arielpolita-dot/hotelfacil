import { toDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { STATUS_CFG } from './constants';
import { BedDouble, Pencil, ShoppingCart, LogIn, LogOut, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ReservaMobileCard({ r, onEdit, onPagamento, onUpdateStatus }) {
  const ci = toDate(r.dataCheckIn);
  const co = toDate(r.dataCheckOut);
  const statusKey = r.status?.toLowerCase();
  const cfg = STATUS_CFG[statusKey] || STATUS_CFG.confirmada;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
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
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
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
          <button onClick={() => onEdit(r)} title="Editar" aria-label="Editar" className="w-9 h-9 flex items-center justify-center rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => onPagamento(r)} title="Pagamento" aria-label="Pagamento" className="w-9 h-9 flex items-center justify-center rounded-xl text-violet-600 bg-violet-50 hover:bg-violet-100 transition">
            <ShoppingCart className="h-4 w-4" />
          </button>
          {r.status === 'confirmada' && (
            <button onClick={() => onUpdateStatus(r.id, 'check-in')} title="Check-in" aria-label="Check-in" className="w-9 h-9 flex items-center justify-center rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition">
              <LogIn className="h-4 w-4" />
            </button>
          )}
          {(r.status === 'check-in' || r.status === 'checkin') && (
            <button onClick={() => onUpdateStatus(r.id, 'checkout')} title="Check-out" aria-label="Check-out" className="w-9 h-9 flex items-center justify-center rounded-xl text-orange-500 bg-orange-50 hover:bg-orange-100 transition">
              <LogOut className="h-4 w-4" />
            </button>
          )}
          {(r.status === 'confirmada' || r.status === 'check-in' || r.status === 'checkin') && (
            <button onClick={() => onUpdateStatus(r.id, 'cancelada')} title="Cancelar" className="w-9 h-9 flex items-center justify-center rounded-xl text-red-400 bg-red-50 hover:bg-red-100 transition">
              <Ban className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
