import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReminderModal } from '../ReminderModal';

describe('ReminderModal', () => {
  it('returns null when not open', () => {
    const { container } = render(
      <ReminderModal open={false} onClose={vi.fn()} contasVencidas={[]} contasHoje={[]} />
    );
    // Portal renders to body but nothing should be visible
    expect(screen.queryByText('Lembrete Financeiro')).toBeNull();
  });

  it('renders title when open', () => {
    render(<ReminderModal open={true} onClose={vi.fn()} contasVencidas={[]} contasHoje={[]} />);
    expect(screen.getByText('Lembrete Financeiro')).toBeDefined();
  });

  it('renders contas vencidas', () => {
    const vencidas = [
      { id: 'd1', descricao: 'Conta Luz', valor: 200, data: '2026-03-01', fornecedor: 'CPFL' },
    ];
    render(<ReminderModal open={true} onClose={vi.fn()} contasVencidas={vencidas} contasHoje={[]} />);
    expect(screen.getByText('Conta Luz')).toBeDefined();
    expect(screen.getByText(/1 conta vencida/)).toBeDefined();
  });

  it('renders pluralized vencidas text', () => {
    const vencidas = [
      { id: 'd1', descricao: 'Conta A', valor: 100, data: '2026-03-01' },
      { id: 'd2', descricao: 'Conta B', valor: 200, data: '2026-03-02' },
    ];
    render(<ReminderModal open={true} onClose={vi.fn()} contasVencidas={vencidas} contasHoje={[]} />);
    expect(screen.getByText(/2 contas vencidas/)).toBeDefined();
  });

  it('renders contas hoje', () => {
    const hoje = [
      { id: 'd3', descricao: 'Internet', valor: 150, categoria: 'Tecnologia', fornecedor: 'Vivo' },
    ];
    render(<ReminderModal open={true} onClose={vi.fn()} contasVencidas={[]} contasHoje={hoje} />);
    expect(screen.getByText('Internet')).toBeDefined();
    expect(screen.getByText(/1 conta vence hoje/)).toBeDefined();
  });

  it('renders pluralized contas hoje text', () => {
    const hoje = [
      { id: 'd3', descricao: 'A', valor: 100, categoria: 'X' },
      { id: 'd4', descricao: 'B', valor: 200, categoria: 'Y' },
    ];
    render(<ReminderModal open={true} onClose={vi.fn()} contasVencidas={[]} contasHoje={hoje} />);
    expect(screen.getByText(/2 contas vencem hoje/)).toBeDefined();
  });

  it('renders total with both vencidas and hoje', () => {
    const vencidas = [{ id: 'd1', descricao: 'A', valor: 100, data: '2026-03-01' }];
    const hoje = [{ id: 'd2', descricao: 'B', valor: 200, categoria: 'X' }];
    render(<ReminderModal open={true} onClose={vi.fn()} contasVencidas={vencidas} contasHoje={hoje} />);
    expect(screen.getByText('Total a pagar:')).toBeDefined();
  });

  it('calls onClose when Entendido clicked', () => {
    const onClose = vi.fn();
    render(<ReminderModal open={true} onClose={onClose} contasVencidas={[]} contasHoje={[]} />);
    fireEvent.click(screen.getByText('Entendido'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when X button clicked', () => {
    const onClose = vi.fn();
    render(<ReminderModal open={true} onClose={onClose} contasVencidas={[]} contasHoje={[]} />);
    // X button is the small close button in the header
    const buttons = screen.getAllByRole('button');
    // First button is close, last is Entendido
    fireEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('handles vencida with toDate function on data', () => {
    const vencidas = [{
      id: 'd1', descricao: 'Special', valor: 100,
      data: { toDate: () => new Date('2026-03-01T12:00:00') },
    }];
    render(<ReminderModal open={true} onClose={vi.fn()} contasVencidas={vencidas} contasHoje={[]} />);
    expect(screen.getByText('Special')).toBeDefined();
    // Should show a formatted date
    expect(document.body.textContent).toMatch(/01\/03/);
  });

  it('shows dash for null date', () => {
    const vencidas = [{ id: 'd1', descricao: 'NullDate', valor: 100, data: null }];
    render(<ReminderModal open={true} onClose={vi.fn()} contasVencidas={vencidas} contasHoje={[]} />);
    expect(screen.getByText(/—/)).toBeDefined();
  });

  it('shows fornecedor when present in vencidas', () => {
    const vencidas = [{ id: 'd1', descricao: 'X', valor: 100, data: '2026-03-01', fornecedor: 'FornX' }];
    render(<ReminderModal open={true} onClose={vi.fn()} contasVencidas={vencidas} contasHoje={[]} />);
    expect(screen.getByText(/FornX/)).toBeDefined();
  });

  it('shows fornecedor in hoje items', () => {
    const hoje = [{ id: 'd1', descricao: 'Y', valor: 100, categoria: 'Cat', fornecedor: 'FornY' }];
    render(<ReminderModal open={true} onClose={vi.fn()} contasVencidas={[]} contasHoje={hoje} />);
    expect(screen.getByText(/FornY/)).toBeDefined();
  });
});
