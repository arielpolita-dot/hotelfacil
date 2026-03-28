import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render spinner', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeDefined();
  });

  it('should show message when provided', () => {
    render(<LoadingSpinner message="Carregando..." />);
    expect(screen.getByText('Carregando...')).toBeDefined();
  });

  it('should apply size classes', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    expect(container.querySelector('.w-16')).toBeDefined();
  });
});
