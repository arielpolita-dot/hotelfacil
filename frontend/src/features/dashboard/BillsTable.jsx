import { AlertTriangle, CreditCard } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../../utils/formatters';
import { toDate } from '../../utils/dateUtils';
import { Card, Badge, EmptyState } from '../../components/ds';

export function BillsTable({ contasProximas7, contasVencidas }) {
  return (
    <Card padding="md">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-5 bg-rose-500 rounded-full" />
        <h3 className="text-sm font-bold text-slate-900">Contas a Pagar — Próximos 7 dias</h3>
        {contasVencidas?.length > 0 && (
          <Badge variant="danger" size="md" className="ml-2">
            <AlertTriangle className="h-3 w-3" />
            {contasVencidas.length} vencida{contasVencidas.length !== 1 ? 's' : ''}
          </Badge>
        )}
        <Badge variant="default" size="md" className="ml-auto">
          {formatCurrency(contasProximas7?.reduce((s, d) => s + (d.valor || 0), 0) || 0)}
        </Badge>
      </div>
      {!contasProximas7?.length && !contasVencidas?.length ? (
        <EmptyState icon={CreditCard} message="Nenhuma conta pendente" />
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
                      <Badge variant="danger" size="sm">{d.categoria}</Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="danger" size="sm">
                        Vencida {dtV ? format(dtV, 'dd/MM', { locale: ptBR }) : '—'}
                      </Badge>
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
                      <Badge variant="default" size="sm">{d.categoria}</Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant={ehHoje ? 'warning' : 'default'} size="sm">
                        {ehHoje ? 'Hoje' : dt ? format(dt, 'dd/MM', { locale: ptBR }) : '—'}
                      </Badge>
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
