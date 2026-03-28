import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

const CONFIG = {
  ativo: { label: 'Ativo', cls: 'bg-emerald-100 text-emerald-700' },
  inativo: { label: 'Inativo', cls: 'bg-red-100 text-red-700' },
};

describe('StatusBadge', () => {
  it('should render label from config', () => {
    render(<StatusBadge status="ativo" config={CONFIG} />);
    expect(screen.getByText('Ativo')).toBeDefined();
  });

  it('should apply color classes from config', () => {
    render(<StatusBadge status="ativo" config={CONFIG} />);
    const badge = screen.getByText('Ativo');
    expect(badge.className).toContain('bg-emerald-100');
  });

  it('should fallback for unknown status', () => {
    render(<StatusBadge status="desconhecido" config={CONFIG} />);
    expect(screen.getByText('desconhecido')).toBeDefined();
  });
});
