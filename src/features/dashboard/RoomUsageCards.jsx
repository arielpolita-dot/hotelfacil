import { BedDouble } from 'lucide-react';

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

export function RoomUsageCards({ maisPedidos, menosPedidos, maxUso }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-5 bg-emerald-500 rounded-full" />
          <h3 className="text-sm font-bold text-slate-900">Quartos Mais Utilizados</h3>
          <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">Top 5</span>
        </div>
        {maisPedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <BedDouble className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Nenhum dado disponível</p>
          </div>
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
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{q.pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${maxUso > 0 ? Math.round((q.qtd / maxUso) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-5 bg-amber-400 rounded-full" />
          <h3 className="text-sm font-bold text-slate-900">Quartos Menos Utilizados</h3>
          <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">Bottom 5</span>
        </div>
        {menosPedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <BedDouble className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Nenhum dado disponível</p>
          </div>
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
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{q.pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${maxUso > 0 ? Math.round((q.qtd / maxUso) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
