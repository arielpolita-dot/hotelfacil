import { AlertTriangle, CreditCard } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../../utils/formatters';
import { toDate } from '../../utils/dateUtils';

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

export function BillsTable({ contasProximas7, contasVencidas }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-5 bg-rose-500 rounded-full" />
        <h3 className="text-sm font-bold text-slate-900">Contas a Pagar — Próximos 7 dias</h3>
        {contasVencidas?.length > 0 && (
          <span className="ml-2 flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
            <AlertTriangle className="h-3 w-3" />
            {contasVencidas.length} vencida{contasVencidas.length !== 1 ? 's' : ''}
          </span>
        )}
        <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
          {formatCurrency(contasProximas7?.reduce((s, d) => s + (d.valor || 0), 0) || 0)}
        </span>
      </div>
      {!contasProximas7?.length && !contasVencidas?.length ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
          <CreditCard className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-sm">Nenhuma conta pendente</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Descrição</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Categoria</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Vencimento</th>
                <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Valor</th>
              </tr>
            </thead>
            <tbody>
              {(contasVencidas || []).map(d => {
                const dtV = toDate(d.data);
                return (
                  <tr key={`v-${d.id}`} className="border-b border-red-100 bg-red-50 hover:bg-red-100">
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-red-800">{d.descricao}</p>
                      {d.fornecedor && <p className="text-xs text-red-400">{d.fornecedor}</p>}
                    </td>
                    <td className="py-2.5 px-3 hidden sm:table-cell">
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{d.categoria}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-200 text-red-700">
                        Vencida {dtV ? format(dtV, 'dd/MM', { locale: ptBR }) : '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-red-600">{formatCurrency(d.valor)}</td>
                  </tr>
                );
              })}
              {(contasProximas7 || []).map(d => {
                const dt = toDate(d.data);
                const ehHoje = dt && isToday(dt);
                return (
                  <tr key={d.id} className={`border-b border-slate-50 last:border-0 ${ehHoje ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-900">{d.descricao}</p>
                      {d.fornecedor && <p className="text-xs text-slate-400">{d.fornecedor}</p>}
                    </td>
                    <td className="py-2.5 px-3 hidden sm:table-cell">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{d.categoria}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        ehHoje ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {ehHoje ? 'Hoje' : dt ? format(dt, 'dd/MM', { locale: ptBR }) : '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600">{formatCurrency(d.valor)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
