import { useMemo } from 'react';
import { toDate } from '../../utils/dateUtils';
import { format, isToday, addDays, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function useDashboardStats(quartos, reservas, despesas) {
  return useMemo(() => {
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

    // Quartos mais e menos usados (total historico, excluindo canceladas)
    const reservasValidas = reservas.filter(r => r.status !== 'cancelada');
    const usoQuartos = {};
    reservasValidas.forEach(r => {
      const num = r.numeroQuarto || r.quartoNumero || r.quartoId || 'Desconhecido';
      usoQuartos[num] = (usoQuartos[num] || 0) + 1;
    });
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

    // Contas a pagar: proximos 7 dias (pendentes)
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

    return {
      total, ocupados, disponiveis, taxaOcupacao, receitaMes, despesasMes,
      checkinsHoje, checkoutsHoje, statusCounts,
      reservasMes: reservasMes.length, ultimos7,
      maisPedidos, menosPedidos, maxUso,
      contasProximas7, contasVencidas, contasHoje,
    };
  }, [quartos, reservas, despesas]);
}
