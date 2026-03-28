import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Plus, Trash2, Search, TrendingDown, Printer, CalendarDays } from 'lucide-react';
import { format, isToday, isYesterday, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../../utils/formatters';
import { toDate } from '../../utils/dateUtils';
import { Modal } from '../../components/ds';
import { DespesaFormModal, CATEGORIAS, STATUS_LIST, STATUS_CFG } from './DespesaFormModal';
import { printDespesasReport } from './DespesaPrintReport';

const EMPTY = { descricao: '', categoria: 'Outros', valor: '', data: new Date().toISOString().split('T')[0], status: 'pendente', fornecedor: '', observacoes: '' };

export default function Despesas() {
  const { despesas, fornecedores, adicionarDespesa, atualizarDespesa, removerDespesa, adicionarFornecedor, loading } = useHotel();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [excluirId, setExcluirId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroRapido, setFiltroRapido] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const abrirNovo = () => { setForm(EMPTY); setEditId(null); setModal('form'); };
  const abrirEditar = (d) => {
    setForm({ ...d, data: toDate(d.data) ? format(toDate(d.data), 'yyyy-MM-dd') : (d.data || '').split('T')[0] });
    setEditId(d.id); setModal('form');
  };
  const fechar = () => { setModal(null); setEditId(null); setExcluirId(null); };

  const salvar = async () => {
    if (!form.descricao || !form.valor) return;
    setSaving(true);
    try {
      const dados = { ...form, valor: parseFloat(form.valor), data: new Date(form.data + 'T12:00:00') };
      if (editId) await atualizarDespesa(editId, dados);
      else await adicionarDespesa(dados);
      fechar();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const confirmarExcluir = async () => {
    setSaving(true);
    try { await removerDespesa(excluirId); fechar(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const aplicarFiltroRapido = (tipo) => {
    setFiltroRapido(tipo);
    if (tipo !== 'periodo') { setDataInicio(''); setDataFim(''); }
  };

  const despesasFiltradas = useMemo(() => {
    return despesas.filter(d => {
      const matchBusca = !busca || (d.descricao || '').toLowerCase().includes(busca.toLowerCase()) || (d.fornecedor || '').toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === 'todos' || d.status === filtroStatus;
      const matchCat = filtroCategoria === 'todas' || d.categoria === filtroCategoria;
      const dt = toDate(d.data);
      let matchData = true;
      if (filtroRapido === 'hoje') { matchData = dt && isToday(dt); }
      else if (filtroRapido === 'ontem') { matchData = dt && isYesterday(dt); }
      else if (filtroRapido === 'periodo' && (dataInicio || dataFim)) {
        if (dt) {
          const dtStart = startOfDay(dt);
          if (dataInicio) matchData = matchData && dtStart >= startOfDay(new Date(dataInicio + 'T12:00:00'));
          if (dataFim) matchData = matchData && dtStart <= endOfDay(new Date(dataFim + 'T12:00:00'));
        } else { matchData = false; }
      }
      return matchBusca && matchStatus && matchCat && matchData;
    }).sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
  }, [despesas, busca, filtroStatus, filtroCategoria, filtroRapido, dataInicio, dataFim]);

  const totalFiltrado = despesasFiltradas.reduce((s, d) => s + (d.valor || 0), 0);
  const totalPendente = despesas.filter(d => d.status === 'pendente').reduce((s, d) => s + (d.valor || 0), 0);
  const totalPago = despesas.filter(d => d.status === 'pago').reduce((s, d) => s + (d.valor || 0), 0);

  const imprimir = () => printDespesasReport(despesasFiltradas, { filtroRapido, dataInicio, dataFim, totalFiltrado });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Despesas</h2>
          <p className="text-sm text-slate-500 mt-0.5">{despesas.length} despesas cadastradas</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={imprimir} className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition">
            <Printer className="h-4 w-4" /> Imprimir
          </button>
          <button onClick={abrirNovo} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm shadow-blue-600/20">
            <Plus className="h-4 w-4" /> Nova Despesa
          </button>
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Filtrado</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalFiltrado)}</p>
          <p className="text-xs text-slate-400 mt-0.5">{despesasFiltradas.length} registros</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pendente</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(totalPendente)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pago</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalPago)}</p>
        </div>
      </div>

      {/* Filtros rapidos de periodo */}
      <div className="flex flex-wrap items-center gap-2">
        <CalendarDays className="h-4 w-4 text-slate-400 flex-shrink-0" />
        {[{ id: 'todos', label: 'Todos' }, { id: 'hoje', label: 'Hoje' }, { id: 'ontem', label: 'Ontem' }, { id: 'periodo', label: 'Periodo' }].map(f => (
          <button key={f.id} onClick={() => aplicarFiltroRapido(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${filtroRapido === f.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
            {f.label}
          </button>
        ))}
        {filtroRapido === 'periodo' && (
          <div className="flex items-center gap-2 flex-wrap">
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            <span className="text-xs text-slate-400">ate</span>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
        )}
      </div>

      {/* Filtros de status e categoria */}
      <div className="flex flex-wrap gap-2">
        {['todos', ...STATUS_LIST].map(s => {
          const cfg = STATUS_CFG[s];
          return (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${filtroStatus === s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
              {cfg ? cfg.label : 'Todos os status'}
            </button>
          );
        })}
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
          <option value="todas">Todas as categorias</option>
          {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Busca */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar descricao ou fornecedor..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : despesasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <TrendingDown className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Nenhuma despesa encontrada</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Descricao</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Categoria</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Data</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Valor</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {despesasFiltradas.map(d => {
                  const dt = toDate(d.data);
                  const hoje = new Date(); hoje.setHours(0,0,0,0);
                  const vencida = d.status === 'pendente' && dt && dt < hoje;
                  const cfg = vencida ? { label: 'Vencida', cls: 'bg-red-100 text-red-700' } : (STATUS_CFG[d.status] || STATUS_CFG.pendente);
                  return (
                    <tr key={d.id} className={`border-b transition-colors ${vencida ? 'bg-red-50 hover:bg-red-100 border-red-100' : 'border-slate-50 hover:bg-slate-50'}`}>
                      <td className="py-3 px-4">
                        <p className={`font-semibold ${vencida ? 'text-red-800' : 'text-slate-900'}`}>{d.descricao}</p>
                        {d.fornecedor && <p className={`text-xs mt-0.5 ${vencida ? 'text-red-400' : 'text-slate-400'}`}>{d.fornecedor}</p>}
                        {vencida && <p className="text-xs text-red-500 font-medium mt-0.5">Vencida em {format(dt, 'dd/MM/yyyy', { locale: ptBR })}</p>}
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${vencida ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{d.categoria}</span>
                      </td>
                      <td className={`py-3 px-4 hidden md:table-cell ${vencida ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                        {dt && !isNaN(dt) ? format(dt, 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                      </td>
                      <td className="py-3 px-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span></td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatCurrency(d.valor)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => abrirEditar(d)} className="text-xs text-blue-600 hover:underline font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition">Editar</button>
                          <button onClick={() => { setExcluirId(d.id); setModal('excluir'); }} className="text-xs text-red-500 hover:underline font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition">Excluir</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td colSpan={4} className="py-3 px-4 text-sm font-bold text-slate-700">Total ({despesasFiltradas.length} registros)</td>
                  <td className="py-3 px-4 text-right text-sm font-bold text-slate-900">{formatCurrency(totalFiltrado)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Modal form */}
      {modal === 'form' && (
        <DespesaFormModal
          open={true} onClose={fechar} form={form} set={set}
          onSave={salvar} saving={saving}
          fornecedores={fornecedores} adicionarFornecedor={adicionarFornecedor}
        />
      )}

      {/* Modal excluir */}
      <Modal open={modal === 'excluir'} onClose={fechar} title="Excluir Despesa">
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trash2 className="h-7 w-7 text-red-600" />
          </div>
          <p className="text-slate-700 font-medium mb-1">Tem certeza que deseja excluir esta despesa?</p>
          <p className="text-sm text-slate-500 mb-6">Esta acao nao pode ser desfeita.</p>
          <div className="flex gap-3">
            <button onClick={fechar} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
            <button onClick={confirmarExcluir} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-50">
              {saving ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
