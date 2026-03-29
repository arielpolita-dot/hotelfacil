import { useState } from 'react';
import { Modal, FormField, Input, Button } from '../../components/ds';

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
        <FormField label="Nome do Banco">
          <Input
            type="text"
            value={bancoForm.nome}
            onChange={e => setBancoForm(p => ({ ...p, nome: e.target.value.toUpperCase() }))}
            placeholder="Ex: BRADESCO, ITAU, NUBANK..."
            style={{ textTransform: 'uppercase' }}
            autoFocus
          />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Agencia">
            <Input type="text" value={bancoForm.agencia} onChange={e => setBancoForm(p => ({ ...p, agencia: e.target.value }))} placeholder="0000-0" />
          </FormField>
          <FormField label="Conta">
            <Input type="text" value={bancoForm.conta} onChange={e => setBancoForm(p => ({ ...p, conta: e.target.value }))} placeholder="00000-0" />
          </FormField>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button disabled={salvando || !bancoForm.nome.trim()} loading={salvando} onClick={salvar} className="flex-1">
            {salvando ? 'Salvando...' : 'Salvar Banco'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
