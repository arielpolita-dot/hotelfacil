import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TrialExpired from '../TrialExpired';

describe('TrialExpired', () => {
  it('renders expired title', () => {
    render(<TrialExpired empresaNome="Hotel Teste" onLogout={vi.fn()} />);
    expect(screen.getByText(/Expirado/i)).toBeDefined();
  });

  it('renders empresa name', () => {
    render(<TrialExpired empresaNome="Hotel Teste" onLogout={vi.fn()} />);
    expect(screen.getByText('Hotel Teste')).toBeDefined();
  });
});
