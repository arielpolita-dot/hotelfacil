import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useEmpresa } from '../../context/EmpresaContext';
import { Plus, CalendarCheck } from 'lucide-react';
import { STATUS_FILTROS } from './constants';
import { useReservaForm } from './useReservaForm';
import { ReservaMobileCard } from './ReservaMobileCard';
import { ReservaDesktopRow } from './ReservaDesktopRow';
import { ReservaFormModal } from './ReservaFormModal';
import { PagamentoModal } from './PagamentoModal';
import { ReciboModal } from './ReciboModal';
import { BancoModal } from './BancoModal';
import { CancelamentoModal } from './CancelamentoModal';
import {
  Button, Spinner, PageHeader, SearchInput, FilterPills,
  DataTable, TableHeader, TableHead, EmptyState,
} from '../../components/ds';

export default function Vendas() {
  const { quartos, reservas, bancos, adicionarReserva, atualizarReserva, adicionarFatura, adicionarBanco, atualizarBanco, removerBanco, loading } = useHotel();
  const { empresaAtual } = useEmpresa();

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
      <PageHeader
        title="Reservas"
        subtitle={`${reservas.length} reservas cadastradas`}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => formHook.abrirNovo(setModal)}>
            Nova Reserva
          </Button>
        }
      />

      {/* Filtros de status */}
      <FilterPills
        options={STATUS_FILTROS.map(({ key, label }) => ({
          key,
          label,
          count: key === 'todos'
            ? reservas.length
            : reservas.filter(r => r.status === key || (key === 'check-in' && r.status === 'checkin')).length,
        }))}
        value={filtroStatus}
        onChange={setFiltroStatus}
      />

      {/* Busca */}
      <SearchInput
        value={busca}
        onChange={setBusca}
        placeholder="Buscar hospede ou quarto..."
        className="max-w-xs"
      />

      {/* Tabela */}
      {loading ? (
        <Spinner size="md" className="h-48" />
      ) : reservasFiltradas.length === 0 ? (
        <EmptyState icon={CalendarCheck} message="Nenhuma reserva encontrada" />
      ) : (
        <>
          {/* Mobile: Cards */}
          <div className="md:hidden space-y-3">
            {reservasFiltradas.map(r => (
              <ReservaMobileCard key={r.id} r={r} onEdit={r => formHook.abrirEditar(r, setModal)} onPagamento={r => formHook.abrirPagamento(r, setModal)} onUpdateStatus={atualizarStatus} />
            ))}
          </div>

          {/* Desktop: Tabela */}
          <DataTable className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <TableHeader>
                  <TableHead>Hospede</TableHead>
                  <TableHead>Quarto</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead align="right">Valor</TableHead>
                  <TableHead align="center">Acoes</TableHead>
                </TableHeader>
                <tbody>
                  {reservasFiltradas.map(r => (
                    <ReservaDesktopRow key={r.id} r={r} onEdit={r => formHook.abrirEditar(r, setModal)} onPagamento={r => formHook.abrirPagamento(r, setModal)} onUpdateStatus={atualizarStatus} />
                  ))}
                </tbody>
              </table>
            </div>
          </DataTable>
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
