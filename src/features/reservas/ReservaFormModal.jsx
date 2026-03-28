import { useMemo } from 'react';
import { Modal } from '../../components/ds';
import { maskCPF, maskCNPJ, maskPhone } from '../../utils/masks';
import { inputCls, selectCls } from '../../styles/formClasses';
import { Building2 } from 'lucide-react';
import { FORMAS_PAGAMENTO } from './constants';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 mt-1">{children}</p>
  );
}

export function ReservaFormModal({
  open, onClose, form, editId,
  set, setUpper, setMasked, setForm,
  useCnpj, setUseCnpj,
  quartos, editReserva,
  calcularValor, salvar, saving,
  setModal,
}) {
  const quartosParaSelect = useMemo(() => {
    if (editId && editReserva) {
      return quartos.filter(q =>
        q.status === 'disponivel' ||
        q.status === 'reservado' ||
        q.id === editReserva.quartoId
      );
    }
    return quartos.filter(q => q.status === 'disponivel' || q.status === 'reservado');
  }, [quartos, editId, editReserva]);

  return (
    <Modal open={open} onClose={onClose} title={editId ? 'Editar Reserva' : 'Nova Reserva'} maxWidth="xl">
      <div className="space-y-5">
        {/* Hospede */}
        <div>
          <SectionTitle>Dados do Hospede</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome Completo">
              <input type="text" value={form.nomeHospede} onChange={setUpper('nomeHospede')} placeholder="NOME DO HOSPEDE" className={inputCls} style={{ textTransform: 'uppercase' }} />
            </Field>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{useCnpj ? 'CNPJ' : 'CPF'}</label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input type="checkbox" checked={useCnpj} onChange={e => { setUseCnpj(e.target.checked); setForm(p => ({ ...p, cpf: '' })); }} className="w-3.5 h-3.5 accent-blue-600" />
                  <span className="text-xs text-slate-500">Usar CNPJ</span>
                </label>
              </div>
              <input type="text" value={form.cpf} onChange={setMasked('cpf', useCnpj ? maskCNPJ : maskCPF)} placeholder={useCnpj ? '00.000.000/0001-00' : '000.000.000-00'} className={inputCls} />
            </div>
            <Field label="Email">
              <input type="email" value={form.email} onChange={set('email')} placeholder="email@exemplo.com" className={inputCls} style={{ textTransform: 'lowercase' }} />
            </Field>
            <Field label="Celular">
              <input type="tel" value={form.telefone} onChange={setMasked('telefone', maskPhone)} placeholder="(00) 00000-0000" className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Quarto e datas */}
        <div>
          <SectionTitle>Quarto e Periodo</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Quarto">
              <select value={form.quartoId} onChange={e => { const qId = e.target.value; setForm(p => ({ ...p, quartoId: qId })); setTimeout(() => calcularValor(qId, null, null), 50); }} className={selectCls}>
                <option value="">Selecione um quarto</option>
                {quartosParaSelect.map(q => (
                  <option key={q.id} value={q.id}>Quarto {q.numero} — {q.tipo} (R$ {q.precoDiaria}/diaria)</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={set('status')} className={selectCls}>
                <option value="confirmada">Confirmada</option>
                <option value="check-in">Check-in</option>
                <option value="checkout">Check-out</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </Field>
            <Field label="Check-in">
              <input type="date" value={form.dataCheckIn} onChange={e => { const v = e.target.value; setForm(p => ({ ...p, dataCheckIn: v })); setTimeout(() => calcularValor(null, v, null), 50); }} className={inputCls} />
            </Field>
            <Field label="Check-out">
              <input type="date" value={form.dataCheckOut} onChange={e => { const v = e.target.value; setForm(p => ({ ...p, dataCheckOut: v })); setTimeout(() => calcularValor(null, null, v), 50); }} className={inputCls} />
            </Field>
            <Field label="Adultos">
              <input type="number" min="1" value={form.adultos} onChange={set('adultos')} className={inputCls} />
            </Field>
            <Field label="Criancas">
              <input type="number" min="0" value={form.criancas} onChange={set('criancas')} className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Pagamento */}
        <div>
          <SectionTitle>Pagamento</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Valor Total (R$)">
              <input type="number" min="0" step="0.01" value={form.valorTotal} onChange={set('valorTotal')} placeholder="0,00" className={inputCls} />
            </Field>
            <Field label="Forma de Pagamento">
              <select value={form.formaPagamento} onChange={set('formaPagamento')} className={selectCls}>
                {FORMAS_PAGAMENTO.map(fp => (
                  <option key={fp.value} value={fp.value}>{fp.label}</option>
                ))}
              </select>
            </Field>
          </div>
          {form.formaPagamento === 'faturado' && (
            <div className="mt-4 p-4 bg-violet-50 border border-violet-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-violet-600" />
                <p className="text-xs font-bold text-violet-700 uppercase tracking-wide">Dados da Empresa Faturada</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="CNPJ"><input type="text" value={form.faturadoCnpj} onChange={set('faturadoCnpj')} placeholder="00.000.000/0001-00" className={inputCls} /></Field>
                <Field label="Nome da Empresa"><input type="text" value={form.faturadoEmpresa} onChange={set('faturadoEmpresa')} placeholder="Razao Social" className={inputCls} /></Field>
                <Field label="Contato"><input type="text" value={form.faturadoContato} onChange={set('faturadoContato')} placeholder="Nome / Telefone" className={inputCls} /></Field>
                <Field label="Endereco"><input type="text" value={form.faturadoEndereco} onChange={set('faturadoEndereco')} placeholder="Rua, no, Cidade - UF" className={inputCls} /></Field>
              </div>
            </div>
          )}
        </div>

        <Field label="Observacoes">
          <textarea value={form.observacoes} onChange={set('observacoes')} rows={3} placeholder="Pedidos especiais, informacoes adicionais..." className={inputCls + ' resize-none'} />
        </Field>

        <div className="flex gap-3 pt-2 pb-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
          <button onClick={() => salvar(setModal)} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50">
            {saving ? 'Salvando...' : editId ? 'Salvar Alteracoes' : 'Confirmar Reserva'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
