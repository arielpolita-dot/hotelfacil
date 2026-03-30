import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FornecedorFormModal } from '../FornecedorFormModal';

const defaultForm = {
  nome: '', tipo: 'juridica', cnpj: '', cpf: '', email: '', telefone: '',
  contato: '', endereco: '', cidade: '', estado: '', cep: '', observacoes: '',
};

const renderModal = (overrides = {}) => {
  const props = {
    open: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    editingFornecedor: null,
    form: { ...defaultForm },
    onChange: vi.fn(),
    saving: false,
    ...overrides,
  };
  return { ...render(<FornecedorFormModal {...props} />), props };
};

describe('FornecedorFormModal', () => {
  it('renders Novo Fornecedor title when not editing', () => {
    renderModal();
    expect(screen.getByText('Novo Fornecedor')).toBeDefined();
  });

  it('renders Editar Fornecedor title when editing', () => {
    renderModal({ editingFornecedor: 'f1' });
    expect(screen.getByText('Editar Fornecedor')).toBeDefined();
  });

  it('renders CNPJ label for juridica type', () => {
    renderModal({ form: { ...defaultForm, tipo: 'juridica' } });
    expect(screen.getByText('CNPJ')).toBeDefined();
  });

  it('renders CPF label for fisica type', () => {
    renderModal({ form: { ...defaultForm, tipo: 'fisica' } });
    expect(screen.getByText('CPF')).toBeDefined();
  });

  it('calls onChange on tipo radio click', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByText('Pessoa Fisica'));
    expect(props.onChange).toHaveBeenCalledWith('tipo', 'fisica');
  });

  it('calls onChange when name is typed', () => {
    const { props } = renderModal();
    const nameInput = screen.getByPlaceholderText('Nome do fornecedor');
    fireEvent.change(nameInput, { target: { value: 'test' } });
    expect(props.onChange).toHaveBeenCalledWith('nome', 'TEST');
  });

  it('calls onSave on Cadastrar button click', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByText('Cadastrar Fornecedor'));
    expect(props.onSave).toHaveBeenCalled();
  });

  it('calls onClose on Cancelar button click', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByText('Cancelar'));
    expect(props.onClose).toHaveBeenCalled();
  });

  it('shows Salvar Alteracoes when editing', () => {
    renderModal({ editingFornecedor: 'f1' });
    expect(screen.getByText('Salvar Alteracoes')).toBeDefined();
  });

  it('shows Salvando... when saving', () => {
    renderModal({ saving: true });
    expect(screen.getByText('Salvando...')).toBeDefined();
  });

  it('renders all form fields', () => {
    renderModal();
    expect(screen.getByPlaceholderText('Nome do fornecedor')).toBeDefined();
    expect(screen.getByPlaceholderText('(00) 00000-0000')).toBeDefined();
    expect(screen.getByPlaceholderText('email@empresa.com')).toBeDefined();
    expect(screen.getByPlaceholderText('Responsavel')).toBeDefined();
    expect(screen.getByPlaceholderText('Rua, numero, complemento')).toBeDefined();
    expect(screen.getByPlaceholderText('Cidade')).toBeDefined();
    expect(screen.getByPlaceholderText('UF')).toBeDefined();
    expect(screen.getByPlaceholderText('00000-000')).toBeDefined();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <FornecedorFormModal open={false} onClose={vi.fn()} onSave={vi.fn()}
        editingFornecedor={null} form={defaultForm} onChange={vi.fn()} saving={false} />
    );
    expect(container.textContent).toBe('');
  });

  it('masks CEP input', () => {
    const { props } = renderModal();
    const cep = screen.getByPlaceholderText('00000-000');
    fireEvent.change(cep, { target: { value: '12345678' } });
    expect(props.onChange).toHaveBeenCalledWith('cep', '12345-678');
  });

  it('limits estado to 2 uppercase chars', () => {
    const { props } = renderModal();
    const estado = screen.getByPlaceholderText('UF');
    fireEvent.change(estado, { target: { value: 'spx' } });
    expect(props.onChange).toHaveBeenCalledWith('estado', 'SP');
  });
});
