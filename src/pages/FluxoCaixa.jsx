import { toDate, toDateString } from '../utils/dateUtils';
import { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelFirestoreContext';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Plus, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { inputCls, selectCls } from '../styles/formClasses';

const EMPTY = { tipo: 'entrada', descricao: '', valor: '', data: new Date().toISOString().split('T')[0], categoria: 'Outros', observacoes: '' };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function FluxoCaixa() {
  const { fluxoCaixa, adicionarFluxo, loading } = useHotel();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [mesAtual, setMesAtual] = useState(new Date());

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const salvar = async () => {
    if (!form.descricao || !form.valor) return;
    setSaving(true);
    try {
      await adicionarFluxo({ ...form, valor: parseFloat(form.valor), data: new Date(form.data + 'T12:00:00') });
      setModal(false);
      setForm(EMPTY);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const { entradas, saidas, saldo, dadosGrafico, movimentacoes } = useMemo(() => {
    const inicio = startOfMonth(mesAtual);
    const fim = endOfMonth(mesAtual);
    const doMes = fluxoCaixa.filter(f => {
      const d = toDate(f.data);
      return d >= inicio && d <= fim;
    });
    const entradas = doMes.filter(f => f.tipo === 'entrada').reduce((s, f) => s + (f.valor || 0), 0);
    const saidas = doMes.filter(f => f.tipo === 'saida').reduce((s, f) => s + (f.valor || 0), 0);
    const saldo = entradas - saidas;

    const dias = eachDayOfInterval({ start: inicio, end: fim });
    let saldoAcum = 0;
    const dadosGrafico = dias.map(dia => {
      const dStr = format(dia, 'yyyy-MM-dd');
      const e = doMes.filter(f => f.tipo === 'entrada' && (toDate(f.data) ? format(toDate(f.data), 'yyyy-MM-dd') : toDateString(f.data) || '') === dStr).reduce((s, f) => s + (f.valor || 0), 0);
      const s = doMes.filter(f => f.tipo === 'saida' && (toDate(f.data) ? format(toDate(f.data), 'yyyy-MM-dd') : toDateString(f.data) || '') === dStr).reduce((s, f) => s + (f.valor || 0), 0);
      saldoAcum += e - s;
      return { dia: format(dia, 'dd/MM'), entradas: e, saidas: s, saldo: saldoAcum };
    });

    const movimentacoes = [...doMes].sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
    return { entradas, saidas, saldo, dadosGrafico, movimentacoes };
  }, [fluxoCaixa, mesAtual]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Fluxo de Caixa</h2>
          <p className="text-sm text-slate-500 mt-0.5 capitalize">{format(mesAtual, 'MMMM yyyy', { locale: ptBR })}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={`${mesAtual.getFullYear()}-${String(mesAtual.getMonth()).padStart(2,'0')}`}
            onChange={e => { const [y, m] = e.target.value.split('-'); setMesAtual(new Date(parseInt(y), parseInt(m), 1)); }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date(new Date().getFullYear(), i, 1);
              return <option key={i} value={`${d.getFullYear()}-${String(i).padStart(2,'0')}`}>{format(d, 'MMMM yyyy', { locale: ptBR })}</option>;
            })}
          </select>
          <button onClick={() => setModal(true)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm shadow-blue-600/20">
            <Plus className="h-4 w-4" /> Lançamento
          </button>
        </div>
      </div>

      {/* Cards KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Entradas</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(entradas)}</p>
          </div>
          <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
            <ArrowUpRight className="h-5 w-5 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Saídas</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{formatCurrency(saidas)}</p>
          </div>
          <div className="w-11 h-11 bg-rose-100 rounded-xl flex items-center justify-center">
            <ArrowDownRight className="h-5 w-5 text-rose-600" />
          </div>
        </div>
        <div className={`rounded-2xl border shadow-sm p-5 flex items-start justify-between ${saldo >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Saldo</p>
            <p className={`text-2xl font-bold mt-1 ${saldo >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(saldo)}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${saldo >= 0 ? 'bg-emerald-200' : 'bg-rose-200'}`}>
            <DollarSign className={`h-5 w-5 ${saldo >= 0 ? 'text-emerald-700' : 'text-rose-700'}`} />
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Evolução do Saldo</h3>
        {dadosGrafico.some(d => d.entradas > 0 || d.saidas > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dadosGrafico}>
              <defs>
                <linearGradient id="gradSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="saldo" name="Saldo" stroke="#3b82f6" strokeWidth={2} fill="url(#gradSaldo)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-44 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhuma movimentação neste mês</p>
            </div>
          </div>
        )}
      </div>

      {/* Movimentações */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Movimentações do Mês</h3>
        </div>
        {movimentacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <DollarSign className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Nenhuma movimentação registrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Descrição</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Data</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Valor</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map(m => {
                  const dt = toDate(m.data);
                  return (
                    <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{m.descricao}</p>
                        {m.categoria && <p className="text-xs text-slate-400 mt-0.5">{m.categoria}</p>}
                      </td>
                      <td className="py-3 px-4 text-slate-600 hidden sm:table-cell">
                        {isNaN(dt) ? '—' : format(dt, 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m.tipo === 'entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {m.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${m.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {m.tipo === 'entrada' ? '+' : '-'}{formatCurrency(m.valor)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal lançamento */}
      {modal && (
        <Modal title="Novo Lançamento" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Tipo</label>
              <div className="grid grid-cols-2 gap-2">
                {['entrada', 'saida'].map(t => (
                  <button key={t} onClick={() => setForm(p => ({ ...p, tipo: t }))}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition ${form.tipo === t ? (t === 'entrada' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-rose-600 text-white border-rose-600') : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                    {t === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Descrição *</label>
              <input type="text" value={form.descricao} onChange={set('descricao')} placeholder="Ex: Pagamento de fornecedor" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Valor (R$) *</label>
                <input type="number" min="0" step="0.01" value={form.valor} onChange={set('valor')} placeholder="0,00" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Data</label>
                <input type="date" value={form.data} onChange={set('data')} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Observações</label>
              <textarea value={form.observacoes} onChange={set('observacoes')} rows={2} className={inputCls + ' resize-none'} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={salvar} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
