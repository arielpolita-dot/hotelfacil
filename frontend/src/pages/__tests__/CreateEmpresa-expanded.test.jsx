import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateEmpresa from '../CreateEmpresa';

const mockCreateEmpresa = vi.fn();

vi.mock('../../context/EmpresaContext', () => ({
  useEmpresa: () => ({
    createEmpresa: mockCreateEmpresa,
  }),
}));

function renderPage() {
  return render(<BrowserRouter><CreateEmpresa /></BrowserRouter>);
}

describe('CreateEmpresa (expanded)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateEmpresa.mockResolvedValue({ id: 'e-new' });
  });

  it('submit button is disabled when nome is empty', () => {
    renderPage();
    const btn = screen.getByText('Criar Hotel');
    expect(btn.disabled).toBe(true);
  });

  it('submit button enabled when nome has text', () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/Hotel Fazenda/), { target: { value: 'Hotel Test' } });
    const btn = screen.getByText('Criar Hotel');
    expect(btn.disabled).toBe(false);
  });

  it('submit button disabled when nome is only spaces', () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/Hotel Fazenda/), { target: { value: '   ' } });
    const btn = screen.getByText('Criar Hotel');
    expect(btn.disabled).toBe(true);
  });

  it('calls createEmpresa on submit with nome only', async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/Hotel Fazenda/), { target: { value: 'Hotel ABC' } });
    fireEvent.submit(screen.getByText('Criar Hotel').closest('form'));
    await waitFor(() => {
      expect(mockCreateEmpresa).toHaveBeenCalledWith({
        nome: 'Hotel ABC',
        cnpj: undefined,
        telefone: undefined,
        endereco: undefined,
      });
    });
  });

  it('passes cnpj when filled', async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/Hotel Fazenda/), { target: { value: 'Hotel X' } });
    fireEvent.change(screen.getByPlaceholderText(/00\.000\.000/), { target: { value: '12.345.678/0001-90' } });
    fireEvent.submit(screen.getByText('Criar Hotel').closest('form'));
    await waitFor(() => {
      expect(mockCreateEmpresa).toHaveBeenCalledWith(expect.objectContaining({
        cnpj: '12.345.678/0001-90',
      }));
    });
  });

  it('passes telefone when filled', async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/Hotel Fazenda/), { target: { value: 'Hotel X' } });
    fireEvent.change(screen.getByPlaceholderText(/99999-9999/), { target: { value: '(11) 99999-9999' } });
    fireEvent.submit(screen.getByText('Criar Hotel').closest('form'));
    await waitFor(() => {
      expect(mockCreateEmpresa).toHaveBeenCalledWith(expect.objectContaining({
        telefone: '(11) 99999-9999',
      }));
    });
  });

  it('passes endereco when filled', async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/Hotel Fazenda/), { target: { value: 'Hotel X' } });
    fireEvent.change(screen.getByPlaceholderText(/Rua das Flores/), { target: { value: 'Rua ABC, 123' } });
    fireEvent.submit(screen.getByText('Criar Hotel').closest('form'));
    await waitFor(() => {
      expect(mockCreateEmpresa).toHaveBeenCalledWith(expect.objectContaining({
        endereco: 'Rua ABC, 123',
      }));
    });
  });

  it('shows error message on createEmpresa failure', async () => {
    mockCreateEmpresa.mockRejectedValue(new Error('Server error'));
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/Hotel Fazenda/), { target: { value: 'Hotel X' } });
    fireEvent.submit(screen.getByText('Criar Hotel').closest('form'));
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeDefined();
    });
  });

  it('shows Criando... while saving', async () => {
    let resolve;
    mockCreateEmpresa.mockReturnValue(new Promise(r => { resolve = r; }));
    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/Hotel Fazenda/), { target: { value: 'Hotel X' } });
    fireEvent.submit(screen.getByText('Criar Hotel').closest('form'));
    await waitFor(() => {
      expect(screen.getByText('Criando...')).toBeDefined();
    });
    resolve({ id: 'e1' });
  });

  it('does not call createEmpresa when nome is empty on submit', async () => {
    renderPage();
    // Try to submit the form directly via native form submit
    const form = document.querySelector('form');
    fireEvent.submit(form);
    expect(mockCreateEmpresa).not.toHaveBeenCalled();
  });
});
