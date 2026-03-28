import React, { useState } from 'react';
import { Modal } from '../../components/ds';
import { inputCls, selectCls } from '../../styles/formClasses';

const CATEGORIAS = ['Alimentacao', 'Limpeza', 'Manutencao', 'Pessoal', 'Marketing', 'Utilidades', 'Administrativo', 'Outros'];
const STATUS_LIST = ['pendente', 'pago', 'cancelado'];
const STATUS_CFG = {
  pendente:  { label: 'Pendente' },
  pago:      { label: 'Pago' },
  cancelado: { label: 'Cancelado' },
};

export { CATEGORIAS, STATUS_LIST, STATUS_CFG };

export function DespesaFormModal({
  open, onClose, form, set, onSave, saving,
  fornecedores, adicionarFornecedor,
}) {
  const [buscaFornecedor, setBuscaFornecedor] = useState('');
  const [showFornecedorList, setShowFornecedorList] = useState(false);
  const [modalNovoFornecedor, setModalNovoFornecedor] = useState(false);
  const [novoFornForm, setNovoFornForm] = useState({ nome: '', telefone: '', email: '', cnpj: '' });
  const [salvandoForn, setSalvandoForn] = useState(false);

  const fornecedoresFiltrados = (fornecedores || []).filter(
    f => !buscaFornecedor || f.nome?.toLowerCase().includes(buscaFornecedor.toLowerCase())
  );

  return (
    <>
      <Modal open={open} onClose={onClose} title={form.id ? 'Editar Despesa' : 'Nova Despesa'}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Descricao *</label>
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

          {/* Fornecedor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Fornecedor</label>
              <button type="button"
                onClick={() => { setNovoFornForm({ nome: '', telefone: '', email: '', cnpj: '' }); setModalNovoFornecedor(true); }}
                className="text-xs text-blue-600 hover:underline">+ Cadastrar fornecedor</button>
            </div>
            <div className="relative">
              <input type="text"
                value={buscaFornecedor || form.fornecedor}
                onChange={e => { setBuscaFornecedor(e.target.value); set('fornecedor')({ target: { value: e.target.value } }); setShowFornecedorList(true); }}
                onFocus={() => setShowFornecedorList(true)}
                onBlur={() => setTimeout(() => setShowFornecedorList(false), 200)}
                placeholder="Buscar ou digitar fornecedor..." className={inputCls} />
              {showFornecedorList && fornecedoresFiltrados.length > 0 && (
                <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {fornecedoresFiltrados.map(f => (
                    <button key={f.id} type="button"
                      onMouseDown={() => { set('fornecedor')({ target: { value: f.nome } }); setBuscaFornecedor(''); setShowFornecedorList(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm text-slate-800 border-b border-slate-50 last:border-0">
                      <span className="font-medium">{f.nome}</span>
                      {f.cnpj && <span className="text-xs text-slate-400 ml-2">{f.cnpj}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Observacoes</label>
            <textarea value={form.observacoes} onChange={set('observacoes')} rows={2} className={inputCls + ' resize-none'} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
            <button onClick={onSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal cadastro rapido de fornecedor */}
      <Modal open={modalNovoFornecedor} onClose={() => setModalNovoFornecedor(false)} title="Cadastrar Fornecedor">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nome *</label>
            <input type="text" value={novoFornForm.nome}
              onChange={e => setNovoFornForm(p => ({ ...p, nome: e.target.value.toUpperCase() }))}
              placeholder="NOME DO FORNECEDOR" className={inputCls} style={{ textTransform: 'uppercase' }} autoFocus />
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
            <button disabled={salvandoForn || !novoFornForm.nome.trim()}
              onClick={async () => {
                setSalvandoForn(true);
                try {
                  await adicionarFornecedor(novoFornForm);
                  set('fornecedor')({ target: { value: novoFornForm.nome } });
                  setModalNovoFornecedor(false);
                } catch(e) { alert('Erro ao salvar fornecedor: ' + e.message); }
                finally { setSalvandoForn(false); }
              }}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50">
              {salvandoForn ? 'Salvando...' : 'Salvar Fornecedor'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
