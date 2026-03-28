import { useState, useRef, useEffect, useMemo } from 'react';
import { Bell, X, AlertTriangle, AlertCircle } from 'lucide-react';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../../utils/formatters';
import { toDate } from '../../utils/dateUtils';

export function NotificationBell({ despesas }) {
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  const alertas = useMemo(() => {
    const hojeStart = startOfDay(new Date());
    const vencidas = despesas.filter(d => {
      if (d.status !== 'pendente') return false;
      const dt = toDate(d.data);
      if (!dt) return false;
      return isBefore(startOfDay(dt), hojeStart);
    });
    const hoje = despesas.filter(d => {
      if (d.status !== 'pendente') return false;
      const dt = toDate(d.data);
      return dt && isToday(dt);
    });
    return { vencidas, hoje, total: vencidas.length + hoje.length };
  }, [despesas]);

  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setBellOpen(v => !v)}
        className={`relative p-2 rounded-xl transition ${
          alertas.total > 0
            ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Alertas financeiros"
      >
        <Bell className="h-5 w-5" />
        {alertas.total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {alertas.total > 9 ? '9+' : alertas.total}
          </span>
        )}
      </button>

      {bellOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900">Alertas Financeiros</h3>
            <button onClick={() => setBellOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition">
              <X className="h-4 w-4" />
            </button>
          </div>

          {alertas.total === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <Bell className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">Nenhum alerta no momento</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {alertas.vencidas.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-100">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
                      {alertas.vencidas.length} Conta{alertas.vencidas.length !== 1 ? 's' : ''} Vencida{alertas.vencidas.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {alertas.vencidas.map(d => {
                    const dt = toDate(d.data);
                    return (
                      <div key={d.id} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50 hover:bg-red-50 transition">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">{d.descricao}</p>
                          <p className="text-xs text-red-500">
                            Venceu em {dt ? format(dt, 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-red-600 ml-3 flex-shrink-0">{formatCurrency(d.valor)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {alertas.hoje.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                      {alertas.hoje.length} Conta{alertas.hoje.length !== 1 ? 's' : ''} Vence{alertas.hoje.length !== 1 ? 'm' : ''} Hoje
                    </span>
                  </div>
                  {alertas.hoje.map(d => (
                    <div key={d.id} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50 hover:bg-amber-50 transition">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{d.descricao}</p>
                        <p className="text-xs text-amber-600">{d.categoria}</p>
                      </div>
                      <span className="text-sm font-bold text-amber-700 ml-3 flex-shrink-0">{formatCurrency(d.valor)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {alertas.total > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">Total em aberto:</span>
              <span className="text-sm font-bold text-rose-600">
                {formatCurrency([...alertas.vencidas, ...alertas.hoje].reduce((s, d) => s + (d.valor || 0), 0))}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
