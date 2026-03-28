import { Modal } from '../../components/ds';
import { Ban } from 'lucide-react';

export function CancelamentoModal({ cancelando, onClose, motivoCancelamento, setMotivoCancelamento, onConfirm }) {
  return (
    <Modal open={!!cancelando} onClose={onClose} title="Cancelar Reserva">
      <div className="space-y-5">
        {/* Aviso */}
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Ban className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-800 text-sm">Confirmar cancelamento</p>
            <p className="text-xs text-red-600 mt-0.5">Esta acao ira cancelar a reserva. Informe o motivo abaixo.</p>
          </div>
        </div>

        {/* Motivo */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Motivo do Cancelamento</label>
          <textarea
            value={motivoCancelamento}
            onChange={e => setMotivoCancelamento(e.target.value)}
            rows={4}
            placeholder="Descreva o motivo do cancelamento..."
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
            autoFocus
          />
        </div>

        <div className="flex gap-3 pt-1 pb-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Voltar</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition">Confirmar Cancelamento</button>
        </div>
      </div>
    </Modal>
  );
}
