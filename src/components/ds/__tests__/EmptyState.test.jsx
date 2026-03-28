import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';
import { Inbox } from 'lucide-react';

describe('EmptyState', () => {
  it('should render message', () => {
    render(<EmptyState icon={Inbox} message="Nenhum item" />);
    expect(screen.getByText('Nenhum item')).toBeDefined();
  });

  it('should render sub message', () => {
    render(<EmptyState icon={Inbox} message="Vazio" subMessage="Adicione um item" />);
    expect(screen.getByText('Adicione um item')).toBeDefined();
  });

  it('should render action button and call onClick', () => {
    const onClick = vi.fn();
    render(<EmptyState icon={Inbox} message="Vazio" action={{ label: 'Adicionar', onClick }} />);
    fireEvent.click(screen.getByText('Adicionar'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
