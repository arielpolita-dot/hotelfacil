import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FaturaFormModal } from '../FaturaFormModal';

const baseFormData = {
  empresaCliente: '', cnpj: '', contato: '', email: '', telefone: '', endereco: '',
  tipoContrato: 'Mensal Fixo', periodicidadeFatura: 'Mensal',
  dataInicio: '2026-03-01', dataFim: '2027-03-01',
  valorMensal: '5000', status: 'Ativo',
  quartosInclusos: [], observacoes: '',
};

const renderModal = (overrides = {}) => {
  const props = {
    open: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    editingFatura: null,
    formData: { ...baseFormData },
    handleInputChange: vi.fn(),
    valorTotal: 60000,
    proximaFatura: '2026-04-01',
    quartos: [
      { id: 'q1', numero: 101 },
      { id: 'q2', numero: 202 },
    ],
    ...overrides,
  };
  return { ...render(<FaturaFormModal {...props} />), props };
};

describe('FaturaFormModal', () => {
  it('renders Novo Contrato title when not editing', () => {
    renderModal();
    expect(screen.getByText(/Novo Contrato/i)).toBeDefined();
  });

  it('renders Editar Contrato title when editing', () => {
    renderModal({ editingFatura: { id: 'ft1' } });
    expect(screen.getByText('Editar Contrato')).toBeDefined();
  });

  it('renders form sections', () => {
    renderModal();
    expect(screen.getByText('Dados da Empresa Cliente')).toBeDefined();
    expect(screen.getByText('Dados do Contrato')).toBeDefined();
    expect(screen.getByText('Quartos Inclusos no Contrato')).toBeDefined();
    expect(screen.getByText('Resumo Financeiro')).toBeDefined();
  });

  it('renders quarto checkboxes', () => {
    renderModal();
    expect(screen.getByText('Quarto 101')).toBeDefined();
    expect(screen.getByText('Quarto 202')).toBeDefined();
  });

  it('shows Criar Contrato button when new', () => {
    renderModal();
    expect(screen.getByText(/Criar Contrato/i)).toBeDefined();
  });

  it('shows Atualizar Contrato button when editing', () => {
    renderModal({ editingFatura: { id: 'ft1' } });
    expect(screen.getByText(/Atualizar Contrato/i)).toBeDefined();
  });

  it('calls onSave on submit', () => {
    const { props } = renderModal();
    const form = document.querySelector('form');
    fireEvent.submit(form);
    expect(props.onSave).toHaveBeenCalled();
  });

  it('calls onClose on Cancelar', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByText('Cancelar'));
    expect(props.onClose).toHaveBeenCalled();
  });

  it('renders valor total', () => {
    renderModal();
    expect(document.body.textContent).toContain('60.000');
  });

  it('renders proxima fatura date', () => {
    renderModal();
    // Date should be formatted as pt-BR
    expect(document.body.textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('shows dash when proximaFatura is null', () => {
    renderModal({ proximaFatura: null });
    expect(screen.getByText('-')).toBeDefined();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <FaturaFormModal open={false} onClose={vi.fn()} onSave={vi.fn()}
        editingFatura={null} formData={baseFormData} handleInputChange={vi.fn()}
        valorTotal={0} proximaFatura={null} quartos={[]} />
    );
    expect(container.textContent).toBe('');
  });
});
