import { Modal, FormField } from '../../components/ds';
import { inputCls } from '../../styles/formClasses';
import { maskCPF, maskCNPJ, maskPhone } from '../../utils/masks';

export function FornecedorFormModal({ open, onClose, onSave, editingFornecedor, form, onChange, saving }) {
  return (
    <Modal open={open} onClose={onClose} title={editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'} maxWidth="2xl">
      <div className="space-y-4">
        {/* Tipo */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tipo de Pessoa</label>
          <div className="flex gap-3">
            {[['juridica', 'Pessoa Juridica'], ['fisica', 'Pessoa Fisica']].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="tipo" value={v} checked={form.tipo === v} onChange={() => onChange('tipo', v)} className="accent-blue-600" />
                <span className="text-sm text-slate-700">{l}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Nome */}
        <FormField label="Nome / Razao Social">
          <input
            value={form.nome}
            onChange={e => onChange('nome', e.target.value.toUpperCase())}
            className={inputCls}
            placeholder="Nome do fornecedor"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={form.tipo === 'juridica' ? 'CNPJ' : 'CPF'}>
            <input
              value={form.tipo === 'juridica' ? form.cnpj : form.cpf}
              onChange={e => {
                const v = form.tipo === 'juridica' ? maskCNPJ(e.target.value) : maskCPF(e.target.value);
                onChange(form.tipo === 'juridica' ? 'cnpj' : 'cpf', v);
              }}
              className={inputCls}
              placeholder={form.tipo === 'juridica' ? '00.000.000/0001-00' : '000.000.000-00'}
            />
          </FormField>
          <FormField label="Telefone">
            <input
              value={form.telefone}
              onChange={e => onChange('telefone', maskPhone(e.target.value))}
              className={inputCls}
              placeholder="(00) 00000-0000"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="E-mail">
            <input
              type="email"
              value={form.email}
              onChange={e => onChange('email', e.target.value)}
              className={inputCls}
              placeholder="email@empresa.com"
            />
          </FormField>
          <FormField label="Nome do Contato">
            <input
              value={form.contato}
              onChange={e => onChange('contato', e.target.value.toUpperCase())}
              className={inputCls}
              placeholder="Responsavel"
            />
          </FormField>
        </div>

        {/* Endereco */}
        <FormField label="Endereco">
          <input
            value={form.endereco}
            onChange={e => onChange('endereco', e.target.value)}
            className={inputCls}
            placeholder="Rua, numero, complemento"
          />
        </FormField>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Cidade">
            <input value={form.cidade} onChange={e => onChange('cidade', e.target.value)} className={inputCls} placeholder="Cidade" />
          </FormField>
          <FormField label="Estado">
            <input value={form.estado} onChange={e => onChange('estado', e.target.value.toUpperCase().slice(0, 2))} className={inputCls} placeholder="UF" maxLength={2} />
          </FormField>
          <FormField label="CEP">
            <input
              value={form.cep}
              onChange={e => onChange('cep', e.target.value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'))}
              className={inputCls}
              placeholder="00000-000"
            />
          </FormField>
        </div>

        {/* Observacoes */}
        <FormField label="Observacoes">
          <textarea
            value={form.observacoes}
            onChange={e => onChange('observacoes', e.target.value)}
            rows={3}
            className={inputCls + ' resize-none'}
            placeholder="Informacoes adicionais..."
          />
        </FormField>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? 'Salvando...' : editingFornecedor ? 'Salvar Alteracoes' : 'Cadastrar Fornecedor'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
