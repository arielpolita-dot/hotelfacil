import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DespesaFormModal, CATEGORIAS, STATUS_LIST, STATUS_CFG } from '../DespesaFormModal';

const baseForm = {
  descricao: '', categoria: 'Outros', valor: '', data: '2026-03-15',
  status: 'pendente', fornecedor: '', observacoes: '', id: null,
};

const renderModal = (overrides = {}) => {
  const props = {
    open: true,
    onClose: vi.fn(),
    form: { ...baseForm },
    set: (f) => (e) => {},
    onSave: vi.fn(),
    saving: false,
    fornecedores: [
      { id: 'fn1', nome: 'Fornecedor A' },
      { id: 'fn2', nome: 'Fornecedor B' },
    ],
    adicionarFornecedor: vi.fn().mockResolvedValue('fn-new'),
    ...overrides,
  };
  return { ...render(<DespesaFormModal {...props} />), props };
};

describe('DespesaFormModal', () => {
  it('renders Nova Despesa title for new', () => {
    renderModal();
    expect(screen.getByText('Nova Despesa')).toBeDefined();
  });

  it('renders Editar Despesa title when form has id', () => {
    renderModal({ form: { ...baseForm, id: 'd1' } });
    expect(screen.getByText('Editar Despesa')).toBeDefined();
  });

  it('renders all form fields', () => {
    renderModal();
    expect(screen.getByText(/Descricao/i)).toBeDefined();
    expect(screen.getByText('Categoria')).toBeDefined();
    expect(screen.getByText('Valor (R$)')).toBeDefined();
    expect(screen.getByText('Data')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
    expect(screen.getByText('Fornecedor')).toBeDefined();
  });

  it('renders category options', () => {
    renderModal();
    CATEGORIAS.forEach(c => {
      expect(document.body.textContent).toContain(c);
    });
  });

  it('renders save button', () => {
    renderModal();
    expect(screen.getByText(/Salvar/i)).toBeDefined();
  });

  it('calls onClose on Cancelar click', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByText('Cancelar'));
    expect(props.onClose).toHaveBeenCalled();
  });

  it('calls onSave on Salvar click', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByText(/Salvar/i));
    expect(props.onSave).toHaveBeenCalled();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <DespesaFormModal open={false} onClose={vi.fn()} form={baseForm}
        set={() => () => {}} onSave={vi.fn()} saving={false}
        fornecedores={[]} adicionarFornecedor={vi.fn()} />
    );
    expect(container.textContent).toBe('');
  });

  it('exports CATEGORIAS, STATUS_LIST, STATUS_CFG', () => {
    expect(CATEGORIAS).toBeDefined();
    expect(CATEGORIAS.length).toBeGreaterThan(0);
    expect(STATUS_LIST).toBeDefined();
    expect(STATUS_CFG).toBeDefined();
    expect(STATUS_CFG.pendente.label).toBe('Pendente');
  });

  it('renders loading state when saving', () => {
    renderModal({ saving: true });
    // The save button should still be present
    expect(screen.getByText('Salvar')).toBeDefined();
  });

  it('renders fornecedor search section', () => {
    renderModal();
    expect(screen.getByText('Fornecedor')).toBeDefined();
  });
});
