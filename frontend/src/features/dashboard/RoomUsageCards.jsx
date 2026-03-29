import { BedDouble } from 'lucide-react';
import { Card, ProgressBar, Badge, EmptyState } from '../../components/ds';

export function RoomUsageCards({ maisPedidos, menosPedidos, maxUso }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card padding="md">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-5 bg-emerald-500 rounded-full" />
          <h3 className="text-sm font-bold text-slate-900">Quartos Mais Utilizados</h3>
          <Badge variant="default" size="md" className="ml-auto">Top 5</Badge>
        </div>
        {maisPedidos.length === 0 ? (
          <EmptyState icon={BedDouble} message="Nenhum dado disponível" />
        ) : (
          <div className="space-y-3">
            {maisPedidos.map((q, i) => (
              <div key={q.num}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <span className="text-sm font-semibold text-slate-800">Quarto {q.num}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{q.qtd} reserva{q.qtd !== 1 ? 's' : ''}</span>
                    <Badge variant="success" size="sm">{q.pct}%</Badge>
                  </div>
                </div>
                <ProgressBar
                  value={maxUso > 0 ? Math.round((q.qtd / maxUso) * 100) : 0}
                  color="success"
                  size="md"
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card padding="md">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-5 bg-amber-400 rounded-full" />
          <h3 className="text-sm font-bold text-slate-900">Quartos Menos Utilizados</h3>
          <Badge variant="default" size="md" className="ml-auto">Bottom 5</Badge>
        </div>
        {menosPedidos.length === 0 ? (
          <EmptyState icon={BedDouble} message="Nenhum dado disponível" />
        ) : (
          <div className="space-y-3">
            {menosPedidos.map((q, i) => (
              <div key={q.num}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <span className="text-sm font-semibold text-slate-800">Quarto {q.num}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{q.qtd} reserva{q.qtd !== 1 ? 's' : ''}</span>
                    <Badge variant="warning" size="sm">{q.pct}%</Badge>
                  </div>
                </div>
                <ProgressBar
                  value={maxUso > 0 ? Math.round((q.qtd / maxUso) * 100) : 0}
                  color="warning"
                  size="md"
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
