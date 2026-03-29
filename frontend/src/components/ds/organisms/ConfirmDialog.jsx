import { Modal } from './Modal';
import { Button } from '../atoms/Button';

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  variant = 'danger',
  loading,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} fullWidth>
          Cancelar
        </Button>
        <Button
          variant={variant}
          onClick={onConfirm}
          loading={loading}
          fullWidth
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
