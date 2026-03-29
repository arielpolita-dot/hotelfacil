import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell } from '../NotificationBell';

describe('NotificationBell', () => {
  it('renders bell button', () => {
    render(<NotificationBell despesas={[]} />);
    expect(screen.getByTitle('Alertas financeiros')).toBeDefined();
  });

  it('shows no badge when no alerts', () => {
    const { container } = render(<NotificationBell despesas={[]} />);
    // No badge element (span with number)
    expect(container.querySelector('.absolute.bg-red-500')).toBeNull();
  });

  it('shows badge count for overdue expenses', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const despesas = [
      { id: '1', status: 'pendente', data: yesterday.toISOString().split('T')[0], valor: 100, descricao: 'Test' },
    ];
    render(<NotificationBell despesas={despesas} />);
    expect(screen.getByText('1')).toBeDefined();
  });

  it('opens dropdown on click', () => {
    render(<NotificationBell despesas={[]} />);
    fireEvent.click(screen.getByTitle('Alertas financeiros'));
    expect(screen.getByText(/Nenhum alerta/i)).toBeDefined();
  });

  it('shows overdue expenses in dropdown', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    const despesas = [
      { id: '1', status: 'pendente', data: yesterday.toISOString().split('T')[0], valor: 150, descricao: 'Luz' },
    ];
    render(<NotificationBell despesas={despesas} />);
    fireEvent.click(screen.getByTitle('Alertas financeiros'));
    expect(screen.getByText('Luz')).toBeDefined();
  });
});
