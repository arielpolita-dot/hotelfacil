import { Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from '../atoms/Button';

export function DeleteDialog({
  open,
  onClose,
  onConfirm,
  entityName = 'item',
  loading,
}) {
  return (
    <Modal open={open} onClose={onClose} title={`Excluir ${entityName}`} maxWidth="sm">
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Trash2 className="h-7 w-7 text-red-600" />
        </div>
        <p className="text-slate-700 font-medium mb-1">
          Tem certeza que deseja excluir?
        </p>
        <p className="text-sm text-slate-500 mb-6">
          Esta acao nao pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} fullWidth>
            Excluir
          </Button>
        </div>
      </div>
    </Modal>
  );
}
