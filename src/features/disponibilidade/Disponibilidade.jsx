import { toDate, toDateString } from '../../utils/dateUtils';
import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useReservaMap } from './useReservaMap';
import { ChevronLeft, ChevronRight, BedDouble, ShoppingCart } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Cores por status conforme solicitado:
// verde = livre/disponível
// vermelho = reserva confirmada
// azul = check-in (hóspede hospedado)
// amarelo = overbook
// laranja = checkout
const STATUS_CFG = {
  disponivel:  { label: 'Disponível',  cls: 'bg-emerald-500',  text: 'text-white', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  confirmada:  { label: 'Confirmada',  cls: 'bg-red-500',      text: 'text-white', light: 'bg-red-50 text-red-700 border-red-200' },
  'check-in':  { label: 'Check-in',   cls: 'bg-blue-500',     text: 'text-white', light: 'bg-blue-50 text-blue-700 border-blue-200' },
  checkin:     { label: 'Check-in',   cls: 'bg-blue-500',     text: 'text-white', light: 'bg-blue-50 text-blue-700 border-blue-200' },
  overbook:    { label: 'Overbook',    cls: 'bg-yellow-400',   text: 'text-slate-900', light: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  checkout:    { label: 'Limpeza',    cls: 'bg-slate-400',    text: 'text-white', light: 'bg-slate-100 text-slate-600 border-slate-300' },
  manutencao:  { label: 'Manutenção', cls: 'bg-gray-900',    text: 'text-white', light: 'bg-gray-100 text-gray-700 border-gray-300' },
  limpeza:     { label: 'Limpeza',    cls: 'bg-slate-400',    text: 'text-white', light: 'bg-slate-100 text-slate-600 border-slate-300' },
};

// Legenda exibida no topo (apenas os status relevantes para o calendário)
const LEGENDA_ITEMS = ['disponivel', 'confirmada', 'check-in', 'overbook', 'checkout', 'manutencao'];

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function Disponibilidade() {
  const { quartos, reservas, loading } = useHotel();
  const [mesAtual, setMesAtual] = useState(new Date());
  const reservaMap = useReservaMap(reservas);

  const diasDoMes = useMemo(() => {
    const inicio = startOfMonth(mesAtual);
    const fim = endOfMonth(mesAtual);
    return eachDayOfInterval({ start: inicio, end: fim });
  }, [mesAtual]);

  // O(1) lookup: resolve status + reserva for a quarto on a given day
  const getStatusDia = (quarto, dia) => {
    const dateStr = toDateString(dia);
    const entry = reservaMap.get(`${quarto.id}:${dateStr}`);

    if (!entry) {
      if (quarto.status === 'manutencao') {
        const ini = quarto.manutencaoInicio ? new Date(quarto.manutencaoInicio + 'T00:00:00') : null;
        const fim = quarto.manutencaoFim   ? new Date(quarto.manutencaoFim   + 'T23:59:59') : null;
        if (ini && fim) {
          if (dia >= ini && dia <= fim) return 'manutencao';
          return 'disponivel';
        }
        return 'manutencao';
      }
      if (quarto.status === 'limpeza') return 'limpeza';
      return 'disponivel';
    }

    if (entry._overbook) return 'overbook';

    const s = entry.status?.toLowerCase();
    if (s === 'check-in' || s === 'checkin') return 'check-in';
    if (s === 'checkout' || s === 'check-out') return 'checkout';
    return 'confirmada';
  };

  const getReservaDia = (quarto, dia) => {
    const dateStr = toDateString(dia);
    const entry = reservaMap.get(`${quarto.id}:${dateStr}`);
    return entry && !entry._overbook ? entry : null;
  };

  // Contagem de quartos por status hoje
  const stats = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(12, 0, 0, 0);
    const counts = {};
    quartos.forEach(q => {
      const s = getStatusDia(q, hoje);
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [quartos, reservaMap]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Disponibilidade</h2>
          <p className="text-sm text-slate-500 mt-0.5">Calendário de ocupação dos quartos</p>
        </div>
        {/* Navegação de mês */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
          <button onClick={() => setMesAtual(m => subMonths(m, 1))} className="text-slate-500 hover:text-slate-900 transition p-1 rounded-lg hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold text-slate-900 min-w-[140px] text-center capitalize">
            {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button onClick={() => setMesAtual(m => addMonths(m, 1))} className="text-slate-500 hover:text-slate-900 transition p-1 rounded-lg hover:bg-slate-100">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Legenda + stats */}
      <div className="flex flex-wrap gap-2">
        {LEGENDA_ITEMS.map(key => {
          const cfg = STATUS_CFG[key];
          return (
            <div key={key} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${cfg.light}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${cfg.cls}`} />
              {cfg.label} ({stats[key] || 0})
            </div>
          );
        })}
      </div>

      {/* Grid de disponibilidade */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 sticky left-0 bg-slate-50 z-10 min-w-[100px]">Quarto</th>
                {diasDoMes.map(dia => (
                  <th key={dia.toISOString()} className={`py-2 px-0.5 text-center min-w-[34px]`}>
                    <div className={`text-[10px] font-medium ${isToday(dia) ? 'text-blue-600' : 'text-slate-400'}`}>
                      {DIAS_SEMANA[getDay(dia)]}
                    </div>
                    <div className={`text-xs font-bold mt-0.5 ${isToday(dia) ? 'w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto' : 'text-slate-600'}`}>
                      {format(dia, 'd')}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quartos.map(quarto => (
                <tr key={quarto.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-4 sticky left-0 bg-white hover:bg-slate-50/50 z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BedDouble className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{quarto.numero}</p>
                        <p className="text-[10px] text-slate-400">{quarto.tipo}</p>
                      </div>
                    </div>
                  </td>
                  {diasDoMes.map(dia => {
                    const status = getStatusDia(quarto, dia);
                    const reserva = getReservaDia(quarto, dia);
                    const cfg = STATUS_CFG[status] || STATUS_CFG.disponivel;
                    const isCI = reserva && isSameDay(dia, toDate(reserva.dataCheckIn));
                    // Pagamento registrado = formaPagamento preenchido e diferente de 'a_definir'
                    const temPagamento = reserva &&
                      reserva.formaPagamento &&
                      reserva.formaPagamento !== 'a_definir';
                    // Mostrar carrinho apenas no último dia da reserva (checkout)
                    const isCO = reserva && isSameDay(dia, toDate(reserva.dataCheckOut));
                    return (
                      <td key={dia.toISOString()} className="py-1.5 px-0.5">
                        <div
                          title={reserva
                            ? `${reserva.nomeHospede || reserva.hospede?.nome || 'Hóspede'} — ${cfg.label}${temPagamento ? ' • Pago' : ''}`
                            : cfg.label
                          }
                          className={`h-7 rounded-md ${cfg.cls} ${cfg.text} flex items-center justify-center cursor-default transition-opacity hover:opacity-80 ${isToday(dia) ? 'ring-2 ring-blue-600 ring-offset-1' : ''}`}
                        >
                          {/* Carrinho apenas no dia do checkout quando há pagamento */}
                          {isCO && temPagamento && (
                            <ShoppingCart className="h-3 w-3" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {quartos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <BedDouble className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Nenhum quarto cadastrado</p>
          <p className="text-xs mt-1">Cadastre quartos para visualizar a disponibilidade</p>
        </div>
      )}
    </div>
  );
}
