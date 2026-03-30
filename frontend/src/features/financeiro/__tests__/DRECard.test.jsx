import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Card, LinhaGrupo, pct } from '../DRECard';
import { TrendingUp } from 'lucide-react';

describe('pct', () => {
  it('returns 0,0% when total is 0', () => {
    expect(pct(100, 0)).toBe('0,0%');
  });

  it('calculates percentage correctly', () => {
    expect(pct(250, 1000)).toBe('25,0%');
  });

  it('formats with comma separator', () => {
    expect(pct(333, 1000)).toBe('33,3%');
  });
});

describe('Card (DRECard)', () => {
  it('renders title and value', () => {
    render(<Card title="Receita" value="R$ 1.000" icon={TrendingUp} />);
    expect(screen.getByText('Receita')).toBeDefined();
    expect(screen.getByText('R$ 1.000')).toBeDefined();
  });

  it('renders sub text when provided', () => {
    render(<Card title="T" value="V" icon={TrendingUp} sub="Some sub" />);
    expect(screen.getByText('Some sub')).toBeDefined();
  });

  it('does not render sub when not provided', () => {
    render(<Card title="T" value="V" icon={TrendingUp} />);
    expect(screen.queryByText('Some sub')).toBeNull();
  });

  it('renders positive trend', () => {
    render(<Card title="T" value="V" icon={TrendingUp} trend={5.2} />);
    expect(screen.getByText(/\+5,2%/)).toBeDefined();
  });

  it('renders negative trend', () => {
    render(<Card title="T" value="V" icon={TrendingUp} trend={-3.1} />);
    expect(screen.getByText(/-3,1%/)).toBeDefined();
  });

  it('does not render trend when undefined', () => {
    render(<Card title="T" value="V" icon={TrendingUp} />);
    expect(screen.queryByText(/vs m/)).toBeNull();
  });

  it('renders zero trend as positive', () => {
    render(<Card title="T" value="V" icon={TrendingUp} trend={0} />);
    expect(screen.getByText(/\+0,0%/)).toBeDefined();
  });

  it('renders with green color', () => {
    const { container } = render(<Card title="T" value="V" icon={TrendingUp} color="green" />);
    expect(container.innerHTML).toContain('emerald');
  });

  it('renders with red color', () => {
    const { container } = render(<Card title="T" value="V" icon={TrendingUp} color="red" />);
    expect(container.innerHTML).toContain('red');
  });

  it('renders with violet color', () => {
    const { container } = render(<Card title="T" value="V" icon={TrendingUp} color="violet" />);
    expect(container.innerHTML).toContain('violet');
  });

  it('renders with amber color', () => {
    const { container } = render(<Card title="T" value="V" icon={TrendingUp} color="amber" />);
    expect(container.innerHTML).toContain('amber');
  });

  it('defaults to blue color', () => {
    const { container } = render(<Card title="T" value="V" icon={TrendingUp} />);
    expect(container.innerHTML).toContain('blue');
  });
});

describe('LinhaGrupo', () => {
  const itens = [
    { descricao: 'Item A', valor: 100 },
    { descricao: 'Item B', valor: 200 },
  ];

  it('renders grupo name and item count', () => {
    render(
      <table><tbody><LinhaGrupo grupo="Alimentacao" itens={itens} totalReceita={1000} /></tbody></table>
    );
    expect(screen.getByText('Alimentacao')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
  });

  it('shows total in red', () => {
    render(
      <table><tbody><LinhaGrupo grupo="Alimentacao" itens={itens} totalReceita={1000} /></tbody></table>
    );
    // Total is 300
    expect(screen.getByText(/R\$\s*300/)).toBeDefined();
  });

  it('shows percentage of total receita', () => {
    render(
      <table><tbody><LinhaGrupo grupo="Alimentacao" itens={itens} totalReceita={1000} /></tbody></table>
    );
    expect(screen.getByText('30,0%')).toBeDefined();
  });

  it('expands to show items on click', () => {
    render(
      <table><tbody><LinhaGrupo grupo="Alimentacao" itens={itens} totalReceita={1000} /></tbody></table>
    );
    // Items should be hidden initially
    expect(screen.queryByText('Item A')).toBeNull();
    // Click to expand
    fireEvent.click(screen.getByText('Alimentacao'));
    expect(screen.getByText('Item A')).toBeDefined();
    expect(screen.getByText('Item B')).toBeDefined();
  });

  it('collapses on second click', () => {
    render(
      <table><tbody><LinhaGrupo grupo="Alimentacao" itens={itens} totalReceita={1000} /></tbody></table>
    );
    fireEvent.click(screen.getByText('Alimentacao'));
    expect(screen.getByText('Item A')).toBeDefined();
    fireEvent.click(screen.getByText('Alimentacao'));
    expect(screen.queryByText('Item A')).toBeNull();
  });

  it('uses categoria when descricao missing', () => {
    const items = [{ categoria: 'Servicos', valor: 50 }];
    render(
      <table><tbody><LinhaGrupo grupo="Outros" itens={items} totalReceita={1000} /></tbody></table>
    );
    fireEvent.click(screen.getByText('Outros'));
    expect(screen.getByText('Servicos')).toBeDefined();
  });

  it('shows dash when both descricao and categoria missing', () => {
    const items = [{ valor: 50 }];
    render(
      <table><tbody><LinhaGrupo grupo="Outros" itens={items} totalReceita={1000} /></tbody></table>
    );
    fireEvent.click(screen.getByText('Outros'));
    expect(screen.getByText('—')).toBeDefined();
  });
});
