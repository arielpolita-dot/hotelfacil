import { Modal, FormField, Input, Textarea, Button } from '../../components/ds';
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
          <Input
            value={form.nome}
            onChange={e => onChange('nome', e.target.value.toUpperCase())}
            placeholder="Nome do fornecedor"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={form.tipo === 'juridica' ? 'CNPJ' : 'CPF'}>
            <Input
              value={form.tipo === 'juridica' ? form.cnpj : form.cpf}
              onChange={e => {
                const v = form.tipo === 'juridica' ? maskCNPJ(e.target.value) : maskCPF(e.target.value);
                onChange(form.tipo === 'juridica' ? 'cnpj' : 'cpf', v);
              }}
              placeholder={form.tipo === 'juridica' ? '00.000.000/0001-00' : '000.000.000-00'}
            />
          </FormField>
          <FormField label="Telefone">
            <Input
              value={form.telefone}
              onChange={e => onChange('telefone', maskPhone(e.target.value))}
              placeholder="(00) 00000-0000"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="E-mail">
            <Input
              type="email"
              value={form.email}
              onChange={e => onChange('email', e.target.value)}
              placeholder="email@empresa.com"
            />
          </FormField>
          <FormField label="Nome do Contato">
            <Input
              value={form.contato}
              onChange={e => onChange('contato', e.target.value.toUpperCase())}
              placeholder="Responsavel"
            />
          </FormField>
        </div>

        {/* Endereco */}
        <FormField label="Endereco">
          <Input
            value={form.endereco}
            onChange={e => onChange('endereco', e.target.value)}
            placeholder="Rua, numero, complemento"
          />
        </FormField>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Cidade">
            <Input value={form.cidade} onChange={e => onChange('cidade', e.target.value)} placeholder="Cidade" />
          </FormField>
          <FormField label="Estado">
            <Input value={form.estado} onChange={e => onChange('estado', e.target.value.toUpperCase().slice(0, 2))} placeholder="UF" maxLength={2} />
          </FormField>
          <FormField label="CEP">
            <Input
              value={form.cep}
              onChange={e => onChange('cep', e.target.value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'))}
              placeholder="00000-000"
            />
          </FormField>
        </div>

        {/* Observacoes */}
        <FormField label="Observacoes">
          <Textarea
            value={form.observacoes}
            onChange={e => onChange('observacoes', e.target.value)}
            rows={3}
            placeholder="Informacoes adicionais..."
          />
        </FormField>

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onSave} loading={saving} fullWidth>
            {saving ? 'Salvando...' : editingFornecedor ? 'Salvar Alteracoes' : 'Cadastrar Fornecedor'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
