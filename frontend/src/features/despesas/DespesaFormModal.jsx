import React, { useState } from 'react';
import { Modal, Button, Input, Select, Textarea, FormField } from '../../components/ds';

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
          <FormField label="Descricao" required>
            <Input type="text" value={form.descricao} onChange={set('descricao')} placeholder="Ex: Compra de produtos de limpeza" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Categoria">
              <Select value={form.categoria} onChange={set('categoria')}>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </Select>
            </FormField>
            <FormField label="Status">
              <Select value={form.status} onChange={set('status')}>
                {STATUS_LIST.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Valor (R$)" required>
              <Input type="number" min="0" step="0.01" value={form.valor} onChange={set('valor')} placeholder="0,00" />
            </FormField>
            <FormField label="Data">
              <Input type="date" value={form.data} onChange={set('data')} />
            </FormField>
          </div>

          {/* Fornecedor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">Fornecedor</label>
              <Button variant="link" size="xs"
                onClick={() => { setNovoFornForm({ nome: '', telefone: '', email: '', cnpj: '' }); setModalNovoFornecedor(true); }}>
                + Cadastrar fornecedor
              </Button>
            </div>
            <div className="relative">
              <Input type="text"
                value={buscaFornecedor || form.fornecedor}
                onChange={e => { setBuscaFornecedor(e.target.value); set('fornecedor')({ target: { value: e.target.value } }); setShowFornecedorList(true); }}
                onFocus={() => setShowFornecedorList(true)}
                onBlur={() => setTimeout(() => setShowFornecedorList(false), 200)}
                placeholder="Buscar ou digitar fornecedor..." />
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

          <FormField label="Observacoes">
            <Textarea value={form.observacoes} onChange={set('observacoes')} rows={2} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} fullWidth>Cancelar</Button>
            <Button variant="primary" onClick={onSave} loading={saving} fullWidth>Salvar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal cadastro rapido de fornecedor */}
      <Modal open={modalNovoFornecedor} onClose={() => setModalNovoFornecedor(false)} title="Cadastrar Fornecedor">
        <div className="space-y-4">
          <FormField label="Nome" required>
            <Input type="text" value={novoFornForm.nome}
              onChange={e => setNovoFornForm(p => ({ ...p, nome: e.target.value.toUpperCase() }))}
              placeholder="NOME DO FORNECEDOR" style={{ textTransform: 'uppercase' }} autoFocus />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="CNPJ">
              <Input type="text" value={novoFornForm.cnpj} onChange={e => setNovoFornForm(p => ({ ...p, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" />
            </FormField>
            <FormField label="Telefone">
              <Input type="text" value={novoFornForm.telefone} onChange={e => setNovoFornForm(p => ({ ...p, telefone: e.target.value }))} placeholder="(00) 00000-0000" />
            </FormField>
          </div>
          <FormField label="E-mail">
            <Input type="email" value={novoFornForm.email} onChange={e => setNovoFornForm(p => ({ ...p, email: e.target.value }))} placeholder="email@fornecedor.com" />
          </FormField>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalNovoFornecedor(false)} fullWidth>Cancelar</Button>
            <Button variant="primary" disabled={salvandoForn || !novoFornForm.nome.trim()} loading={salvandoForn} fullWidth
              onClick={async () => {
                setSalvandoForn(true);
                try {
                  await adicionarFornecedor(novoFornForm);
                  set('fornecedor')({ target: { value: novoFornForm.nome } });
                  setModalNovoFornecedor(false);
                } catch(e) { alert('Erro ao salvar fornecedor: ' + e.message); }
                finally { setSalvandoForn(false); }
              }}>
              Salvar Fornecedor
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
