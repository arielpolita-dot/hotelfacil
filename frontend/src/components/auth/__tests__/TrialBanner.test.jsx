import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TrialBanner from '../TrialBanner';

describe('TrialBanner', () => {
  it('renders days remaining text', () => {
    render(<TrialBanner diasRestantes={5} onClose={vi.fn()} />);
    expect(screen.getByText(/5 dias restantes/)).toBeDefined();
  });

  it('shows urgent message on last day', () => {
    render(<TrialBanner diasRestantes={1} onClose={vi.fn()} />);
    expect(screen.getByText(/ltimo dia de teste/i)).toBeDefined();
  });

  it('calls onClose when X button clicked', () => {
    const onClose = vi.fn();
    render(<TrialBanner diasRestantes={3} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Fechar'));
    expect(onClose).toHaveBeenCalled();
  });
});
