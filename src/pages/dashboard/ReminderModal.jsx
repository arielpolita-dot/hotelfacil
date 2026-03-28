import ReactDOM from 'react-dom';
import { AlertCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../../utils/formatters';

export function ReminderModal({ open, onClose, contasVencidas, contasHoje }) {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:99999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',backgroundColor:'rgba(0,0,0,0.5)'}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center gap-3 p-5 border-b border-slate-100 bg-red-50 rounded-t-2xl">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900">Lembrete Financeiro</h2>
            <p className="text-xs text-slate-500 mt-0.5">{format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Contas Vencidas */}
          {contasVencidas?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <p className="text-sm font-bold text-red-700">
                  {contasVencidas.length} conta{contasVencidas.length !== 1 ? 's' : ''} vencida{contasVencidas.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-2">
                {contasVencidas.map(d => {
                  const dt = d.data && typeof d.data.toDate === 'function' ? d.data.toDate() : (d.data ? new Date(d.data) : null);
                  return (
                    <div key={d.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{d.descricao}</p>
                        <p className="text-xs text-red-500">
                          Venceu em {dt ? format(dt, 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                          {d.fornecedor ? ` · ${d.fornecedor}` : ''}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-red-600 flex-shrink-0 ml-3">{formatCurrency(d.valor)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-red-700 font-semibold px-1">
                <span>Subtotal vencidas:</span>
                <span>{formatCurrency(contasVencidas.reduce((s, d) => s + (d.valor || 0), 0))}</span>
              </div>
            </div>
          )}

          {/* Contas do Dia */}
          {contasHoje?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <p className="text-sm font-bold text-amber-700">
                  {contasHoje.length} conta{contasHoje.length !== 1 ? 's' : ''} vence{contasHoje.length !== 1 ? 'm' : ''} hoje
                </p>
              </div>
              <div className="space-y-2">
                {contasHoje.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{d.descricao}</p>
                      <p className="text-xs text-slate-500">{d.categoria}{d.fornecedor ? ` · ${d.fornecedor}` : ''}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-700 flex-shrink-0 ml-3">{formatCurrency(d.valor)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-amber-700 font-semibold px-1">
                <span>Subtotal hoje:</span>
                <span>{formatCurrency(contasHoje.reduce((s, d) => s + (d.valor || 0), 0))}</span>
              </div>
            </div>
          )}

          {/* Total geral */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">Total a pagar:</span>
            <span className="text-base font-bold text-rose-600">
              {formatCurrency([
                ...(contasVencidas || []),
                ...(contasHoje || [])
              ].reduce((s, d) => s + (d.valor || 0), 0))}
            </span>
          </div>
        </div>
        <div className="px-5 pb-5">
          <button onClick={onClose}
            className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition">
            Entendido
          </button>
        </div>
      </div>
    </div>
  , document.body);
}
