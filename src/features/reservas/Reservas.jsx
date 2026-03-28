import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, CalendarCheck } from 'lucide-react';
import { STATUS_CFG, STATUS_FILTROS } from './constants';
import { useReservaForm } from './useReservaForm';
import { ReservaMobileCard } from './ReservaMobileCard';
import { ReservaDesktopRow } from './ReservaDesktopRow';
import { ReservaFormModal } from './ReservaFormModal';
import { PagamentoModal } from './PagamentoModal';
import { ReciboModal } from './ReciboModal';
import { BancoModal } from './BancoModal';
import { CancelamentoModal } from './CancelamentoModal';

export default function Vendas() {
  const { quartos, reservas, bancos, adicionarReserva, atualizarReserva, adicionarFatura, adicionarBanco, atualizarBanco, removerBanco, loading } = useHotel();
  const { empresaAtual } = useAuth();

  const [modal, setModal] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [cancelando, setCancelando] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [reciboData, setReciboData] = useState(null);
  const [modalBanco, setModalBanco] = useState(false);
  const [editBancoId, setEditBancoId] = useState(null);
  const [bancoForm, setBancoForm] = useState({ nome: '', agencia: '', conta: '' });

  const formHook = useReservaForm({ quartos, adicionarReserva, atualizarReserva, adicionarFatura });

  const atualizarStatus = async (id, status) => {
    if (status === 'cancelada') {
      setCancelando({ id });
      setMotivoCancelamento('');
      return;
    }
    try { await atualizarReserva(id, { status }); } catch (e) { console.error(e); }
  };

  const confirmarCancelamento = async () => {
    if (!cancelando) return;
    try {
      await atualizarReserva(cancelando.id, {
        status: 'cancelada',
        motivoCancelamento: motivoCancelamento.trim() || 'Nao informado',
        canceladoEm: new Date(),
      });
    } catch (e) { console.error(e); }
    setCancelando(null);
    setMotivoCancelamento('');
  };

  const reservasFiltradas = useMemo(() => {
    return reservas.filter(r => {
      const nome = (r.nomeHospede || r.hospede?.nome || '').toLowerCase();
      const quarto = (r.numeroQuarto || r.quartoNumero || '').toString();
      const matchBusca = !busca || nome.includes(busca.toLowerCase()) || quarto.includes(busca);
      const matchStatus = filtroStatus === 'todos' || r.status === filtroStatus;
      return matchBusca && matchStatus;
    }).sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0));
  }, [reservas, busca, filtroStatus]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reservas</h2>
          <p className="text-sm text-slate-500 mt-0.5">{reservas.length} reservas cadastradas</p>
        </div>
        <button onClick={() => formHook.abrirNovo(setModal)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm shadow-blue-600/20">
          <Plus className="h-4 w-4" /> Nova Reserva
        </button>
      </div>

      {/* Filtros de status */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTROS.map(({ key, label }) => {
          const count = key === 'todos'
            ? reservas.length
            : reservas.filter(r => r.status === key || (key === 'check-in' && r.status === 'checkin')).length;
          return (
            <button key={key} onClick={() => setFiltroStatus(key)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${filtroStatus === key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Busca */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="text" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar hospede ou quarto..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reservasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <CalendarCheck className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Nenhuma reserva encontrada</p>
        </div>
      ) : (
        <>
          {/* Mobile: Cards */}
          <div className="md:hidden space-y-3">
            {reservasFiltradas.map(r => (
              <ReservaMobileCard key={r.id} r={r} onEdit={r => formHook.abrirEditar(r, setModal)} onPagamento={r => formHook.abrirPagamento(r, setModal)} onUpdateStatus={atualizarStatus} />
            ))}
          </div>

          {/* Desktop: Tabela */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Hospede</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Quarto</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Check-in</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Check-out</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Valor</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasFiltradas.map(r => (
                    <ReservaDesktopRow key={r.id} r={r} onEdit={r => formHook.abrirEditar(r, setModal)} onPagamento={r => formHook.abrirPagamento(r, setModal)} onUpdateStatus={atualizarStatus} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <ReservaFormModal
        open={modal === 'form'} onClose={() => setModal(null)}
        form={formHook.form} editId={formHook.editId}
        set={formHook.set} setUpper={formHook.setUpper} setMasked={formHook.setMasked} setForm={formHook.setForm}
        useCnpj={formHook.useCnpj} setUseCnpj={formHook.setUseCnpj}
        quartos={quartos} editReserva={formHook.editReserva}
        calcularValor={formHook.calcularValor} salvar={formHook.salvar} saving={formHook.saving}
        setModal={setModal}
      />

      <PagamentoModal
        open={modal === 'pagamento'} onClose={() => setModal(null)}
        form={formHook.form} set={formHook.set} setForm={formHook.setForm}
        editReserva={formHook.editReserva} bancos={bancos}
        isCartao={formHook.isCartao} calcularValorFinal={formHook.calcularValorFinal}
        salvarPagamento={formHook.salvarPagamento} saving={formHook.saving}
        setModal={setModal} setReciboData={setReciboData}
        setEditBancoId={setEditBancoId} setBancoForm={setBancoForm} setModalBanco={setModalBanco}
      />

      <CancelamentoModal
        cancelando={cancelando} onClose={() => setCancelando(null)}
        motivoCancelamento={motivoCancelamento} setMotivoCancelamento={setMotivoCancelamento}
        onConfirm={confirmarCancelamento}
      />

      {modal === 'recibo' && (
        <ReciboModal reciboData={reciboData} empresaAtual={empresaAtual} onClose={() => { setModal(null); setReciboData(null); }} />
      )}

      <BancoModal
        open={modalBanco} onClose={() => setModalBanco(false)}
        editBancoId={editBancoId} bancoForm={bancoForm} setBancoForm={setBancoForm}
        adicionarBanco={adicionarBanco} atualizarBanco={atualizarBanco} setForm={formHook.setForm}
      />
    </div>
  );
}
