import { useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useHotel } from '../context/HotelContext';
import {
  BedDouble, CalendarCheck, DollarSign, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock, BarChart2,
  AlertCircle, CreditCard, X, AlertTriangle
} from 'lucide-react';
import { format, isToday, isTomorrow, addDays, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { toDate } from '../utils/dateUtils';

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

  const stats = useMemo(() => {
    const total = quartos.length;
    const ocupados = quartos.filter(q => q.status === 'ocupado').length;
    const disponiveis = quartos.filter(q => q.status === 'disponivel').length;
    const taxaOcupacao = total > 0 ? Math.round((ocupados / total) * 100) : 0;

    const hoje = new Date();
    const mes = hoje.getMonth();
    const ano = hoje.getFullYear();

    const reservasMes = reservas.filter(r => {
      const d = toDate(r.criadoEm) || toDate(r.dataCheckIn);
      if (!d) return false;
      return d.getMonth() === mes && d.getFullYear() === ano && r.status !== 'cancelada';
    });
    const receitaMes = reservasMes.reduce((s, r) => s + (r.valorTotal || 0), 0);

    const despesasMes = despesas.filter(d => {
      const dt = toDate(d.data);
      if (!dt) return false;
      return dt.getMonth() === mes && dt.getFullYear() === ano;
    }).reduce((s, d) => s + (d.valor || 0), 0);

    const checkinsHoje = reservas.filter(r => {
      const d = toDate(r.dataCheckIn);
      return d && isToday(d) && r.status === 'confirmada';
    }).length;

    const checkoutsHoje = reservas.filter(r => {
      const d = toDate(r.dataCheckOut);
      return d && isToday(d) && r.status === 'checkin';
    }).length;

    const statusCounts = {};
    quartos.forEach(q => { statusCounts[q.status] = (statusCounts[q.status] || 0) + 1; });

    const ultimos7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dStr = d.toISOString().split('T')[0];
      const rec = reservas.filter(r => {
        const ci = toDate(r.dataCheckIn);
        if (!ci) return false;
        return ci.toISOString().split('T')[0] === dStr && r.status !== 'cancelada';
      }).reduce((s, r) => s + (r.valorTotal || 0), 0);
      return { dia: format(d, 'EEE', { locale: ptBR }), receita: rec };
    });

    // Quartos mais e menos usados (total histórico, excluindo canceladas)
    const reservasValidas = reservas.filter(r => r.status !== 'cancelada');
    const usoQuartos = {};
    reservasValidas.forEach(r => {
      const num = r.numeroQuarto || r.quartoNumero || r.quartoId || 'Desconhecido';
      usoQuartos[num] = (usoQuartos[num] || 0) + 1;
    });
    // Garantir que todos os quartos apareçam, mesmo com 0 reservas
    quartos.forEach(q => {
      const num = String(q.numero || q.id);
      if (!(num in usoQuartos)) usoQuartos[num] = 0;
    });
    const totalReservas = Object.values(usoQuartos).reduce((s, v) => s + v, 0);
    const quartosSorted = Object.entries(usoQuartos)
      .map(([num, qtd]) => ({ num, qtd, pct: totalReservas > 0 ? Math.round((qtd / totalReservas) * 100) : 0 }))
      .sort((a, b) => b.qtd - a.qtd);
    const maisPedidos = quartosSorted.slice(0, 5);
    const menosPedidos = [...quartosSorted].sort((a, b) => a.qtd - b.qtd).slice(0, 5);
    const maxUso = maisPedidos[0]?.qtd || 1;

    // Contas a pagar: próximos 7 dias (pendentes)
    const hojeStart = startOfDay(new Date());
    const limite7 = addDays(hojeStart, 7);
    const contasProximas7 = despesas
      .filter(d => {
        if (d.status !== 'pendente') return false;
        const dt = toDate(d.data);
        if (!dt) return false;
        const dtStart = startOfDay(dt);
        return !isBefore(dtStart, hojeStart) && isBefore(dtStart, limite7);
      })
      .sort((a, b) => toDate(a.data) - toDate(b.data));

    const contasVencidas = despesas.filter(d => {
      if (d.status !== 'pendente') return false;
      const dt = toDate(d.data);
      if (!dt) return false;
      return isBefore(startOfDay(dt), hojeStart);
    });

    const contasHoje = despesas.filter(d => {
      if (d.status !== 'pendente') return false;
      const dt = toDate(d.data);
      return dt && isToday(dt);
    });

    return { total, ocupados, disponiveis, taxaOcupacao, receitaMes, despesasMes, checkinsHoje, checkoutsHoje, statusCounts, reservasMes: reservasMes.length, ultimos7, maisPedidos, menosPedidos, maxUso, contasProximas7, contasVencidas, contasHoje };
  }, [quartos, reservas, despesas]);

  // Abrir modal de lembrete ao carregar se houver contas do dia ou vencidas
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
      {/* Cabeçalho */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Visão Geral</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ocupação" value={`${stats.taxaOcupacao}%`} sub={`${stats.ocupados}/${stats.total} quartos`} icon={BedDouble} iconBg="bg-blue-600" />
        <StatCard title="Receita do Mês" value={formatCurrency(stats.receitaMes)} sub={`${stats.reservasMes} reservas`} icon={DollarSign} iconBg="bg-emerald-600" />
        <StatCard title="Check-ins Hoje" value={stats.checkinsHoje} sub="aguardando chegada" icon={CalendarCheck} iconBg="bg-violet-600" />
        <StatCard title="Check-outs Hoje" value={stats.checkoutsHoje} sub="a liberar" icon={Clock} iconBg="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico + reservas */}
        <div className="lg:col-span-2 space-y-5">
          {/* Gráfico */}
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

          {/* Reservas recentes */}
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
                  const stMap = {
                    confirmada: 'bg-blue-100 text-blue-700',
                    checkin: 'bg-emerald-100 text-emerald-700',
                    checkout: 'bg-slate-100 text-slate-600',
                    cancelada: 'bg-red-100 text-red-700',
                  };
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

        {/* Painel lateral */}
        <div className="space-y-5">
          {/* Status quartos */}
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

          {/* Financeiro */}
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

      {/* Quartos mais e menos usados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mais usados */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-5 bg-emerald-500 rounded-full" />
            <h3 className="text-sm font-bold text-slate-900">Quartos Mais Utilizados</h3>
            <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">Top 5</span>
          </div>
          {stats.maisPedidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <BedDouble className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">Nenhum dado disponível</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.maisPedidos.map((q, i) => (
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
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${stats.maxUso > 0 ? Math.round((q.qtd / stats.maxUso) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Menos usados */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-5 bg-amber-400 rounded-full" />
            <h3 className="text-sm font-bold text-slate-900">Quartos Menos Utilizados</h3>
            <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">Bottom 5</span>
          </div>
          {stats.menosPedidos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <BedDouble className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">Nenhum dado disponível</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.menosPedidos.map((q, i) => (
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
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${stats.maxUso > 0 ? Math.round((q.qtd / stats.maxUso) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Contas a Pagar — Próximos 7 dias */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-5 bg-rose-500 rounded-full" />
          <h3 className="text-sm font-bold text-slate-900">Contas a Pagar — Próximos 7 dias</h3>
          {stats.contasVencidas?.length > 0 && (
            <span className="ml-2 flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
              <AlertTriangle className="h-3 w-3" />
              {stats.contasVencidas.length} vencida{stats.contasVencidas.length !== 1 ? 's' : ''}
            </span>
          )}
          <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            {formatCurrency(stats.contasProximas7?.reduce((s, d) => s + (d.valor || 0), 0) || 0)}
          </span>
        </div>
        {!stats.contasProximas7?.length && !stats.contasVencidas?.length ? (
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
                {(stats.contasVencidas || []).map(d => {
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
                {(stats.contasProximas7 || []).map(d => {
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

      {/* Modal Lembrete — Contas do dia */}
      {modalLembrete && ReactDOM.createPortal(
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
              <button onClick={() => setModalLembrete(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Contas Vencidas */}
              {stats.contasVencidas?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    <p className="text-sm font-bold text-red-700">
                      {stats.contasVencidas.length} conta{stats.contasVencidas.length !== 1 ? 's' : ''} vencida{stats.contasVencidas.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {stats.contasVencidas.map(d => {
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
                    <span>{formatCurrency(stats.contasVencidas.reduce((s, d) => s + (d.valor || 0), 0))}</span>
                  </div>
                </div>
              )}

              {/* Contas do Dia */}
              {stats.contasHoje?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                    <p className="text-sm font-bold text-amber-700">
                      {stats.contasHoje.length} conta{stats.contasHoje.length !== 1 ? 's' : ''} vence{stats.contasHoje.length !== 1 ? 'm' : ''} hoje
                    </p>
                  </div>
                  <div className="space-y-2">
                    {stats.contasHoje.map(d => (
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
                    <span>{formatCurrency(stats.contasHoje.reduce((s, d) => s + (d.valor || 0), 0))}</span>
                  </div>
                </div>
              )}

              {/* Total geral */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Total a pagar:</span>
                <span className="text-base font-bold text-rose-600">
                  {formatCurrency([
                    ...(stats.contasVencidas || []),
                    ...(stats.contasHoje || [])
                  ].reduce((s, d) => s + (d.valor || 0), 0))}
                </span>
              </div>
            </div>
            <div className="px-5 pb-5">
              <button onClick={() => setModalLembrete(false)}
                className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl transition">
                Entendido
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
