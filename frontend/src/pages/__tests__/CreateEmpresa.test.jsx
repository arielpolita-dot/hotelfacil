import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateEmpresa from '../CreateEmpresa';

// Mock EmpresaContext
vi.mock('../../context/EmpresaContext', () => ({
  useEmpresa: () => ({
    createEmpresa: vi.fn(),
  }),
}));

function renderPage() {
  return render(
    <BrowserRouter>
      <CreateEmpresa />
    </BrowserRouter>
  );
}

describe('CreateEmpresa', () => {
  it('renders the page title', () => {
    renderPage();
    expect(screen.getByText('Criar seu Hotel')).toBeDefined();
  });

  it('renders description text', () => {
    renderPage();
    expect(screen.getByText(/Cadastre as informacoes/i)).toBeDefined();
  });

  it('renders nome field with required label', () => {
    renderPage();
    expect(screen.getByText(/Nome do Hotel/i)).toBeDefined();
  });

  it('renders CNPJ field', () => {
    renderPage();
    expect(screen.getByPlaceholderText(/00\.000\.000/)).toBeDefined();
  });

  it('renders telefone field', () => {
    renderPage();
    expect(screen.getByPlaceholderText(/99999-9999/)).toBeDefined();
  });

  it('renders endereco field', () => {
    renderPage();
    expect(screen.getByText(/Endereco/i)).toBeDefined();
  });
});
