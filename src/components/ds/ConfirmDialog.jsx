import { Modal } from './Modal';

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', variant = 'danger', loading }) {
  const btnClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white';

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 ${btnClass}`}
        >
          {loading ? 'Aguarde...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
