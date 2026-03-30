import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReservaDesktopRow } from '../ReservaDesktopRow';
import { ReservaMobileCard } from '../ReservaMobileCard';

const baseReserva = {
  id: 'r1',
  nomeHospede: 'Joao',
  telefone: '(11) 99999',
  quartoId: 'q1',
  numeroQuarto: '101',
  dataCheckIn: '2026-03-01',
  dataCheckOut: '2026-03-05',
  valorTotal: 800,
  status: 'confirmada',
};

const handlers = () => ({
  onEdit: vi.fn(),
  onPagamento: vi.fn(),
  onUpdateStatus: vi.fn(),
});

describe('ReservaDesktopRow', () => {
  it('renders guest name and phone', () => {
    const h = handlers();
    render(<table><tbody><ReservaDesktopRow r={baseReserva} {...h} /></tbody></table>);
    expect(screen.getByText('Joao')).toBeDefined();
    expect(screen.getByText('(11) 99999')).toBeDefined();
  });

  it('renders quarto number', () => {
    const h = handlers();
    render(<table><tbody><ReservaDesktopRow r={baseReserva} {...h} /></tbody></table>);
    expect(screen.getByText('101')).toBeDefined();
  });

  it('renders dates', () => {
    const h = handlers();
    render(<table><tbody><ReservaDesktopRow r={baseReserva} {...h} /></tbody></table>);
    expect(screen.getByText('01/03/2026')).toBeDefined();
    expect(screen.getByText('05/03/2026')).toBeDefined();
  });

  it('uses hospede.nome fallback', () => {
    const r = { ...baseReserva, nomeHospede: undefined, hospede: { nome: 'Maria' } };
    render(<table><tbody><ReservaDesktopRow r={r} {...handlers()} /></tbody></table>);
    expect(screen.getByText('Maria')).toBeDefined();
  });

  it('shows dash for missing name', () => {
    const r = { ...baseReserva, nomeHospede: undefined };
    render(<table><tbody><ReservaDesktopRow r={r} {...handlers()} /></tbody></table>);
    expect(screen.getByText('\u2014')).toBeDefined();
  });

  it('shows check-in button for confirmada status', () => {
    render(<table><tbody><ReservaDesktopRow r={baseReserva} {...handlers()} /></tbody></table>);
    expect(screen.getByTitle('Fazer Check-in')).toBeDefined();
  });

  it('shows check-out button for check-in status', () => {
    const r = { ...baseReserva, status: 'check-in' };
    render(<table><tbody><ReservaDesktopRow r={r} {...handlers()} /></tbody></table>);
    expect(screen.getByTitle('Fazer Check-out')).toBeDefined();
  });

  it('shows check-out button for checkin status alias', () => {
    const r = { ...baseReserva, status: 'checkin' };
    render(<table><tbody><ReservaDesktopRow r={r} {...handlers()} /></tbody></table>);
    expect(screen.getByTitle('Fazer Check-out')).toBeDefined();
  });

  it('hides check-in/out for checkout status', () => {
    const r = { ...baseReserva, status: 'checkout' };
    render(<table><tbody><ReservaDesktopRow r={r} {...handlers()} /></tbody></table>);
    expect(screen.queryByTitle('Fazer Check-in')).toBeNull();
    expect(screen.queryByTitle('Fazer Check-out')).toBeNull();
  });

  it('shows cancel button for confirmada', () => {
    render(<table><tbody><ReservaDesktopRow r={baseReserva} {...handlers()} /></tbody></table>);
    expect(screen.getByTitle('Cancelar reserva')).toBeDefined();
  });

  it('hides cancel button for cancelada', () => {
    const r = { ...baseReserva, status: 'cancelada' };
    render(<table><tbody><ReservaDesktopRow r={r} {...handlers()} /></tbody></table>);
    expect(screen.queryByTitle('Cancelar reserva')).toBeNull();
  });

  it('calls onEdit when edit clicked', () => {
    const h = handlers();
    render(<table><tbody><ReservaDesktopRow r={baseReserva} {...h} /></tbody></table>);
    fireEvent.click(screen.getByTitle('Editar reserva'));
    expect(h.onEdit).toHaveBeenCalledWith(baseReserva);
  });

  it('calls onPagamento when payment clicked', () => {
    const h = handlers();
    render(<table><tbody><ReservaDesktopRow r={baseReserva} {...h} /></tbody></table>);
    fireEvent.click(screen.getByTitle('Registrar pagamento'));
    expect(h.onPagamento).toHaveBeenCalledWith(baseReserva);
  });

  it('renders valor with fallback', () => {
    const r = { ...baseReserva, valorTotal: undefined, valor: 999 };
    render(<table><tbody><ReservaDesktopRow r={r} {...handlers()} /></tbody></table>);
    expect(document.body.textContent).toContain('999');
  });

  it('uses quartoNumero fallback', () => {
    const r = { ...baseReserva, numeroQuarto: undefined, quartoNumero: '303' };
    render(<table><tbody><ReservaDesktopRow r={r} {...handlers()} /></tbody></table>);
    expect(screen.getByText('303')).toBeDefined();
  });

  it('handles null dates', () => {
    const r = { ...baseReserva, dataCheckIn: null, dataCheckOut: null };
    render(<table><tbody><ReservaDesktopRow r={r} {...handlers()} /></tbody></table>);
    const dashes = screen.getAllByText('\u2014');
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });
});

describe('ReservaMobileCard', () => {
  it('renders guest name', () => {
    render(<ReservaMobileCard r={baseReserva} {...handlers()} />);
    expect(screen.getByText('Joao')).toBeDefined();
  });

  it('renders quarto number', () => {
    render(<ReservaMobileCard r={baseReserva} {...handlers()} />);
    expect(screen.getByText('101')).toBeDefined();
  });

  it('shows Check-in button for confirmada', () => {
    render(<ReservaMobileCard r={baseReserva} {...handlers()} />);
    expect(screen.getByTitle('Check-in')).toBeDefined();
  });

  it('shows Check-out button for checkin status', () => {
    const r = { ...baseReserva, status: 'checkin' };
    render(<ReservaMobileCard r={r} {...handlers()} />);
    expect(screen.getByTitle('Check-out')).toBeDefined();
  });

  it('uses hospede.nome fallback', () => {
    const r = { ...baseReserva, nomeHospede: undefined, hospede: { nome: 'Ana' } };
    render(<ReservaMobileCard r={r} {...handlers()} />);
    expect(screen.getByText('Ana')).toBeDefined();
  });

  it('renders valor', () => {
    render(<ReservaMobileCard r={baseReserva} {...handlers()} />);
    expect(document.body.textContent).toContain('800');
  });

  it('handles null quartoId fallback to quartoNumero', () => {
    const r = { ...baseReserva, numeroQuarto: undefined, quartoNumero: '505', quartoId: undefined };
    render(<ReservaMobileCard r={r} {...handlers()} />);
    expect(screen.getByText('505')).toBeDefined();
  });
});
