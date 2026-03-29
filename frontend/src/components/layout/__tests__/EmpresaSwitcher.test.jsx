import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmpresaSwitcher } from '../EmpresaSwitcher';

vi.mock('../../../context/EmpresaContext', () => ({
  useEmpresa: vi.fn(),
}));

import { useEmpresa } from '../../../context/EmpresaContext';

describe('EmpresaSwitcher', () => {
  it('renders nothing when no active empresa', () => {
    useEmpresa.mockReturnValue({
      activeEmpresa: null,
      companies: [],
      switchEmpresa: vi.fn(),
      createEmpresa: vi.fn(),
    });
    const { container } = render(<EmpresaSwitcher />);
    expect(container.innerHTML).toBe('');
  });

  it('renders active empresa name', () => {
    useEmpresa.mockReturnValue({
      activeEmpresa: { id: 'e1', nome: 'Hotel Praia' },
      companies: [{ id: 'e1', nome: 'Hotel Praia' }],
      switchEmpresa: vi.fn(),
      createEmpresa: vi.fn(),
    });
    render(<EmpresaSwitcher />);
    expect(screen.getByText('Hotel Praia')).toBeDefined();
  });

  it('opens dropdown on click', () => {
    useEmpresa.mockReturnValue({
      activeEmpresa: { id: 'e1', nome: 'Hotel A' },
      companies: [
        { id: 'e1', nome: 'Hotel A' },
        { id: 'e2', nome: 'Hotel B' },
      ],
      switchEmpresa: vi.fn(),
      createEmpresa: vi.fn(),
    });
    render(<EmpresaSwitcher />);
    // Click toggle button
    fireEvent.click(screen.getByText('Hotel A'));
    // Dropdown should show "Hotel B"
    expect(screen.getByText('Hotel B')).toBeDefined();
    expect(screen.getByText('Novo Hotel')).toBeDefined();
  });

  it('renders initials from empresa name', () => {
    useEmpresa.mockReturnValue({
      activeEmpresa: { id: 'e1', nome: 'Grand Hotel' },
      companies: [{ id: 'e1', nome: 'Grand Hotel' }],
      switchEmpresa: vi.fn(),
      createEmpresa: vi.fn(),
    });
    render(<EmpresaSwitcher />);
    expect(screen.getByText('GH')).toBeDefined();
  });
});
