import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Plus, TrendingDown, Printer, CalendarDays } from 'lucide-react';
import { format, isToday, isYesterday, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../../utils/formatters';
import { toDate } from '../../utils/dateUtils';
import {
  Button, Badge, Spinner,
  SearchInput, FilterPills, StatCard,
  DataTable, TableHeader, TableHead, TableRow, TableCell,
  DeleteDialog, PageHeader, EmptyState,
} from '../../components/ds';
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

  const periodoPills = [
    { key: 'todos', label: 'Todos' },
    { key: 'hoje', label: 'Hoje' },
    { key: 'ontem', label: 'Ontem' },
    { key: 'periodo', label: 'Periodo' },
  ];

  const statusPills = [
    { key: 'todos', label: 'Todos os status' },
    ...STATUS_LIST.map(s => ({ key: s, label: STATUS_CFG[s]?.label || s })),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Despesas"
        subtitle={`${despesas.length} despesas cadastradas`}
        actions={
          <>
            <Button variant="secondary" icon={Printer} onClick={imprimir}>Imprimir</Button>
            <Button variant="primary" icon={Plus} onClick={abrirNovo}>Nova Despesa</Button>
          </>
        }
      />

      {/* Cards resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Filtrado" value={formatCurrency(totalFiltrado)} sub={`${despesasFiltradas.length} registros`} />
        <StatCard title="Pendente" value={formatCurrency(totalPendente)} color="warning" />
        <StatCard title="Pago" value={formatCurrency(totalPago)} color="success" />
      </div>

      {/* Filtros rapidos de periodo */}
      <div className="flex flex-wrap items-center gap-2">
        <CalendarDays className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <FilterPills options={periodoPills} value={filtroRapido} onChange={aplicarFiltroRapido} />
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
        <FilterPills options={statusPills} value={filtroStatus} onChange={setFiltroStatus} />
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
          <option value="todas">Todas as categorias</option>
          {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Busca */}
      <SearchInput
        value={busca}
        onChange={setBusca}
        placeholder="Buscar descricao ou fornecedor..."
        className="max-w-xs"
      />

      {/* Tabela */}
      {loading ? (
        <Spinner size="md" />
      ) : despesasFiltradas.length === 0 ? (
        <EmptyState icon={TrendingDown} message="Nenhuma despesa encontrada" />
      ) : (
        <DataTable>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <TableHeader>
                <TableHead>Descricao</TableHead>
                <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead align="right">Valor</TableHead>
                <TableHead align="center">Acoes</TableHead>
              </TableHeader>
              <tbody>
                {despesasFiltradas.map(d => {
                  const dt = toDate(d.data);
                  const hoje = new Date(); hoje.setHours(0,0,0,0);
                  const vencida = d.status === 'pendente' && dt && dt < hoje;
                  const cfg = vencida ? { label: 'Vencida', cls: 'bg-red-100 text-red-700' } : (STATUS_CFG[d.status] || STATUS_CFG.pendente);
                  return (
                    <TableRow key={d.id} className={vencida ? 'bg-red-50 hover:bg-red-100 border-red-100' : undefined}>
                      <TableCell>
                        <p className={`font-semibold ${vencida ? 'text-red-800' : 'text-slate-900'}`}>{d.descricao}</p>
                        {d.fornecedor && <p className={`text-xs mt-0.5 ${vencida ? 'text-red-400' : 'text-slate-400'}`}>{d.fornecedor}</p>}
                        {vencida && <p className="text-xs text-red-500 font-medium mt-0.5">Vencida em {format(dt, 'dd/MM/yyyy', { locale: ptBR })}</p>}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={vencida ? 'danger' : 'default'}>{d.categoria}</Badge>
                      </TableCell>
                      <TableCell className={`hidden md:table-cell ${vencida ? 'text-red-600 font-semibold' : ''}`}>
                        {dt && !isNaN(dt) ? format(dt, 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={vencida ? 'danger' : d.status === 'pago' ? 'success' : d.status === 'cancelado' ? 'default' : 'warning'}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell align="right" className="font-bold text-slate-900">{formatCurrency(d.valor)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="link" size="xs" onClick={() => abrirEditar(d)}>Editar</Button>
                          <Button variant="link" size="xs" className="text-red-500 hover:text-red-700" onClick={() => { setExcluirId(d.id); setModal('excluir'); }}>Excluir</Button>
                        </div>
                      </TableCell>
                    </TableRow>
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
        </DataTable>
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
      <DeleteDialog
        open={modal === 'excluir'}
        onClose={fechar}
        onConfirm={confirmarExcluir}
        entityName="despesa"
        loading={saving}
      />
    </div>
  );
}
