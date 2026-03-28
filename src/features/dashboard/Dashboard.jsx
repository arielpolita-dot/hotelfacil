import { useMemo, useState, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  BedDouble, CalendarCheck, DollarSign, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock, BarChart2
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { toDate } from '../../utils/dateUtils';
import { useDashboardStats } from './useDashboardStats';
import { ReminderModal } from './ReminderModal';
import { RoomUsageCards } from './RoomUsageCards';
import { BillsTable } from './BillsTable';

const STATUS_CFG = {
  disponivel: { label: 'Disponível', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  ocupado:    { label: 'Ocupado',    bar: 'bg-blue-500',    dot: 'bg-blue-500' },
  reservado:  { label: 'Reservado',  bar: 'bg-violet-500',  dot: 'bg-violet-500' },
  manutencao: { label: 'Manutenção', bar: 'bg-amber-500',   dot: 'bg-amber-500' },
  limpeza:    { label: 'Limpeza',    bar: 'bg-sky-500',     dot: 'bg-sky-500' },
};

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>
      {children}
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, iconBg }) {
  return (
    <Card className="p-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1 truncate">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { quartos, reservas, despesas, loading } = useHotel();
  const [modalLembrete, setModalLembrete] = useState(false);
  const [lembreteVisto, setLembreteVisto] = useState(false);

  const stats = useDashboardStats(quartos, reservas, despesas);

  useEffect(() => {
    const temAlerta = (stats.contasHoje?.length || 0) + (stats.contasVencidas?.length || 0) > 0;
    if (!loading && !lembreteVisto && temAlerta) {
      setModalLembrete(true);
      setLembreteVisto(true);
    }
  }, [loading, stats.contasHoje?.length, stats.contasVencidas?.length]);

  const reservasRecentes = useMemo(() =>
    [...reservas]
      .filter(r => r.status !== 'checkout' && r.status !== 'cancelada')
      .sort((a, b) => {
        const da = toDate(b.criadoEm);
        const db = toDate(a.criadoEm);
        return (da?.getTime() || 0) - (db?.getTime() || 0);
      })
      .slice(0, 7),
    [reservas]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Visão Geral</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ocupação" value={`${stats.taxaOcupacao}%`} sub={`${stats.ocupados}/${stats.total} quartos`} icon={BedDouble} iconBg="bg-blue-600" />
        <StatCard title="Receita do Mês" value={formatCurrency(stats.receitaMes)} sub={`${stats.reservasMes} reservas`} icon={DollarSign} iconBg="bg-emerald-600" />
        <StatCard title="Check-ins Hoje" value={stats.checkinsHoje} sub="aguardando chegada" icon={CalendarCheck} iconBg="bg-violet-600" />
        <StatCard title="Check-outs Hoje" value={stats.checkoutsHoje} sub="a liberar" icon={Clock} iconBg="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Receita — Últimos 7 dias</h3>
            {stats.ultimos7.some(d => d.receita > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.ultimos7} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                  <Tooltip formatter={(v) => formatCurrency(v)} labelStyle={{ fontSize: 12 }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="receita" name="Receita" fill="#3b82f6" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <BarChart2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhuma movimentação registrada</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Reservas Ativas</h3>
              <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">{reservasRecentes.length}</span>
            </div>
            {reservasRecentes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <BedDouble className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">Nenhuma reserva ativa</p>
              </div>
            ) : (
              <div className="space-y-0">
                {reservasRecentes.map(r => {
                  const ci = toDate(r.dataCheckIn);
                  const ciLabel = !ci ? '—' : isToday(ci) ? 'Hoje' : isTomorrow(ci) ? 'Amanhã' : format(ci, 'dd/MM', { locale: ptBR });
                  const stMap = { confirmada: 'bg-blue-100 text-blue-700', checkin: 'bg-emerald-100 text-emerald-700', checkout: 'bg-slate-100 text-slate-600', cancelada: 'bg-red-100 text-red-700' };
                  const stLabel = { confirmada: 'Confirmada', checkin: 'Check-in', checkout: 'Check-out', cancelada: 'Cancelada' };
                  return (
                    <div key={r.id} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
                      <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BedDouble className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{r.nomeHospede || r.hospede?.nome || '—'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Quarto {r.numeroQuarto || r.quartoNumero || r.quartoId} · {ciLabel}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stMap[r.status] || 'bg-slate-100 text-slate-600'}`}>
                          {stLabel[r.status] || r.status}
                        </span>
                        <span className="text-xs font-bold text-slate-700">{formatCurrency(r.valorTotal || r.valor)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Status dos Quartos</h3>
            <div className="space-y-3">
              {Object.entries(STATUS_CFG).map(([key, cfg]) => {
                const count = stats.statusCounts[key] || 0;
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className="text-sm text-slate-600">{cfg.label}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${cfg.bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Financeiro do Mês</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-slate-700">Receita</span>
                </div>
                <span className="text-sm font-bold text-emerald-700">{formatCurrency(stats.receitaMes)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-rose-600" />
                  <span className="text-sm text-slate-700">Despesas</span>
                </div>
                <span className="text-sm font-bold text-rose-700">{formatCurrency(stats.despesasMes)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">Saldo</span>
                </div>
                <span className={`text-sm font-bold ${stats.receitaMes - stats.despesasMes >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatCurrency(stats.receitaMes - stats.despesasMes)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <RoomUsageCards maisPedidos={stats.maisPedidos} menosPedidos={stats.menosPedidos} maxUso={stats.maxUso} />
      <BillsTable contasProximas7={stats.contasProximas7} contasVencidas={stats.contasVencidas} />

      <ReminderModal
        open={modalLembrete}
        onClose={() => setModalLembrete(false)}
        contasVencidas={stats.contasVencidas}
        contasHoje={stats.contasHoje}
      />
    </div>
  );
}
