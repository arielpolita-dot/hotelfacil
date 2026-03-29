import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Plus, BedDouble, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import {
  Button, Input, Select, Textarea, Badge, Spinner,
  FormField, SearchInput, FilterPills,
  Card, Modal, DeleteDialog, PageHeader, EmptyState,
} from '../../components/ds';

const STATUS_CFG = {
  disponivel: { label: 'Disponivel', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  ocupado:    { label: 'Ocupado',    cls: 'bg-blue-100 text-blue-700 border-blue-200',         dot: 'bg-blue-500' },
  reservado:  { label: 'Reservado',  cls: 'bg-violet-100 text-violet-700 border-violet-200',   dot: 'bg-violet-500' },
  manutencao: { label: 'Manutencao', cls: 'bg-amber-100 text-amber-700 border-amber-200',      dot: 'bg-amber-500' },
  limpeza:    { label: 'Limpeza',    cls: 'bg-sky-100 text-sky-700 border-sky-200',            dot: 'bg-sky-500' },
};

const TIPOS = ['Standard', 'Superior', 'Deluxe', 'Suite', 'Suite Presidencial', 'Familiar'];
const STATUS_LIST = Object.keys(STATUS_CFG);

const EMPTY = { numero: '', tipo: 'Standard', capacidade: 2, precoDiaria: '', status: 'disponivel', descricao: '', andar: '' };


export default function Quartos() {
  const { quartos, adicionarQuarto, atualizarQuarto, removerQuarto, loading } = useHotel();
  const [modal, setModal] = useState(null); // null | 'novo' | 'editar' | 'excluir'
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [excluirId, setExcluirId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const abrirNovo = () => { setForm(EMPTY); setModal('novo'); };
  const abrirEditar = (q) => { setForm({ ...q }); setEditId(q.id); setModal('editar'); };
  const abrirExcluir = (id) => { setExcluirId(id); setModal('excluir'); };
  const fechar = () => { setModal(null); setEditId(null); setExcluirId(null); };

  const salvar = async () => {
    if (!form.numero || !form.precoDiaria) return;
    setSaving(true);
    try {
      const dados = { ...form, precoDiaria: parseFloat(form.precoDiaria), capacidade: parseInt(form.capacidade) };
      if (modal === 'novo') await adicionarQuarto(dados);
      else await atualizarQuarto(editId, dados);
      fechar();
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const confirmarExcluir = async () => {
    setSaving(true);
    try { await removerQuarto(excluirId); fechar(); } catch (e) { console.error(e); }
    setSaving(false);
  };

  const quartosFiltrados = useMemo(() => quartos.filter(q => {
    const matchBusca = !busca || q.numero?.toString().includes(busca) || q.tipo?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || q.status === filtroStatus;
    return matchBusca && matchStatus;
  }), [quartos, busca, filtroStatus]);

  const countStatus = (s) => quartos.filter(q => q.status === s).length;

  const filterOptions = [
    { key: 'todos', label: 'Todos', count: quartos.length },
    ...STATUS_LIST.map(s => ({ key: s, label: STATUS_CFG[s].label, count: countStatus(s) })),
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Quartos"
        subtitle={`${quartos.length} quartos cadastrados`}
        actions={
          <Button variant="primary" icon={Plus} onClick={abrirNovo}>
            Novo Quarto
          </Button>
        }
      />

      {/* Filtros rapidos */}
      <FilterPills options={filterOptions} value={filtroStatus} onChange={setFiltroStatus} />

      {/* Busca */}
      <SearchInput
        value={busca}
        onChange={setBusca}
        placeholder="Buscar por numero ou tipo..."
        className="max-w-xs"
      />

      {/* Grid de quartos */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner />
        </div>
      ) : quartosFiltrados.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          message="Nenhum quarto encontrado"
          subMessage="Tente ajustar os filtros ou cadastre um novo quarto"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quartosFiltrados.map(q => {
            const cfg = STATUS_CFG[q.status] || STATUS_CFG.disponivel;
            return (
              <Card key={q.id} padding="md" className="flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-900">Quarto {q.numero}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{q.tipo} · {q.andar ? `${q.andar}° andar` : ''}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.dot.replace('bg-', 'bg-').replace('500', '100')}`}>
                    <BedDouble className={`h-5 w-5 ${cfg.dot.replace('bg-', 'text-')}`} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <Badge className={cfg.cls}>{cfg.label}</Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Capacidade</span>
                  <span className="font-semibold text-slate-900">{q.capacidade} pax</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Diaria</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(q.precoDiaria)}
                  </span>
                </div>

                {q.descricao && (
                  <p className="text-xs text-slate-400 line-clamp-2">{q.descricao}</p>
                )}

                <div className="flex gap-2 mt-auto pt-2 border-t border-slate-50">
                  <Button variant="secondary" size="xs" icon={Pencil} onClick={() => abrirEditar(q)} className="flex-1">
                    Editar
                  </Button>
                  <Button variant="ghost" size="xs" icon={Trash2} onClick={() => abrirExcluir(q.id)} className="flex-1 text-slate-600 hover:text-red-600 hover:bg-red-50">
                    Excluir
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Novo / Editar */}
      <Modal open={modal === 'novo' || modal === 'editar'} onClose={fechar} title={modal === 'novo' ? 'Novo Quarto' : 'Editar Quarto'}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Numero" required>
                <Input type="text" value={form.numero} onChange={set('numero')} placeholder="Ex: 101" />
              </FormField>
              <FormField label="Andar">
                <Input type="text" value={form.andar} onChange={set('andar')} placeholder="Ex: 1" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tipo">
                <Select value={form.tipo} onChange={set('tipo')}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </Select>
              </FormField>
              <FormField label="Capacidade (pax)">
                <Input type="number" min="1" value={form.capacidade} onChange={set('capacidade')} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Diaria (R$)" required>
                <Input type="number" min="0" step="0.01" value={form.precoDiaria} onChange={set('precoDiaria')} placeholder="0,00" />
              </FormField>
              <FormField label="Status">
                <Select value={form.status} onChange={set('status')}>
                  {STATUS_LIST.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
                </Select>
              </FormField>
            </div>
            {/* Periodo de manutencao — aparece apenas quando status = manutencao */}
            {form.status === 'manutencao' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-800 inline-block"></span>
                  Periodo de Manutencao
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Inicio da Manutencao">
                    <Input
                      type="date"
                      value={form.manutencaoInicio || ''}
                      onChange={set('manutencaoInicio')}
                    />
                  </FormField>
                  <FormField label="Fim da Manutencao">
                    <Input
                      type="date"
                      value={form.manutencaoFim || ''}
                      onChange={set('manutencaoFim')}
                    />
                  </FormField>
                </div>
                <FormField label="Motivo da Manutencao">
                  <Input
                    type="text"
                    value={form.manutencaoMotivo || ''}
                    onChange={set('manutencaoMotivo')}
                    placeholder="Ex: Reparo no ar-condicionado, pintura..."
                  />
                </FormField>
              </div>
            )}

            <FormField label="Descricao">
              <Textarea value={form.descricao} onChange={set('descricao')} rows={3} placeholder="Comodidades, caracteristicas..." />
            </FormField>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={fechar} fullWidth>Cancelar</Button>
              <Button variant="primary" onClick={salvar} loading={saving} fullWidth>
                Salvar
              </Button>
            </div>
          </div>
      </Modal>

      {/* Modal Excluir */}
      <DeleteDialog
        open={modal === 'excluir'}
        onClose={fechar}
        onConfirm={confirmarExcluir}
        entityName="quarto"
        loading={saving}
      />
    </div>
  );
}
