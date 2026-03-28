import { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelFirestoreContext';
import { Plus, X, Trash2, Pencil, Search, TrendingDown, Printer, CalendarDays } from 'lucide-react';
import { format, isToday, isYesterday, startOfDay, endOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils/formatters';
import { toDate } from '../utils/dateUtils';
import { inputCls, selectCls } from '../styles/formClasses';

const CATEGORIAS = ['Alimentação', 'Limpeza', 'Manutenção', 'Pessoal', 'Marketing', 'Utilidades', 'Administrativo', 'Outros'];
const STATUS_LIST = ['pendente', 'pago', 'cancelado'];
const STATUS_CFG = {
  pendente:  { label: 'Pendente',  cls: 'bg-amber-100 text-amber-700' },
  pago:      { label: 'Pago',      cls: 'bg-emerald-100 text-emerald-700' },
  cancelado: { label: 'Cancelado', cls: 'bg-red-100 text-red-700' },
};

const EMPTY = { descricao: '', categoria: 'Outros', valor: '', data: new Date().toISOString().split('T')[0], status: 'pendente', fornecedor: '', observacoes: '' };

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
  const [filtroRapido, setFiltroRapido] = useState('todos'); // 'todos' | 'hoje' | 'ontem' | 'periodo'
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  // Fornecedor
  const [buscaFornecedor, setBuscaFornecedor] = useState('');
  const [showFornecedorList, setShowFornecedorList] = useState(false);
  const [modalNovoFornecedor, setModalNovoFornecedor] = useState(false);
  const [novoFornForm, setNovoFornForm] = useState({ nome: '', telefone: '', email: '', cnpj: '' });
  const [salvandoForn, setSalvandoForn] = useState(false);

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
      if (filtroRapido === 'hoje') {
        matchData = dt && isToday(dt);
      } else if (filtroRapido === 'ontem') {
        matchData = dt && isYesterday(dt);
      } else if (filtroRapido === 'periodo' && (dataInicio || dataFim)) {
        if (dt) {
          const dtStart = startOfDay(dt);
          if (dataInicio) matchData = matchData && dtStart >= startOfDay(new Date(dataInicio + 'T12:00:00'));
          if (dataFim) matchData = matchData && dtStart <= endOfDay(new Date(dataFim + 'T12:00:00'));
        } else {
          matchData = false;
        }
      }

      return matchBusca && matchStatus && matchCat && matchData;
    }).sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
  }, [despesas, busca, filtroStatus, filtroCategoria, filtroRapido, dataInicio, dataFim]);

  const totalFiltrado = despesasFiltradas.reduce((s, d) => s + (d.valor || 0), 0);
  const totalPendente = despesas.filter(d => d.status === 'pendente').reduce((s, d) => s + (d.valor || 0), 0);
  const totalPago = despesas.filter(d => d.status === 'pago').reduce((s, d) => s + (d.valor || 0), 0);

  const imprimir = () => {
    const linhas = despesasFiltradas.map(d => {
      const dt = toDate(d.data);
      const dtStr = dt ? format(dt, 'dd/MM/yyyy', { locale: ptBR }) : '—';
      const cfg = STATUS_CFG[d.status] || STATUS_CFG.pendente;
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${d.descricao}${d.fornecedor ? `<br><small style="color:#94a3b8">${d.fornecedor}</small>` : ''}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${d.categoria}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${dtStr}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${cfg.label}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:bold;">${formatCurrency(d.valor)}</td>
      </tr>`;
    }).join('');

    const periodoLabel = filtroRapido === 'hoje' ? 'Hoje' :
      filtroRapido === 'ontem' ? 'Ontem' :
      filtroRapido === 'periodo' && (dataInicio || dataFim) ? `${dataInicio ? format(new Date(dataInicio + 'T12:00:00'), 'dd/MM/yyyy') : '—'} a ${dataFim ? format(new Date(dataFim + 'T12:00:00'), 'dd/MM/yyyy') : '—'}` :
      'Todos os períodos';

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Despesas — Hotel Fácil</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; margin: 0; padding: 24px; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    .sub { color: #64748b; font-size: 12px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #64748b; border-bottom: 2px solid #e2e8f0; }
    tfoot td { padding: 10px 12px; font-weight: bold; border-top: 2px solid #e2e8f0; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Relatório de Despesas</h1>
  <p class="sub">Período: ${periodoLabel} &nbsp;|&nbsp; Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} &nbsp;|&nbsp; ${despesasFiltradas.length} registros</p>
  <table>
    <thead>
      <tr>
        <th>Descrição</th>
        <th>Categoria</th>
        <th>Data</th>
        <th>Status</th>
        <th style="text-align:right">Valor</th>
      </tr>
    </thead>
    <tbody>${linhas}</tbody>
    <tfoot>
      <tr>
        <td colspan="4">Total</td>
        <td style="text-align:right">${formatCurrency(totalFiltrado)}</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Despesas</h2>
          <p className="text-sm text-slate-500 mt-0.5">{despesas.length} despesas cadastradas</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={imprimir}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition">
            <Printer className="h-4 w-4" /> Imprimir
          </button>
          <button onClick={abrirNovo}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm shadow-blue-600/20">
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

      {/* Filtros rápidos de período */}
      <div className="flex flex-wrap items-center gap-2">
        <CalendarDays className="h-4 w-4 text-slate-400 flex-shrink-0" />
        {[
          { id: 'todos', label: 'Todos' },
          { id: 'hoje', label: 'Hoje' },
          { id: 'ontem', label: 'Ontem' },
          { id: 'periodo', label: 'Período' },
        ].map(f => (
          <button key={f.id} onClick={() => aplicarFiltroRapido(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              filtroRapido === f.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
            }`}>
            {f.label}
          </button>
        ))}

        {/* Campos de período */}
        {filtroRapido === 'periodo' && (
          <div className="flex items-center gap-2 flex-wrap">
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            <span className="text-xs text-slate-400">até</span>
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
        <input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar descrição ou fornecedor..."
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Descrição</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Categoria</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Data</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Valor</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {despesasFiltradas.map(d => {
                  const dt = toDate(d.data);
                  const hoje = new Date(); hoje.setHours(0,0,0,0);
                  const vencida = d.status === 'pendente' && dt && dt < hoje;
                  const cfg = vencida
                    ? { label: 'Vencida', cls: 'bg-red-100 text-red-700' }
                    : (STATUS_CFG[d.status] || STATUS_CFG.pendente);
                  return (
                    <tr key={d.id} className={`border-b transition-colors ${
                      vencida ? 'bg-red-50 hover:bg-red-100 border-red-100' : 'border-slate-50 hover:bg-slate-50'
                    }`}>
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
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                      </td>
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
        <Modal title={editId ? 'Editar Despesa' : 'Nova Despesa'} onClose={fechar}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Descrição *</label>
              <input type="text" value={form.descricao} onChange={set('descricao')} placeholder="Ex: Compra de produtos de limpeza" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Categoria</label>
                <select value={form.categoria} onChange={set('categoria')} className={selectCls}>
                  {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Status</label>
                <select value={form.status} onChange={set('status')} className={selectCls}>
                  {STATUS_LIST.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
                </select>
              </div>
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Fornecedor</label>
                <button
                  type="button"
                  onClick={() => { setNovoFornForm({ nome: '', telefone: '', email: '', cnpj: '' }); setModalNovoFornecedor(true); }}
                  className="text-xs text-blue-600 hover:underline"
                >+ Cadastrar fornecedor</button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={buscaFornecedor || form.fornecedor}
                  onChange={e => { setBuscaFornecedor(e.target.value); setForm(p => ({ ...p, fornecedor: e.target.value })); setShowFornecedorList(true); }}
                  onFocus={() => setShowFornecedorList(true)}
                  onBlur={() => setTimeout(() => setShowFornecedorList(false), 200)}
                  placeholder="Buscar ou digitar fornecedor..."
                  className={inputCls}
                />
                {showFornecedorList && (fornecedores || []).filter(f => !buscaFornecedor || f.nome?.toLowerCase().includes(buscaFornecedor.toLowerCase())).length > 0 && (
                  <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {(fornecedores || []).filter(f => !buscaFornecedor || f.nome?.toLowerCase().includes(buscaFornecedor.toLowerCase())).map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onMouseDown={() => { setForm(p => ({ ...p, fornecedor: f.nome })); setBuscaFornecedor(''); setShowFornecedorList(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm text-slate-800 border-b border-slate-50 last:border-0"
                      >
                        <span className="font-medium">{f.nome}</span>
                        {f.cnpj && <span className="text-xs text-slate-400 ml-2">{f.cnpj}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Observações</label>
              <textarea value={form.observacoes} onChange={set('observacoes')} rows={2} className={inputCls + ' resize-none'} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={fechar} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={salvar} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal excluir */}
      {modal === 'excluir' && (
        <Modal title="Excluir Despesa" onClose={fechar}>
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-7 w-7 text-red-600" />
            </div>
            <p className="text-slate-700 font-medium mb-1">Tem certeza que deseja excluir esta despesa?</p>
            <p className="text-sm text-slate-500 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={fechar} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={confirmarExcluir} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition disabled:opacity-50">
                {saving ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal cadastro rápido de fornecedor */}
      {modalNovoFornecedor && (
        <Modal title="Cadastrar Fornecedor" onClose={() => setModalNovoFornecedor(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nome *</label>
              <input
                type="text"
                value={novoFornForm.nome}
                onChange={e => setNovoFornForm(p => ({ ...p, nome: e.target.value.toUpperCase() }))}
                placeholder="NOME DO FORNECEDOR"
                className={inputCls}
                style={{ textTransform: 'uppercase' }}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">CNPJ</label>
                <input type="text" value={novoFornForm.cnpj} onChange={e => setNovoFornForm(p => ({ ...p, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Telefone</label>
                <input type="text" value={novoFornForm.telefone} onChange={e => setNovoFornForm(p => ({ ...p, telefone: e.target.value }))} placeholder="(00) 00000-0000" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">E-mail</label>
              <input type="email" value={novoFornForm.email} onChange={e => setNovoFornForm(p => ({ ...p, email: e.target.value }))} placeholder="email@fornecedor.com" className={inputCls} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalNovoFornecedor(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
              <button
                disabled={salvandoForn || !novoFornForm.nome.trim()}
                onClick={async () => {
                  setSalvandoForn(true);
                  try {
                    await adicionarFornecedor(novoFornForm);
                    setForm(p => ({ ...p, fornecedor: novoFornForm.nome }));
                    setModalNovoFornecedor(false);
                  } catch(e) { alert('Erro ao salvar fornecedor: ' + e.message); }
                  finally { setSalvandoForn(false); }
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50"
              >
                {salvandoForn ? 'Salvando...' : 'Salvar Fornecedor'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
