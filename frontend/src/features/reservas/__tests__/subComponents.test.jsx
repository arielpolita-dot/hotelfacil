import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CancelamentoModal } from '../CancelamentoModal';
import { BancoModal } from '../BancoModal';
import { ReservaMobileCard } from '../ReservaMobileCard';
import { ReservaDesktopRow } from '../ReservaDesktopRow';
import { STATUS_CFG, STATUS_BADGE_MAP, FORMAS_PAGAMENTO, EMPTY_FORM, STATUS_FILTROS } from '../constants';

// --- Constants ---
describe('reservas constants', () => {
  it('exports STATUS_CFG with expected keys', () => {
    expect(STATUS_CFG.confirmada).toBeDefined();
    expect(STATUS_CFG['check-in']).toBeDefined();
    expect(STATUS_CFG.checkout).toBeDefined();
    expect(STATUS_CFG.cancelada).toBeDefined();
  });

  it('exports STATUS_BADGE_MAP', () => {
    expect(STATUS_BADGE_MAP.confirmada.variant).toBe('brand');
    expect(STATUS_BADGE_MAP.cancelada.variant).toBe('danger');
  });

  it('exports FORMAS_PAGAMENTO', () => {
    expect(FORMAS_PAGAMENTO.length).toBeGreaterThan(3);
    expect(FORMAS_PAGAMENTO[0]).toHaveProperty('value');
    expect(FORMAS_PAGAMENTO[0]).toHaveProperty('label');
  });

  it('exports EMPTY_FORM with all fields', () => {
    expect(EMPTY_FORM.nomeHospede).toBe('');
    expect(EMPTY_FORM.quartoId).toBe('');
    expect(EMPTY_FORM.adultos).toBe(1);
  });

  it('exports STATUS_FILTROS', () => {
    expect(STATUS_FILTROS.length).toBe(5);
    expect(STATUS_FILTROS[0].key).toBe('todos');
  });
});

// --- CancelamentoModal ---
describe('CancelamentoModal', () => {
  it('renders when cancelando is truthy', () => {
    render(
      <CancelamentoModal
        cancelando={{ id: 'r1' }}
        onClose={vi.fn()}
        motivoCancelamento=""
        setMotivoCancelamento={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText(/Cancelar Reserva/i)).toBeDefined();
    expect(screen.getAllByText(/Confirmar cancelamento/i).length).toBeGreaterThanOrEqual(1);
  });

  it('calls setMotivoCancelamento on textarea change', () => {
    const setMotivo = vi.fn();
    render(
      <CancelamentoModal
        cancelando={{ id: 'r1' }}
        onClose={vi.fn()}
        motivoCancelamento=""
        setMotivoCancelamento={setMotivo}
        onConfirm={vi.fn()}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/motivo/i), { target: { value: 'Teste' } });
    expect(setMotivo).toHaveBeenCalled();
  });

  it('calls onConfirm on confirm button click', () => {
    const onConfirm = vi.fn();
    render(
      <CancelamentoModal
        cancelando={{ id: 'r1' }}
        onClose={vi.fn()}
        motivoCancelamento="motivo"
        setMotivoCancelamento={vi.fn()}
        onConfirm={onConfirm}
      />
    );
    fireEvent.click(screen.getByText('Confirmar Cancelamento'));
    expect(onConfirm).toHaveBeenCalled();
  });
});

// --- BancoModal ---
describe('BancoModal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    editBancoId: null,
    bancoForm: { nome: '', agencia: '', conta: '' },
    setBancoForm: vi.fn(),
    adicionarBanco: vi.fn().mockResolvedValue({ id: 'b-new' }),
    atualizarBanco: vi.fn().mockResolvedValue(),
    setForm: vi.fn(),
  };

  it('renders new banco form', () => {
    render(<BancoModal {...defaultProps} />);
    expect(screen.getByText('Cadastrar Banco')).toBeDefined();
  });

  it('renders edit banco title when editBancoId set', () => {
    render(<BancoModal {...defaultProps} editBancoId="b1" />);
    expect(screen.getByText('Editar Banco')).toBeDefined();
  });

  it('disables save button when nome is empty', () => {
    render(<BancoModal {...defaultProps} />);
    const saveBtn = screen.getByText('Salvar Banco');
    expect(saveBtn.disabled).toBe(true);
  });
});

