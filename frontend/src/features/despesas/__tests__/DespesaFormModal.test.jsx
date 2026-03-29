import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DespesaFormModal, CATEGORIAS, STATUS_LIST, STATUS_CFG } from '../DespesaFormModal';

describe('DespesaFormModal exports', () => {
  it('exports CATEGORIAS', () => {
    expect(CATEGORIAS).toBeDefined();
    expect(CATEGORIAS.length).toBeGreaterThan(3);
    expect(CATEGORIAS).toContain('Alimentacao');
  });

  it('exports STATUS_LIST', () => {
    expect(STATUS_LIST).toEqual(['pendente', 'pago', 'cancelado']);
  });

  it('exports STATUS_CFG', () => {
    expect(STATUS_CFG.pendente.label).toBe('Pendente');
    expect(STATUS_CFG.pago.label).toBe('Pago');
  });
});

describe('DespesaFormModal', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    form: { id: null, descricao: '', categoria: 'Outros', valor: '', data: '2026-03-15', status: 'pendente', fornecedor: '', observacoes: '' },
    set: () => vi.fn(),
    onSave: vi.fn(),
    saving: false,
    fornecedores: [{ id: 'fn1', nome: 'Fornecedor A' }],
    adicionarFornecedor: vi.fn(),
  };

  it('renders new despesa modal', () => {
    render(<DespesaFormModal {...defaultProps} />);
    expect(screen.getByText('Nova Despesa')).toBeDefined();
  });

  it('renders edit despesa modal when form has id', () => {
    render(<DespesaFormModal {...defaultProps} form={{ ...defaultProps.form, id: 'd1' }} />);
    expect(screen.getByText('Editar Despesa')).toBeDefined();
  });
});
