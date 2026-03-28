import { useState } from 'react';
import { Modal } from '../../components/ds';
import { inputCls } from '../../styles/formClasses';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export function BancoModal({
  open, onClose,
  editBancoId, bancoForm, setBancoForm,
  adicionarBanco, atualizarBanco, setForm,
}) {
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    setSalvando(true);
    try {
      if (editBancoId) {
        await atualizarBanco(editBancoId, bancoForm);
      } else {
        const novo = await adicionarBanco(bancoForm);
        if (novo?.id) setForm(p => ({ ...p, bancoId: novo.id }));
      }
      onClose();
    } catch(e) {
      alert('Erro ao salvar banco: ' + e.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editBancoId ? 'Editar Banco' : 'Cadastrar Banco'}>
      <div className="space-y-4">
        <Field label="Nome do Banco">
          <input
            type="text"
            value={bancoForm.nome}
            onChange={e => setBancoForm(p => ({ ...p, nome: e.target.value.toUpperCase() }))}
            placeholder="Ex: BRADESCO, ITAU, NUBANK..."
            className={inputCls}
            style={{ textTransform: 'uppercase' }}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Agencia">
            <input type="text" value={bancoForm.agencia} onChange={e => setBancoForm(p => ({ ...p, agencia: e.target.value }))} placeholder="0000-0" className={inputCls} />
          </Field>
          <Field label="Conta">
            <input type="text" value={bancoForm.conta} onChange={e => setBancoForm(p => ({ ...p, conta: e.target.value }))} placeholder="00000-0" className={inputCls} />
          </Field>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
          <button disabled={salvando || !bancoForm.nome.trim()} onClick={salvar} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50">
            {salvando ? 'Salvando...' : 'Salvar Banco'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
