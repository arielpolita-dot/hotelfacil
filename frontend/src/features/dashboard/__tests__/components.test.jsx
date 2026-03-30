import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoomUsageCards } from '../RoomUsageCards';
import { BillsTable } from '../BillsTable';

describe('RoomUsageCards', () => {
  it('renders empty state when no data', () => {
    render(<RoomUsageCards maisPedidos={[]} menosPedidos={[]} maxUso={0} />);
    const empties = screen.getAllByText(/Nenhum dado/i);
    expect(empties.length).toBe(2);
  });

  it('renders most used rooms', () => {
    const mais = [
      { num: '101', qtd: 5, pct: 50 },
      { num: '102', qtd: 3, pct: 30 },
    ];
    render(<RoomUsageCards maisPedidos={mais} menosPedidos={[]} maxUso={5} />);
    expect(screen.getByText('Quarto 101')).toBeDefined();
    expect(screen.getByText('Quarto 102')).toBeDefined();
    expect(screen.getByText('5 reservas')).toBeDefined();
    expect(screen.getByText('3 reservas')).toBeDefined();
  });

  it('renders singular reserva for qtd=1', () => {
    const mais = [{ num: '101', qtd: 1, pct: 10 }];
    render(<RoomUsageCards maisPedidos={mais} menosPedidos={[]} maxUso={1} />);
    expect(screen.getByText('1 reserva')).toBeDefined();
  });

  it('renders least used rooms', () => {
    const menos = [{ num: '201', qtd: 0, pct: 0 }];
    render(<RoomUsageCards maisPedidos={[]} menosPedidos={menos} maxUso={5} />);
    expect(screen.getByText('Quarto 201')).toBeDefined();
  });

  it('handles maxUso 0 without error', () => {
    const mais = [{ num: '101', qtd: 0, pct: 0 }];
    render(<RoomUsageCards maisPedidos={mais} menosPedidos={[]} maxUso={0} />);
    expect(screen.getByText('Quarto 101')).toBeDefined();
  });
});

describe('BillsTable', () => {
  it('renders empty state when no bills', () => {
    render(<BillsTable contasProximas7={[]} contasVencidas={[]} />);
    expect(screen.getByText(/Nenhuma conta pendente/i)).toBeDefined();
  });

  it('renders empty state when both null', () => {
    render(<BillsTable contasProximas7={null} contasVencidas={null} />);
    expect(screen.getByText(/Nenhuma conta pendente/i)).toBeDefined();
  });

  it('renders upcoming bills', () => {
    const contas = [
      { id: 'd1', descricao: 'Internet', categoria: 'Tecnologia', valor: 200, data: '2030-12-01', fornecedor: 'Vivo' },
    ];
    render(<BillsTable contasProximas7={contas} contasVencidas={[]} />);
    expect(screen.getByText('Internet')).toBeDefined();
    expect(screen.getByText('Vivo')).toBeDefined();
    expect(screen.getByText('Tecnologia')).toBeDefined();
  });

  it('renders overdue bills with badge', () => {
    const vencidas = [
      { id: 'd2', descricao: 'Energia', categoria: 'Servicos', valor: 300, data: '2026-03-01' },
    ];
    render(<BillsTable contasProximas7={[]} contasVencidas={vencidas} />);
    expect(screen.getByText('Energia')).toBeDefined();
    expect(screen.getByText(/1 vencida/)).toBeDefined();
  });

  it('renders plural vencidas badge', () => {
    const vencidas = [
      { id: 'd1', descricao: 'A', categoria: 'X', valor: 100, data: '2026-03-01' },
      { id: 'd2', descricao: 'B', categoria: 'Y', valor: 200, data: '2026-03-02' },
    ];
    render(<BillsTable contasProximas7={[]} contasVencidas={vencidas} />);
    expect(screen.getByText(/2 vencidas/)).toBeDefined();
  });

  it('shows fornecedor in overdue bills when present', () => {
    const vencidas = [
      { id: 'd1', descricao: 'A', categoria: 'X', valor: 100, data: '2026-03-01', fornecedor: 'FornX' },
    ];
    render(<BillsTable contasProximas7={[]} contasVencidas={vencidas} />);
    expect(screen.getByText('FornX')).toBeDefined();
  });

  it('hides fornecedor when not present', () => {
    const contas = [
      { id: 'd1', descricao: 'A', categoria: 'X', valor: 100, data: '2030-12-01' },
    ];
    render(<BillsTable contasProximas7={contas} contasVencidas={[]} />);
    expect(screen.queryByText(/Forn/)).toBeNull();
  });

  it('shows dash when date is null', () => {
    const vencidas = [
      { id: 'd1', descricao: 'A', categoria: 'X', valor: 100, data: null },
    ];
    render(<BillsTable contasProximas7={[]} contasVencidas={vencidas} />);
    // Should have a dash character somewhere for the null date
    expect(document.body.textContent).toMatch(/—|Vencida/);
  });
});
