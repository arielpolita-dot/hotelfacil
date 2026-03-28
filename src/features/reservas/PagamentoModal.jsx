import { Modal, FormField } from '../../components/ds';
import { formatCurrency } from '../../utils/formatters';
import { toDate } from '../../utils/dateUtils';
import { inputCls, selectCls } from '../../styles/formClasses';
import { Building2, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FORMAS_PAGAMENTO } from './constants';

function SectionTitle({ children }) {
  return (
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 mt-1">{children}</p>
  );
}

export function PagamentoModal({
  open, onClose, form, set, setForm,
  editReserva, bancos,
  isCartao, calcularValorFinal,
  salvarPagamento, saving,
  setModal, setReciboData,
  setEditBancoId, setBancoForm, setModalBanco,
}) {
  return (
    <Modal open={open} onClose={onClose} title="Registrar Pagamento" maxWidth="xl">
      <div className="space-y-5">
        {/* Resumo da reserva */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Resumo da Reserva</p>
          <p className="font-semibold text-slate-900">{editReserva?.nomeHospede || editReserva?.hospede?.nome || '\u2014'}</p>
          <p className="text-sm text-slate-500 mt-0.5">
            Quarto {editReserva?.numeroQuarto || editReserva?.quartoNumero || '\u2014'}
            {editReserva?.dataCheckIn && ` \u00b7 ${format(toDate(editReserva.dataCheckIn), 'dd/MM/yyyy', { locale: ptBR })}`}
            {editReserva?.dataCheckOut && ` \u2192 ${format(toDate(editReserva.dataCheckOut), 'dd/MM/yyyy', { locale: ptBR })}`}
          </p>
        </div>

        {/* Valor e forma de pagamento */}
        <div>
          <SectionTitle>Dados do Pagamento</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Data de Pagamento">
              <input type="date" value={form.dataPagamento} onChange={set('dataPagamento')} className={inputCls} />
            </FormField>
            <FormField label="Forma de Pagamento">
              <select value={form.formaPagamento} onChange={set('formaPagamento')} className={selectCls}>
                {FORMAS_PAGAMENTO.map(fp => (
                  <option key={fp.value} value={fp.value}>{fp.label}</option>
                ))}
              </select>
            </FormField>
            {/* Banco */}
            {['transferencia','pix','cheque','cartao_credito','cartao_debito'].includes(form.formaPagamento) && (
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Banco</label>
                  <button type="button" onClick={() => { setEditBancoId(null); setBancoForm({ nome: '', agencia: '', conta: '' }); setModalBanco(true); }} className="text-xs text-blue-600 hover:underline flex items-center gap-1">+ Cadastrar banco</button>
                </div>
                <select value={form.bancoId} onChange={set('bancoId')} className={selectCls}>
                  <option value="">Selecione um banco</option>
                  {(bancos || []).map(b => (
                    <option key={b.id} value={b.id}>{b.nome}</option>
                  ))}
                </select>
                {form.bancoId && (() => {
                  const b = (bancos || []).find(x => x.id === form.bancoId);
                  return b && (b.agencia || b.conta) ? (
                    <div className="mt-2 flex gap-4 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                      {b.agencia && <span>Agencia: <strong className="text-slate-700">{b.agencia}</strong></span>}
                      {b.conta && <span>Conta: <strong className="text-slate-700">{b.conta}</strong></span>}
                    </div>
                  ) : null;
                })()}
              </div>
            )}
            <FormField label="Valor da Diaria (R$)">
              <input type="number" min="0" step="0.01" value={form.valorTotal} onChange={set('valorTotal')} placeholder="0,00" className={inputCls} />
            </FormField>
            <FormField label="Valor Extra (R$)">
              <input type="number" min="0" step="0.01" value={form.valorExtra} onChange={set('valorExtra')} placeholder="Ex: consumo, servicos adicionais" className={inputCls} />
            </FormField>
            <FormField label="Desconto (R$)">
              <input type="number" min="0" step="0.01" value={form.desconto} onChange={set('desconto')} placeholder="0,00" className={inputCls} />
            </FormField>
            {isCartao(form.formaPagamento) && (
              <FormField label="Parcelamento">
                <select value={form.parcelas} onChange={set('parcelas')} className={selectCls}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                    <option key={n} value={n}>{n === 1 ? 'A vista' : `${n}x`}</option>
                  ))}
                </select>
              </FormField>
            )}
          </div>

          {/* Resumo do valor final */}
          {(parseFloat(form.valorExtra) > 0 || parseFloat(form.desconto) > 0) && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Valor da diaria</span>
                <span>{formatCurrency(parseFloat(form.valorTotal) || 0)}</span>
              </div>
              {parseFloat(form.valorExtra) > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>+ Valor extra</span>
                  <span>+ {formatCurrency(parseFloat(form.valorExtra))}</span>
                </div>
              )}
              {parseFloat(form.desconto) > 0 && (
                <div className="flex justify-between text-sm text-red-500">
                  <span>- Desconto</span>
                  <span>- {formatCurrency(parseFloat(form.desconto))}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 mt-2 pt-2">
                <span>Total a cobrar</span>
                <span>{formatCurrency(calcularValorFinal())}</span>
              </div>
              {isCartao(form.formaPagamento) && parseInt(form.parcelas) > 1 && (
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{form.parcelas}x de</span>
                  <span>{formatCurrency(calcularValorFinal() / parseInt(form.parcelas))}</span>
                </div>
              )}
            </div>
          )}

          {/* Resumo quando so tem valor base + parcelamento */}
          {!(parseFloat(form.valorExtra) > 0 || parseFloat(form.desconto) > 0) && isCartao(form.formaPagamento) && parseInt(form.parcelas) > 1 && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex justify-between text-sm font-bold text-slate-900">
                <span>Total: {formatCurrency(parseFloat(form.valorTotal) || 0)}</span>
                <span>{form.parcelas}x de {formatCurrency((parseFloat(form.valorTotal) || 0) / parseInt(form.parcelas))}</span>
              </div>
            </div>
          )}
        </div>

        {/* Campos extras para Faturado */}
        {form.formaPagamento === 'faturado' && (
          <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-violet-600" />
              <p className="text-xs font-bold text-violet-700 uppercase tracking-wide">Dados da Empresa Faturada</p>
            </div>
            <p className="text-xs text-violet-600 mb-3">Esta reserva sera registrada em <strong>Vendas por Fatura</strong>.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="CNPJ"><input type="text" value={form.faturadoCnpj} onChange={set('faturadoCnpj')} placeholder="00.000.000/0001-00" className={inputCls} /></FormField>
              <FormField label="Nome da Empresa"><input type="text" value={form.faturadoEmpresa} onChange={set('faturadoEmpresa')} placeholder="Razao Social" className={inputCls} /></FormField>
              <FormField label="Contato"><input type="text" value={form.faturadoContato} onChange={set('faturadoContato')} placeholder="Nome / Telefone" className={inputCls} /></FormField>
              <FormField label="Endereco"><input type="text" value={form.faturadoEndereco} onChange={set('faturadoEndereco')} placeholder="Rua, no, Cidade - UF" className={inputCls} /></FormField>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2 pb-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
          <button onClick={() => salvarPagamento(setModal, setReciboData)} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
            <CreditCard className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Confirmar Pagamento'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
