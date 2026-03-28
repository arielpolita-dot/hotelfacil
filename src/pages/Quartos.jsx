import { useState } from 'react';
import { useHotel } from '../context/HotelFirestoreContext';
import { Plus, BedDouble, Pencil, Trash2, X, Search, Filter } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { inputCls, selectCls } from '../styles/formClasses';

const STATUS_CFG = {
  disponivel: { label: 'Disponível', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  ocupado:    { label: 'Ocupado',    cls: 'bg-blue-100 text-blue-700 border-blue-200',         dot: 'bg-blue-500' },
  reservado:  { label: 'Reservado',  cls: 'bg-violet-100 text-violet-700 border-violet-200',   dot: 'bg-violet-500' },
  manutencao: { label: 'Manutenção', cls: 'bg-amber-100 text-amber-700 border-amber-200',      dot: 'bg-amber-500' },
  limpeza:    { label: 'Limpeza',    cls: 'bg-sky-100 text-sky-700 border-sky-200',            dot: 'bg-sky-500' },
};

const TIPOS = ['Standard', 'Superior', 'Deluxe', 'Suite', 'Suite Presidencial', 'Familiar'];
const STATUS_LIST = Object.keys(STATUS_CFG);

const EMPTY = { numero: '', tipo: 'Standard', capacidade: 2, precoDiaria: '', status: 'disponivel', descricao: '', andar: '' };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition p-1 rounded-lg hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

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

  const quartosFiltrados = quartos.filter(q => {
    const matchBusca = !busca || q.numero?.toString().includes(busca) || q.tipo?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || q.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const countStatus = (s) => quartos.filter(q => q.status === s).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quartos</h2>
          <p className="text-sm text-slate-500 mt-0.5">{quartos.length} quartos cadastrados</p>
        </div>
        <button
          onClick={abrirNovo}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm shadow-blue-600/20"
        >
          <Plus className="h-4 w-4" />
          Novo Quarto
        </button>
      </div>

      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-2">
        {['todos', ...STATUS_LIST].map(s => {
          const cfg = STATUS_CFG[s];
          const count = s === 'todos' ? quartos.length : countStatus(s);
          return (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                filtroStatus === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {cfg && <div className={`w-1.5 h-1.5 rounded-full ${filtroStatus === s ? 'bg-white' : cfg.dot}`} />}
              {cfg ? cfg.label : 'Todos'} ({count})
            </button>
          );
        })}
      </div>

      {/* Busca */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por número ou tipo..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* Grid de quartos */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : quartosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <BedDouble className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Nenhum quarto encontrado</p>
          <p className="text-xs mt-1">Tente ajustar os filtros ou cadastre um novo quarto</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quartosFiltrados.map(q => {
            const cfg = STATUS_CFG[q.status] || STATUS_CFG.disponivel;
            return (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
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
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>{cfg.label}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Capacidade</span>
                  <span className="font-semibold text-slate-900">{q.capacidade} pax</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Diária</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(q.precoDiaria)}
                  </span>
                </div>

                {q.descricao && (
                  <p className="text-xs text-slate-400 line-clamp-2">{q.descricao}</p>
                )}

                <div className="flex gap-2 mt-auto pt-2 border-t border-slate-50">
                  <button
                    onClick={() => abrirEditar(q)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 py-2 rounded-xl transition"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => abrirExcluir(q.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-50 hover:bg-red-50 py-2 rounded-xl transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Novo / Editar */}
      {(modal === 'novo' || modal === 'editar') && (
        <Modal title={modal === 'novo' ? 'Novo Quarto' : 'Editar Quarto'} onClose={fechar}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Número *">
                <input type="text" value={form.numero} onChange={set('numero')} placeholder="Ex: 101" className={inputCls} />
              </Field>
              <Field label="Andar">
                <input type="text" value={form.andar} onChange={set('andar')} placeholder="Ex: 1" className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tipo">
                <select value={form.tipo} onChange={set('tipo')} className={selectCls}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Capacidade (pax)">
                <input type="number" min="1" value={form.capacidade} onChange={set('capacidade')} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Diária (R$) *">
                <input type="number" min="0" step="0.01" value={form.precoDiaria} onChange={set('precoDiaria')} placeholder="0,00" className={inputCls} />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={set('status')} className={selectCls}>
                  {STATUS_LIST.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
                </select>
              </Field>
            </div>
            {/* Período de manutenção — aparece apenas quando status = manutencao */}
            {form.status === 'manutencao' && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-800 inline-block"></span>
                  Período de Manutenção
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Inicio da Manutenção">
                    <input
                      type="date"
                      value={form.manutencaoInicio || ''}
                      onChange={set('manutencaoInicio')}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Fim da Manutenção">
                    <input
                      type="date"
                      value={form.manutencaoFim || ''}
                      onChange={set('manutencaoFim')}
                      className={inputCls}
                    />
                  </Field>
                </div>
                <Field label="Motivo da Manutenção">
                  <input
                    type="text"
                    value={form.manutencaoMotivo || ''}
                    onChange={set('manutencaoMotivo')}
                    placeholder="Ex: Reparo no ar-condicionado, pintura..."
                    className={inputCls}
                  />
                </Field>
              </div>
            )}

            <Field label="Descrição">
              <textarea value={form.descricao} onChange={set('descricao')} rows={3} placeholder="Comodidades, características..." className={inputCls + ' resize-none'} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button onClick={fechar} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={salvar} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Excluir */}
      {modal === 'excluir' && (
        <Modal title="Excluir Quarto" onClose={fechar}>
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-7 w-7 text-red-600" />
            </div>
            <p className="text-slate-700 font-medium mb-1">Tem certeza que deseja excluir este quarto?</p>
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
    </div>
  );
}
