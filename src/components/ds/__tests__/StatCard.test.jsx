import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '../StatCard';
import { DollarSign } from 'lucide-react';

describe('StatCard', () => {
  it('should render title and value', () => {
    render(<StatCard title="Receita" value="R$ 1.000" />);
    expect(screen.getByText('Receita')).toBeDefined();
    expect(screen.getByText('R$ 1.000')).toBeDefined();
  });

  it('should render sub text', () => {
    render(<StatCard title="Receita" value="R$ 1.000" sub="Este mes" />);
    expect(screen.getByText('Este mes')).toBeDefined();
  });

  it('should render icon when provided', () => {
    const { container } = render(<StatCard title="Receita" value="R$ 1.000" icon={DollarSign} iconBg="bg-blue-500" />);
    expect(container.querySelector('svg')).toBeDefined();
  });
});
