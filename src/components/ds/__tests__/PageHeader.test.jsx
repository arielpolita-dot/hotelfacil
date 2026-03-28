import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from '../PageHeader';

describe('PageHeader', () => {
  it('should render title', () => {
    render(<PageHeader title="Quartos" />);
    expect(screen.getByText('Quartos')).toBeDefined();
  });

  it('should render subtitle', () => {
    render(<PageHeader title="Quartos" subtitle="Gerencie os quartos do hotel" />);
    expect(screen.getByText('Gerencie os quartos do hotel')).toBeDefined();
  });

  it('should render actions', () => {
    render(<PageHeader title="Quartos" actions={<button>Novo</button>} />);
    expect(screen.getByText('Novo')).toBeDefined();
  });
});
