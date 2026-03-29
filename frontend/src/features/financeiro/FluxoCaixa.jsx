import { toDate, toDateString } from '../../utils/dateUtils';
import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import {
  Button, Input, Select, Textarea, Spinner,
  Card, CardHeader, Modal, EmptyState, StatusBadge, PageHeader,
  DataTable, TableHeader, TableHead, TableRow, TableCell,
} from '../../components/ds';

const EMPTY = { tipo: 'entrada', descricao: '', valor: '', data: new Date().toISOString().split('T')[0], categoria: 'Outros', observacoes: '' };

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
      <PageHeader
        title="Fluxo de Caixa"
        subtitle={format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
        actions={
          <>
            <Select
              value={`${mesAtual.getFullYear()}-${String(mesAtual.getMonth()).padStart(2,'0')}`}
              onChange={e => { const [y, m] = e.target.value.split('-'); setMesAtual(new Date(parseInt(y), parseInt(m), 1)); }}
              className="w-auto"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const d = new Date(new Date().getFullYear(), i, 1);
                return <option key={i} value={`${d.getFullYear()}-${String(i).padStart(2,'0')}`}>{format(d, 'MMMM yyyy', { locale: ptBR })}</option>;
              })}
            </Select>
            <Button variant="primary" icon={Plus} onClick={() => setModal(true)}>
              Lançamento
            </Button>
          </>
        }
      />

      {/* Cards KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Entradas</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(entradas)}</p>
          </div>
          <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
            <ArrowUpRight className="h-5 w-5 text-emerald-600" />
          </div>
        </Card>
        <Card padding="md" className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Saídas</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{formatCurrency(saidas)}</p>
          </div>
          <div className="w-11 h-11 bg-rose-100 rounded-xl flex items-center justify-center">
            <ArrowDownRight className="h-5 w-5 text-rose-600" />
          </div>
        </Card>
        <Card padding="md" className={`flex items-start justify-between ${saldo >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Saldo</p>
            <p className={`text-2xl font-bold mt-1 ${saldo >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(saldo)}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${saldo >= 0 ? 'bg-emerald-200' : 'bg-rose-200'}`}>
            <DollarSign className={`h-5 w-5 ${saldo >= 0 ? 'text-emerald-700' : 'text-rose-700'}`} />
          </div>
        </Card>
      </div>

      {/* Gráfico */}
      <Card padding="md">
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
          <EmptyState icon={TrendingUp} message="Nenhuma movimentação neste mês" />
        )}
      </Card>

      {/* Movimentações */}
      <DataTable>
        <CardHeader>
          <h3 className="text-sm font-bold text-slate-900">Movimentações do Mês</h3>
        </CardHeader>
        {movimentacoes.length === 0 ? (
          <EmptyState icon={DollarSign} message="Nenhuma movimentação registrada" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <TableHeader>
                <TableHead>Descrição</TableHead>
                <TableHead className="hidden sm:table-cell">Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead align="right">Valor</TableHead>
              </TableHeader>
              <tbody>
                {movimentacoes.map(m => {
                  const dt = toDate(m.data);
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <p className="font-semibold text-slate-900">{m.descricao}</p>
                        {m.categoria && <p className="text-xs text-slate-400 mt-0.5">{m.categoria}</p>}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {isNaN(dt) ? '—' : format(dt, 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={m.tipo} />
                      </TableCell>
                      <TableCell align="right" className={`font-bold ${m.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {m.tipo === 'entrada' ? '+' : '-'}{formatCurrency(m.valor)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DataTable>

      {/* Modal lançamento */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Novo Lançamento"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setModal(false)}>Cancelar</Button>
            <Button variant="primary" fullWidth onClick={salvar} loading={saving}>Salvar</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {['entrada', 'saida'].map(t => (
                <Button
                  key={t}
                  variant={form.tipo === t ? (t === 'entrada' ? 'success' : 'danger') : 'secondary'}
                  fullWidth
                  onClick={() => setForm(p => ({ ...p, tipo: t }))}
                >
                  {t === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Descrição *</label>
            <Input type="text" value={form.descricao} onChange={set('descricao')} placeholder="Ex: Pagamento de fornecedor" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Valor (R$) *</label>
              <Input type="number" min="0" step="0.01" value={form.valor} onChange={set('valor')} placeholder="0,00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Data</label>
              <Input type="date" value={form.data} onChange={set('data')} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Observações</label>
            <Textarea value={form.observacoes} onChange={set('observacoes')} rows={2} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