// --- ReservaMobileCard ---
describe('ReservaMobileCard', () => {
  const reserva = {
    id: 'r1',
    nomeHospede: 'Joao Silva',
    telefone: '(11) 99999-9999',
    quartoId: 'q1',
    numeroQuarto: '101',
    dataCheckIn: '2026-03-01',
    dataCheckOut: '2026-03-05',
    valorTotal: 600,
    status: 'confirmada',
  };

  it('renders guest name', () => {
    render(<ReservaMobileCard r={reserva} onEdit={vi.fn()} onPagamento={vi.fn()} onUpdateStatus={vi.fn()} />);
    expect(screen.getByText('Joao Silva')).toBeDefined();
  });

  it('renders room number', () => {
    render(<ReservaMobileCard r={reserva} onEdit={vi.fn()} onPagamento={vi.fn()} onUpdateStatus={vi.fn()} />);
    expect(screen.getByText('101')).toBeDefined();
  });

  it('renders status badge', () => {
    render(<ReservaMobileCard r={reserva} onEdit={vi.fn()} onPagamento={vi.fn()} onUpdateStatus={vi.fn()} />);
    expect(screen.getByText('Confirmada')).toBeDefined();
  });

  it('shows check-in button for confirmada status', () => {
    render(<ReservaMobileCard r={reserva} onEdit={vi.fn()} onPagamento={vi.fn()} onUpdateStatus={vi.fn()} />);
    expect(screen.getByTitle('Check-in')).toBeDefined();
  });

  it('shows checkout button for check-in status', () => {
    render(<ReservaMobileCard r={{ ...reserva, status: 'check-in' }} onEdit={vi.fn()} onPagamento={vi.fn()} onUpdateStatus={vi.fn()} />);
    expect(screen.getByTitle('Check-out')).toBeDefined();
  });

  it('handles missing guest data gracefully', () => {
    render(<ReservaMobileCard r={{ ...reserva, nomeHospede: '', dataCheckIn: null, dataCheckOut: null }} onEdit={vi.fn()} onPagamento={vi.fn()} onUpdateStatus={vi.fn()} />);
    expect(document.body.textContent).toBeTruthy();
  });
});

// --- ReservaDesktopRow ---
describe('ReservaDesktopRow', () => {
  const reserva = {
    id: 'r1',
    nomeHospede: 'Maria Santos',
    telefone: '(21) 88888-8888',
    quartoId: 'q2',
    numeroQuarto: '202',
    dataCheckIn: '2026-03-10',
    dataCheckOut: '2026-03-14',
    valorTotal: 1200,
    status: 'check-in',
  };

  it('renders in a table context', () => {
    render(
      <table><tbody>
        <ReservaDesktopRow r={reserva} onEdit={vi.fn()} onPagamento={vi.fn()} onUpdateStatus={vi.fn()} />
      </tbody></table>
    );
    expect(screen.getByText('Maria Santos')).toBeDefined();
  });

  it('renders room number', () => {
    render(
      <table><tbody>
        <ReservaDesktopRow r={reserva} onEdit={vi.fn()} onPagamento={vi.fn()} onUpdateStatus={vi.fn()} />
      </tbody></table>
    );
    expect(screen.getByText('202')).toBeDefined();
  });

  it('renders check-out button for check-in status', () => {
    render(
      <table><tbody>
        <ReservaDesktopRow r={reserva} onEdit={vi.fn()} onPagamento={vi.fn()} onUpdateStatus={vi.fn()} />
      </tbody></table>
    );
    expect(screen.getByTitle(/Check-out/i)).toBeDefined();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    render(
      <table><tbody>
        <ReservaDesktopRow r={reserva} onEdit={onEdit} onPagamento={vi.fn()} onUpdateStatus={vi.fn()} />
      </tbody></table>
    );
    fireEvent.click(screen.getByTitle(/Editar/i));
    expect(onEdit).toHaveBeenCalledWith(reserva);
  });
});
